import React, { createContext, useContext, useEffect, useState } from 'react';
import { loadMetadata } from '../utils/metadataLoader';
import { Author, Text } from '../types';

interface DateRangeCache {
  min: number;
  max: number;
}

interface MetadataContextType {
  texts: Text[];
  authors: Author[];
  collections: string[];
  genres: string[];
  dateRangeCache: DateRangeCache | null;
  isLoading: boolean;
  error: Error | null;
}

const MetadataContext = createContext<MetadataContextType | null>(null);

export const MetadataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [texts, setTexts] = useState<Text[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [collections, setCollections] = useState<string[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [dateRangeCache, setDateRangeCache] = useState<DateRangeCache | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initMetadata = async () => {
      try {
        const data = await loadMetadata();
        setTexts(data.texts);
        setAuthors(data.authors);
        setCollections(data.collections);
        setGenres(data.genres);

        // Calculate date range from authors
        const deathDates = data.authors
          .map(a => parseInt(a.au_death))
          .filter(date => !isNaN(date));

        if (deathDates.length > 0) {
          setDateRangeCache({
            min: Math.min(...deathDates),
            max: Math.max(...deathDates)
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load metadata'));
      } finally {
        setIsLoading(false);
      }
    };

    initMetadata();
  }, []);

  return (
    <MetadataContext.Provider
      value={{
        texts,
        authors,
        collections,
        genres,
        dateRangeCache,
        isLoading,
        error
      }}
    >
      {children}
    </MetadataContext.Provider>
  );
};

export const useMetadata = () => {
  const context = useContext(MetadataContext);
  if (!context) {
    throw new Error('useMetadata must be used within a MetadataProvider');
  }
  return context;
};