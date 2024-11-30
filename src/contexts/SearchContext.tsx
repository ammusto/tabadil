import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { searchOpenSearch } from '../utils/searchClient';
import { generateNamePatterns } from '../utils/namePatterns';
import { SearchResult, SearchConfig, DateRange } from '../types';
import { compressToRanges, decompressRanges, isValidRangeString } from '../utils/compression';

interface SearchContextType {
  results: SearchResult[];
  totalResults: number;
  isLoading: boolean;
  error: Error | null;
  dateRange: DateRange | null;
  selectedCollections: string[];
  selectedGenres: string[];
  currentPage: number;
  itemsPerPage: number;
  selectedTextIds: number[];
  hasSearched: boolean;
  searchParams: {
    kunyas: string[];
    nasab: string;
    nisbas: string[];
    text_ids: number[];
    page: number;
    allowRareKunyaNisba: boolean;
    allowNasabBase: boolean;
    allowKunyaNasab: boolean;

  };
  updateURLParams: (params: Partial<SearchContextType['searchParams']>) => void;
  fetchNextBatchIfNeeded: (page: number) => Promise<void>;
  setDateRange: (range: DateRange | null) => void;
  setHasSearched:  React.Dispatch<React.SetStateAction<boolean>>;
  setResults: React.Dispatch<React.SetStateAction<SearchResult[]>>;
  setSelectedTextIds: React.Dispatch<React.SetStateAction<number[]>>;
  setSelectedCollections: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedGenres: React.Dispatch<React.SetStateAction<string[]>>;
}

const SearchContext = createContext<SearchContextType | null>(null);

const ITEMS_PER_PAGE = 25;
const PAGES_PER_FETCH = 10;
const MAX_RESULTS = 10000;

const parseUrlParams = (search: string) => {
  const params = new URLSearchParams(search);
  const kunyas = params.get('kunyas')?.split(',').filter(Boolean) || [];
  const nasab = params.get('nasab') || '';
  const nisbas = params.get('nisbas')?.split(',').filter(Boolean) || [];
  const textIdsParam = params.get('text_ids') || '';
  const page = parseInt(params.get('page') || '1', 10);
  const allowRareKunyaNisba = params.get('allowRareKunyaNisba') === 'true';
  const allowNasabBase = params.get('allowNasabBase') === 'true';
  const allowKunyaNasab = params.get('allowKunyaNasab') === 'true';

  let text_ids: number[] = [];
  if (textIdsParam) {
    if (isValidRangeString(textIdsParam)) {
      text_ids = decompressRanges(textIdsParam);
    } else {
      text_ids = textIdsParam.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
    }
  }

  return {
    kunyas,
    nasab,
    nisbas,
    text_ids,
    page,
    allowRareKunyaNisba,
    allowNasabBase,
    allowKunyaNasab
  };
};

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [results, setResults] = useState<SearchResult[]>([]);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | null>(null);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [searchParams, setSearchParams] = useState(parseUrlParams(location.search));
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedTextIds, setSelectedTextIds] = useState<number[]>(
    parseUrlParams(location.search).text_ids
  );

  const updateURLParams = useCallback((newParams: Partial<SearchContextType['searchParams']>) => {
    const updatedParams = { 
      ...searchParams, 
      ...newParams,
      text_ids: selectedTextIds
    };    const params = new URLSearchParams();
    
    if (updatedParams.kunyas.length > 0) {
      params.append('kunyas', updatedParams.kunyas.join(','));
    }
    if (updatedParams.nasab) {
      params.append('nasab', updatedParams.nasab);
    }
    if (updatedParams.nisbas.length > 0) {
      params.append('nisbas', updatedParams.nisbas.join(','));
    }
    if (updatedParams.text_ids.length > 0) {
      const compressedTextIds = compressToRanges(updatedParams.text_ids);
      params.append('text_ids', compressedTextIds);
    }
    if (updatedParams.page !== 1) {
      params.append('page', updatedParams.page.toString());
    }
    if (updatedParams.allowRareKunyaNisba) {
      params.append('allowRareKunyaNisba', 'true');
    }
    if (updatedParams.allowNasabBase) {
      params.append('allowNasabBase', 'true');
    }
    if (updatedParams.allowKunyaNasab) {
      params.append('allowKunyaNasab', 'true');
    }
    navigate({ search: params.toString() });
    setSearchParams(updatedParams);
  }, [navigate, searchParams, selectedTextIds]);

  const needsFetch = useCallback((page: number) => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return !results[startIndex];
  }, [results]);


  
  const fetchBatch = useCallback(async (startPage: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const batchStartPage = Math.floor((startPage - 1) / PAGES_PER_FETCH) * PAGES_PER_FETCH + 1;
      const from = (batchStartPage - 1) * ITEMS_PER_PAGE;
      const size = PAGES_PER_FETCH * ITEMS_PER_PAGE;

      const { searchPatterns, filterPatterns } = generateNamePatterns(
        searchParams.kunyas,
        searchParams.nasab,
        searchParams.nisbas,
        searchParams.allowRareKunyaNisba,
        searchParams.allowNasabBase,
        searchParams.allowKunyaNasab
      );

      const searchConfig: SearchConfig = {
        patterns: searchPatterns,
        filterPatterns,
        selectedTexts: searchParams.text_ids,
        from,
        size,
      };

      const { results: newResults, total } = await searchOpenSearch(searchConfig);


      setResults(prev => {
        const allResults = [...prev];
        for (let i = 0; i < newResults.length; i++) {
          allResults[from + i] = newResults[i];
        }
        return allResults;
      });

      setTotalResults(Math.min(total, MAX_RESULTS));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Search failed'));
    } finally {
      setIsLoading(false);
    }
  }, [searchParams]);

  const fetchNextBatchIfNeeded = useCallback(async (page: number) => {
    if (needsFetch(page)) {
      await fetchBatch(page);
    }
  }, [needsFetch, fetchBatch]);

  // Handle initial search and URL changes
  useEffect(() => {
    const searchParamsWithoutPage = new URLSearchParams(location.search);
    searchParamsWithoutPage.delete('page');
    const searchString = searchParamsWithoutPage.toString();

    if (searchString) {
      const params = parseUrlParams(location.search);
      setSearchParams(params);
      fetchBatch(params.page); // Use the actual page from URL for initial fetch
    } else {
      setResults([]);
      setTotalResults(0);
      setSearchParams(parseUrlParams(''));
    }
  }, [location.search.replace(/[?&]page=\d+/, '')]);

  useEffect(() => {
    if (location.pathname === '/' && !location.search) {
      setResults([]);
      setTotalResults(0);
      setHasSearched(false);

    }
  }, [location.pathname, location.search]);

  return (
    <SearchContext.Provider
      value={{
        results,
        totalResults,
        isLoading,
        error,
        dateRange,
        selectedCollections,
        selectedGenres,
        currentPage: searchParams.page,
        itemsPerPage: ITEMS_PER_PAGE,
        searchParams,
        hasSearched,
        selectedTextIds,
        setResults,
        setSelectedTextIds,
        setHasSearched,
        updateURLParams,
        fetchNextBatchIfNeeded,
        setDateRange,
        setSelectedCollections,
        setSelectedGenres,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};