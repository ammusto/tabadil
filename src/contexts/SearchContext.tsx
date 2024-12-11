import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { searchOpenSearch } from '../utils/searchClient';
import { generateNamePatterns } from '../utils/namePatterns';
import { SearchResult, SearchConfig, DateRange, SearchParams, FormSearchParams } from '../types';
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
  searchParams: SearchParams;
  updateURLParams: (params: Partial<SearchParams>) => void;
  addSearchForm: () => void;
  removeSearchForm: (formId: string) => void;
  fetchNextBatchIfNeeded: (page: number) => Promise<void>;
  setDateRange: (range: DateRange | null) => void;
  setHasSearched: React.Dispatch<React.SetStateAction<boolean>>;
  setResults: React.Dispatch<React.SetStateAction<SearchResult[]>>;
  setSelectedTextIds: React.Dispatch<React.SetStateAction<number[]>>;
  setSelectedCollections: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedGenres: React.Dispatch<React.SetStateAction<string[]>>;
  updateFormParams: (formId: string, updates: Partial<FormSearchParams>) => void;
}

const SearchContext = createContext<SearchContextType | null>(null);

const ITEMS_PER_PAGE = 25;
const PAGES_PER_FETCH = 10;
const MAX_RESULTS = 10000;
const MAX_FORMS = 4;

const createEmptyForm = (id: string): FormSearchParams => ({
  formId: id,
  kunyas: [''],
  nasab: '',
  nisbas: [''],
  allowRareKunyaNisba: false,
  allowTwoNasab: false,
  allowKunyaNasab: false,
  allowOneNasabNisba: false,
  allowOneNasab: false,
  allowSingleField: false,
});

const getInitialSearchParams = (): SearchParams => ({
  forms: [createEmptyForm('form-0')],
  text_ids: [],
  page: 1
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

  const forms: FormSearchParams[] = [];
  let formIndex = 0;

  while (formIndex < MAX_FORMS) {
    const suffix = formIndex === 0 ? '' : formIndex.toString();
    const kunyas = params.get(`kunyas${suffix}`)?.split(',').filter(Boolean) || [];
    const nasab = params.get(`nasab${suffix}`) || '';
    const nisbas = params.get(`nisbas${suffix}`)?.split(',').filter(Boolean) || [];

    if (kunyas.length || nasab || nisbas.length) {
      forms.push({
        formId: `form-${formIndex}`,
        kunyas,
        nasab,
        nisbas,
        allowRareKunyaNisba: params.get(`allowRareKunyaNisba${suffix}`) === 'true',
        allowTwoNasab: params.get(`allowTwoNasab${suffix}`) === 'true',
        allowKunyaNasab: params.get(`allowKunyaNasab${suffix}`) === 'true',
        allowOneNasabNisba: params.get(`allowOneNasabNisba${suffix}`) === 'true',
        allowOneNasab: params.get(`allowOneNasab${suffix}`) === 'true',
        allowSingleField: params.get(`allowSingleField${suffix}`) === 'true'
      });
    }
    formIndex++;
  }

  // Ensure at least one form exists
  if (forms.length === 0) {
    forms.push(createEmptyForm('form-0'));
  }

  return {
    forms,
    text_ids,
    page: parseInt(params.get('page') || '1', 10)
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
  const [searchParams, setSearchParams] = useState<SearchParams>(getInitialSearchParams);
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

      const searchConfig: SearchConfig = {
        forms: params.forms.map(form => {
          const { searchPatterns, filterPatterns } = generateNamePatterns(
            form.kunyas,
            form.nasab,
            form.nisbas,
            form.allowRareKunyaNisba,
            form.allowTwoNasab,
            form.allowKunyaNasab,
            form.allowOneNasabNisba,
            form.allowOneNasab,
            form.allowSingleField
          );
          return { patterns: searchPatterns, filterPatterns };
        }),
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

  const addSearchForm = useCallback(() => {
    if (searchParams.forms.length >= MAX_FORMS) return;
    
    setSearchParams(prev => ({
      ...prev,
      forms: [...prev.forms, createEmptyForm(`form-${prev.forms.length}`)]
    }));
  }, [searchParams.forms.length]);

  const removeSearchForm = useCallback((formId: string) => {
    setSearchParams(prev => ({
      ...prev,
      forms: prev.forms.filter(form => form.formId !== formId)
    }));
  }, []);

  const updateFormParams = useCallback((formId: string, updates: Partial<FormSearchParams>) => {
    setSearchParams(prev => ({
      ...prev,
      forms: prev.forms.map(form => 
        form.formId === formId ? { ...form, ...updates } : form
      )
    }));
  }, []);

  const updateURLParams = useCallback((newParams: Partial<SearchParams>) => {
    const updatedParams = {
      ...searchParams,
      ...newParams,
      text_ids: selectedTextIds
    };

    const params = new URLSearchParams();
    
    updatedParams.forms.forEach((form, index) => {
      const suffix = index === 0 ? '' : index.toString();
      if (form.kunyas.length > 0) params.append(`kunyas${suffix}`, form.kunyas.join(','));
      if (form.nasab) params.append(`nasab${suffix}`, form.nasab);
      if (form.nisbas.length > 0) params.append(`nisbas${suffix}`, form.nisbas.join(','));
      if (form.allowRareKunyaNisba) params.append(`allowRareKunyaNisba${suffix}`, 'true');
      if (form.allowTwoNasab) params.append(`allowTwoNasab${suffix}`, 'true');
      if (form.allowKunyaNasab) params.append(`allowKunyaNasab${suffix}`, 'true');
      if (form.allowOneNasabNisba) params.append(`allowOneNasabNisba${suffix}`, 'true');
      if (form.allowOneNasab) params.append(`allowOneNasab${suffix}`, 'true');
      if (form.allowSingleField) params.append(`allowSingleField${suffix}`, 'true');

    });

    if (updatedParams.text_ids.length > 0) {
      params.append('text_ids', compressToRanges(updatedParams.text_ids));
    }
    if (updatedParams.page !== 1) {
      params.append('page', updatedParams.page.toString());
    }

    navigate({ search: params.toString() });
  }, [navigate, searchParams, selectedTextIds]);

  useEffect(() => {
    const handleURLChange = () => {
      const currentParams = parseUrlParams(location.search);
      const hasSearchParameters = currentParams.forms.some(form => 
        form.kunyas.length > 0 || form.nasab || form.nisbas.length > 0
      );

      if (!location.search) {
        setSearchParams(getInitialSearchParams());
        setResults([]);
        setTotalResults(0);
        setHasSearched(false);
        fetchedRanges.current.clear();
        lastSearchKey.current = '';
        return;
      }

      if (!hasSearchParameters) return;

      const currentSearchKey = JSON.stringify({
        ...currentParams,
        page: undefined
      });

      const searchChanged = currentSearchKey !== lastSearchKey.current;

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
        addSearchForm,
        removeSearchForm,
        updateFormParams,
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