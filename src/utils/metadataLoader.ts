import * as XLSX from 'xlsx';
import { Author, Text } from '../types';

const DB_NAME = 'metadata_cache';
const STORE_NAME = 'metadata';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface CachedData {
  timestamp: number;
  data: {
    texts: Text[];
    authors: Author[];
    collections: string[];
    genres: string[];
  };
}

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
};

const getCache = async (): Promise<CachedData | null> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get('metadata');

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const data = request.result as CachedData;
        if (!data || Date.now() - data.timestamp > CACHE_DURATION) {
          resolve(null);
        } else {
          resolve(data);
        }
      };
    });
  } catch (error) {
    console.error('Error reading from cache:', error);
    return null;
  }
};

const setCache = async (data: CachedData['data']): Promise<void> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put({
        timestamp: Date.now(),
        data
      }, 'metadata');

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.error('Error writing to cache:', error);
  }
};

const processMetadata = (texts: any[], authors: any[]) => {
  const authorMap = new Map<number, Author>();

  const processedAuthors: Author[] = authors.map(author => {
    const processedAuthor: Author = {
      au_id: parseInt(author.au_id),
      au_ar: author.au_ar,
      au_sh_ar: author.au_sh_ar,
      au_lat: author.au_lat,
      au_sh_lat: author.au_sh_lat,
      au_death: author.au_death,
    };
    authorMap.set(processedAuthor.au_id, processedAuthor);
    return processedAuthor;
  });

  let processedTexts: Text[] = texts.map(text => {
    const au_ids = text.au_id
      ? text.au_id.toString()
          .split(' ')
          .map((id: string): number => parseInt(id.trim()))
          .filter((id: number): boolean => !isNaN(id))
      : [];

    const authors = au_ids
      .map((id: number): Author | undefined => authorMap.get(id))
      .filter((author: Author | undefined): author is Author => Boolean(author));

    const firstAuthor = authors[0];

    return {
      text_id: parseInt(text.text_id),
      text_uri: text.text_uri,
      title_ar: text.title_ar,
      title_lat: text.title_lat,
      ed_ar: text.ed,
      ed_tl: text.ed_tl,
      au_ids,
      authors,
      author_ar: firstAuthor?.au_ar,
      author_sh_ar: firstAuthor?.au_sh_ar,
      author_lat: firstAuthor?.au_lat,
      author_sh_lat: firstAuthor?.au_sh_lat,
      author_death: firstAuthor?.au_death,
      collection: text.collection,
      tags: text.tags ? text.tags.split(',').map((tag: string) => tag.trim()) : [],
      tok_len: text.tok_len ? parseInt(text.tok_len) : undefined,
      pg_len: text.pg_len ? parseInt(text.pg_len) : undefined,
    };
  });

  processedTexts.sort((a, b) => {
    if (!a.text_uri && !b.text_uri) return 0;
    if (!a.text_uri) return 1;
    if (!b.text_uri) return -1;
    return a.text_uri.localeCompare(b.text_uri);
  });

  return {
    texts: processedTexts,
    authors: processedAuthors,
    collections: Array.from(new Set(processedTexts.map(text => text.collection))).filter(Boolean),
    genres: Array.from(new Set(processedTexts.flatMap(text => text.tags))).filter(Boolean),
  };
};

const loadExcelFile = async (url: string): Promise<any[]> => {
  try {
    const response = await fetch(url);
    const data = await response.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json(worksheet);
  } catch (error) {
    console.error(`Error loading Excel file from ${url}:`, error);
    throw error;
  }
};

export const loadMetadata = async () => {
  try {
    // Check cache first
    const cached = await getCache();
    if (cached) {
      console.log('Using cached metadata');
      return cached.data;
    }

    // If no cache or expired, load from files
    console.log('Loading metadata from files');
    const [textsData, authorsData] = await Promise.all([
      loadExcelFile('/texts.xlsx'),
      loadExcelFile('/authors.xlsx')
    ]);

    const processed = processMetadata(textsData, authorsData);
    
    // Cache the results
    await setCache(processed);

    return processed;
  } catch (error) {
    console.error('Error loading metadata:', error);
    throw error;
  }
};