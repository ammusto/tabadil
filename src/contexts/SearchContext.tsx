import React, { createContext, useContext, useState, useCallback } from 'react';
import { searchOpenSearch } from '../utils/searchClient';
import { generateNamePatterns } from '../utils/namePatterns';
import { SearchResult, SearchConfig, DateRange } from '../types';

interface SearchContextType {
  results: SearchResult[];
  totalResults: number;
  isLoading: boolean;
  error: Error | null;
  selectedTexts: number[];
  dateRange: DateRange | null;
  selectedCollections: string[];
  selectedGenres: string[];
  setSelectedTexts: React.Dispatch<React.SetStateAction<number[]>>;
  setDateRange: (range: DateRange | null) => void;
  setSelectedCollections: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedGenres: React.Dispatch<React.SetStateAction<string[]>>;
  performSearch: (kunya: string, nasab: string, nisbas: string[]) => Promise<void>;
  clearResults: () => void;
  resetAllFilters: () => void;
}

const SearchContext = createContext<SearchContextType | null>(null);

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [selectedTexts, setSelectedTexts] = useState<number[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | null>(null);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  const performSearch = useCallback(async (kunya: string, nasab: string, nisbas: string[]) => {
    setIsLoading(true);
    setError(null);

    try {
      const { searchPatterns, filterPatterns } = generateNamePatterns(kunya, nasab, nisbas);
      
      const searchConfig: SearchConfig = {
        patterns: searchPatterns,
        filterPatterns,
        selectedTexts,
        from: 0,
        size: 50
      };

      const { results: searchResults, total } = await searchOpenSearch(searchConfig);
      
      setResults(searchResults);
      setTotalResults(total);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Search failed'));
    } finally {
      setIsLoading(false);
    }
  }, [selectedTexts]);

  const clearResults = useCallback(() => {
    setResults([]);
    setTotalResults(0);
    setError(null);
  }, []);

  const resetAllFilters = useCallback(() => {
    setSelectedTexts([]);
    setDateRange(null);
    setSelectedCollections([]);
    setSelectedGenres([]);
  }, []);

  return (
    <SearchContext.Provider
      value={{
        results,
        totalResults,
        isLoading,
        error,
        selectedTexts,
        dateRange,
        selectedCollections,
        selectedGenres,
        setSelectedTexts,
        setDateRange,
        setSelectedCollections,
        setSelectedGenres,
        performSearch,
        clearResults,
        resetAllFilters
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