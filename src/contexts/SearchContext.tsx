import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { searchOpenSearch } from '../utils/searchClient';
import { generateNamePatterns } from '../utils/namePatterns';
import { SearchResult, SearchConfig, DateRange } from '../types';
import { compressToRanges, decompressRanges, isValidRangeString } from '../utils/compression';

interface SearchParams {
  kunyas: string[];
  nasab: string;
  nisbas: string[];
  text_ids: number[];
  page: number;
  allowRareKunyaNisba: boolean;
  allowNasabBase: boolean;
  allowKunyaNasab: boolean;
}

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
  searchParams: SearchParams;
  updateURLParams: (params: Partial<SearchParams>) => void;
  fetchNextBatchIfNeeded: (page: number) => Promise<void>;
  setDateRange: (range: DateRange | null) => void;
  setHasSearched: React.Dispatch<React.SetStateAction<boolean>>;
  setResults: React.Dispatch<React.SetStateAction<SearchResult[]>>;
  setSelectedTextIds: React.Dispatch<React.SetStateAction<number[]>>;
  setSelectedCollections: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedGenres: React.Dispatch<React.SetStateAction<string[]>>;
}

const SearchContext = createContext<SearchContextType | null>(null);

const ITEMS_PER_PAGE = 25;
const PAGES_PER_FETCH = 10;
const MAX_RESULTS = 10000;

const getEmptySearchParams = (): SearchParams => ({
  kunyas: [],
  nasab: '',
  nisbas: [],
  text_ids: [],
  page: 1,
  allowRareKunyaNisba: false,
  allowNasabBase: false,
  allowKunyaNasab: false
});

const parseUrlParams = (search: string): SearchParams => {
  const params = new URLSearchParams(search);
  const textIdsParam = params.get('text_ids') || '';
  let text_ids: number[] = [];
  
  if (textIdsParam) {
    if (isValidRangeString(textIdsParam)) {
      text_ids = decompressRanges(textIdsParam);
    } else {
      text_ids = textIdsParam.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
    }
  }

  return {
    kunyas: params.get('kunyas')?.split(',').filter(Boolean) || [],
    nasab: params.get('nasab') || '',
    nisbas: params.get('nisbas')?.split(',').filter(Boolean) || [],
    text_ids,
    page: parseInt(params.get('page') || '1', 10),
    allowRareKunyaNisba: params.get('allowRareKunyaNisba') === 'true',
    allowNasabBase: params.get('allowNasabBase') === 'true',
    allowKunyaNasab: params.get('allowKunyaNasab') === 'true'
  };
};

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const fetchedRanges = useRef<Set<string>>(new Set());
  const lastSearchKey = useRef<string>('');

  // Core state
  const [results, setResults] = useState<SearchResult[]>([]);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Filter state
  const [dateRange, setDateRange] = useState<DateRange | null>(null);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  
  // Search parameters state
  const [searchParams, setSearchParams] = useState<SearchParams>(getEmptySearchParams);
  const [selectedTextIds, setSelectedTextIds] = useState<number[]>([]);

  const executeSearch = useCallback(async (params: SearchParams) => {
    const batchStartPage = Math.floor((params.page - 1) / PAGES_PER_FETCH) * PAGES_PER_FETCH + 1;
    const rangeKey = `${JSON.stringify({ ...params, page: batchStartPage })}`;
    
    if (fetchedRanges.current.has(rangeKey)) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const from = (batchStartPage - 1) * ITEMS_PER_PAGE;
      const size = PAGES_PER_FETCH * ITEMS_PER_PAGE;

      const { searchPatterns, filterPatterns } = generateNamePatterns(
        params.kunyas,
        params.nasab,
        params.nisbas,
        params.allowRareKunyaNisba,
        params.allowNasabBase,
        params.allowKunyaNasab
      );

      const searchConfig: SearchConfig = {
        patterns: searchPatterns,
        filterPatterns,
        selectedTexts: params.text_ids,
        from,
        size,
      };

      const { results: newResults, total } = await searchOpenSearch(searchConfig);

      setResults(prev => {
        const newArray = prev.length === 0 ? 
          new Array(Math.min(total, MAX_RESULTS)) : 
          [...prev];
        
        for (let i = 0; i < newResults.length; i++) {
          newArray[from + i] = newResults[i];
        }
        return newArray;
      });

      setTotalResults(Math.min(total, MAX_RESULTS));
      fetchedRanges.current.add(rangeKey);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Search failed'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateURLParams = useCallback((newParams: Partial<SearchParams>) => {
    const updatedParams = {
      ...searchParams,
      ...newParams,
      text_ids: selectedTextIds
    };

    const params = new URLSearchParams();
    
    if (updatedParams.kunyas.length > 0) params.append('kunyas', updatedParams.kunyas.join(','));
    if (updatedParams.nasab) params.append('nasab', updatedParams.nasab);
    if (updatedParams.nisbas.length > 0) params.append('nisbas', updatedParams.nisbas.join(','));
    if (updatedParams.text_ids.length > 0) params.append('text_ids', compressToRanges(updatedParams.text_ids));
    if (updatedParams.page !== 1) params.append('page', updatedParams.page.toString());
    if (updatedParams.allowRareKunyaNisba) params.append('allowRareKunyaNisba', 'true');
    if (updatedParams.allowNasabBase) params.append('allowNasabBase', 'true');
    if (updatedParams.allowKunyaNasab) params.append('allowKunyaNasab', 'true');

    navigate({ search: params.toString() });
  }, [navigate, searchParams, selectedTextIds]);

  // Handle URL changes
  useEffect(() => {
    const handleURLChange = () => {
      // Extract search parameters
      const currentParams = parseUrlParams(location.search);
      const hasSearchParameters = currentParams.kunyas.length > 0 || 
                                currentParams.nasab || 
                                currentParams.nisbas.length > 0;

      // Reset state when navigating to empty path
      if (!location.search) {
        setSearchParams(getEmptySearchParams());
        setResults([]);
        setTotalResults(0);
        setHasSearched(false);
        fetchedRanges.current.clear();
        lastSearchKey.current = '';
        return;
      }

      // Ignore invalid URLs
      if (!hasSearchParameters) return;

      // Generate search key excluding page
      const currentSearchKey = JSON.stringify({
        ...currentParams,
        page: undefined
      });

      // Check if only the page has changed
      const searchChanged = currentSearchKey !== lastSearchKey.current;

      // Update state and execute search as needed
      setSearchParams(currentParams);

      if (searchChanged) {
        lastSearchKey.current = currentSearchKey;
        setResults([]);
        fetchedRanges.current.clear();
        setHasSearched(true);
        void executeSearch(currentParams);
      } else {
        void executeSearch(currentParams);
      }
    };

    handleURLChange();
  }, [location.search, executeSearch]);

  const fetchNextBatchIfNeeded = useCallback(async (page: number) => {
    if (!hasSearched) return;
    await executeSearch({ ...searchParams, page });
  }, [executeSearch, hasSearched, searchParams]);

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