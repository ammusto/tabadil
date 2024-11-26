import * as XLSX from 'xlsx';
import { Author, Text } from '../types';

const processMetadata = (texts: any[], authors: any[]) => {
  // Process authors first to create a lookup map
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

  // Process texts and include author information
  let processedTexts: Text[] = texts.map(text => {
    // Parse author IDs from the space-separated string
    const au_ids = text.au_id
      ? text.au_id.toString()
          .split(' ')
          .map((id: string): number => parseInt(id.trim()))
          .filter((id: number): boolean => !isNaN(id))
      : [];

    // Look up the full author objects
    const authors = au_ids
      .map((id: number): Author | undefined => {
        const author = authorMap.get(id);
        if (!author) {
          console.log(`Author not found for ID: ${id}`);
        }
        return author;
      })
      .filter((author: Author | undefined): author is Author => Boolean(author));

    const firstAuthor = authors[0];

    const processedText: Text = {
      text_id: parseInt(text.text_id),
      text_uri: text.text_uri,
      title_ar: text.title_ar,
      title_lat: text.title_lat,
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

    return processedText;
  });

  // Sort texts by text_uri
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

export const loadMetadata = async () => {
  try {
    const [textsData, authorsData] = await Promise.all([
      loadExcelFile('/texts.xlsx'),
      loadExcelFile('/authors.xlsx')
    ]);

    const processed = processMetadata(textsData, authorsData);

    return processed;
  } catch (error) {
    console.error('Error loading metadata:', error);
    throw error;
  }
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