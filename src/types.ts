// types.ts

// types.ts


export interface Author {
  au_id: number;
  au_ar: string;
  au_sh_ar: string;
  au_lat: string;
  au_sh_lat: string;
  au_death: string;
}

export interface Text {
  text_id: number;
  text_uri: string;
  title_ar: string;
  title_lat: string;
  au_ids: number[];
  authors?: Author[];
  author_ar?: string;
  author_sh_ar?: string;
  author_lat?: string;
  author_sh_lat?: string;
  author_death?: string;
  collection: string;
  tags: string[];
  tok_len?: number;
  pg_len?: number;
}

export interface SearchResult {
  text_id: number;
  page_id: string;
  vol: string;
  page_num: number;
  highlights: {
    [key: string]: string[];
  };
}

export interface SearchConfig {
  patterns: string[];
  filterPatterns: string[];
  selectedTexts: number[];
  from: number;
  size: number;
}

export interface MetadataContextType {
  texts: Text[];
  authors: Author[];
  collections: string[];
  genres: string[];
  isLoading: boolean;
  error: Error | null;
}

export interface DateRange {
  min: number;
  max: number;
}