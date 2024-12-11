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
  ed_ar: string;
  ed_tl:string;
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

export interface Page {
  page_id: number;
  page_num: string;
  page_content: string;
  vol: string;
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

export interface FormSearchParams {
  formId: string;
  kunyas: string[];
  nasab: string;
  nisbas: string[];
  allowRareKunyaNisba: boolean;
  allowTwoNasab: boolean;
  allowKunyaNasab: boolean;
  allowOneNasabNisba: boolean;
  allowOneNasab: boolean;
  allowSingleField: boolean;
}

export interface SearchParams {
  forms: FormSearchParams[];
  text_ids: number[];
  page: number;
}

export interface SearchConfig {
  forms: Array<{
    patterns: string[];
    filterPatterns: string[];
  }>;
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

export interface TextMetadata {
  text: Text | null;
  author: Author | null;
  isLoading: boolean;
  error: Error | null;
}