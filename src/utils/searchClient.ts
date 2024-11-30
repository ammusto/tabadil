import { SearchConfig, SearchResult } from '../types';

const API_URL = process.env.REACT_APP_API_URL;
const API_USER = process.env.REACT_APP_API_USER;
const API_PASS = process.env.REACT_APP_API_PASS;
const API_INDEX = process.env.REACT_APP_API_INDEX;

interface OpenSearchResponse {
  hits: {
    total: {
      value: number;
    };
    hits: Array<{
      _source: {
        text_id: number;
        page_id: string;
        vol: string;
        page_num: number;
        uri: string;
      };
      highlight: {
        [key: string]: string[];
      };
    }>;
  };
}

interface MatchQuery {
  bool: {
    should: [
      {
        match_phrase: {
          "page_content": {
            query: string;
          }
        }
      },
      {
        match_phrase: {
          "page_content.proclitic": {
            query: string;
          }
        }
      }
    ]
  }
}

const createExactMatchQuery = (pattern: string): MatchQuery => ({
  bool: {
    should: [
      {
        match_phrase: {
          "page_content": {
            query: pattern
          }
        }
      },
      {
        match_phrase: {
          "page_content.proclitic": {
            query: pattern
          }
        }
      }
    ]
  }
});

const orderPatternsByLength = (patterns: string[]): string[] => {
  return [...patterns].sort((a, b) => b.length - a.length);
};

export const searchOpenSearch = async (
  config: SearchConfig
): Promise<{ results: SearchResult[]; total: number }> => {
  const headers = new Headers({
    'Authorization': 'Basic ' + btoa(`${API_USER}:${API_PASS}`),
    'Content-Type': 'application/json'
  });

  const orderedPatterns = orderPatternsByLength(config.patterns);
  const should = orderedPatterns.map(createExactMatchQuery);

  const query: any = {
    from: config.from,
    size: config.size,
    query: {
      bool: {
        should,
        minimum_should_match: 1,
      }
    },
    sort: [
      { uri: 'asc', page_id: 'asc' }
    ],
    highlight: {
      fields: {
        "page_content": {          // Highlight original content
          type: 'fvh',
          number_of_fragments: 3,
          fragment_size: 200,
          pre_tags: ['<span class="highlight">'],
          post_tags: ['</span>']
        },
        "page_content.proclitic": { // Also highlight proclitic matches
          type: 'fvh',
          number_of_fragments: 3,
          fragment_size: 200,
          pre_tags: ['<span class="highlight">'],
          post_tags: ['</span>']
        }
      }
    }
  };

  if (config.selectedTexts.length > 0) {
    if (!query.query.bool.filter) {
      query.query.bool.filter = [];
    }
    query.query.bool.filter.push({
      terms: {
        text_id: config.selectedTexts
      }
    });
  }

  try {
    const response = await fetch(`${API_URL}/${API_INDEX}/_search`, {
      method: 'POST',
      headers,
      body: JSON.stringify(query)
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }

    const data: OpenSearchResponse = await response.json();

    const results = data.hits.hits.map(hit => ({
      text_id: hit._source.text_id,
      page_id: hit._source.page_id,
      vol: hit._source.vol,
      page_num: hit._source.page_num,
      uri: hit._source.uri,
      highlights: hit.highlight
    }));

    return {
      results,
      total: data.hits.total.value
    };
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
};