import { useState, useEffect } from 'react';
import { Text, Author, TextMetadata } from '../types'; // Adjust path as necessary

const useTextMetadata = (textId: number | undefined): TextMetadata => {
  const [metadata, setMetadata] = useState<TextMetadata>({
    text: null,
    author: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    if (!textId) {
      setMetadata((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    const fetchTextMetadata = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/${process.env.REACT_APP_API_INDEX}/_search`,
          {
            method: 'POST',
            headers: {
              Authorization: `Basic ${btoa(
                `${process.env.REACT_APP_API_USER}:${process.env.REACT_APP_API_PASS}`
              )}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              query: {
                term: { text_id: textId },
              },
              size: 1,
            }),
          }
        );

        if (!response.ok) {
          throw new Error('Failed to load text metadata');
        }

        const data = await response.json();

        if (data.hits.hits.length === 0) {
          throw new Error('Text not found');
        }

        const result = data.hits.hits[0]._source;

        const text: Text = {
          text_id: result.text_id,
          text_uri: result.text_uri,
          title_ar: result.title_ar,
          title_lat: result.title_lat,
          ed_ar: result.ed,
          ed_tl: result.ed_tl,
          au_ids: result.au_ids,
          authors: result.authors || [],
          collection: result.collection,
          tags: result.tags || [],
          tok_len: result.tok_len,
          pg_len: result.pg_len,
        };

        const author: Author | null = result.authors?.length
          ? {
              au_id: result.authors[0].au_id,
              au_ar: result.authors[0].au_ar,
              au_sh_ar: result.authors[0].au_sh_ar,
              au_lat: result.authors[0].au_lat,
              au_sh_lat: result.authors[0].au_sh_lat,
              au_death: result.authors[0].au_death,
            }
          : null;

        setMetadata({ text, author, isLoading: false, error: null });
      } catch (err) {
        setMetadata((prev) => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err : new Error('Failed to load metadata'),
        }));
      }
    };

    fetchTextMetadata();
  }, [textId]);

  return metadata;
};

export default useTextMetadata;
