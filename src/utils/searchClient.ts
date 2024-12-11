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

const createExactMatchQuery = (pattern: string): any[] => [
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
];


const orderPatternsByLength = (patterns: string[]): string[] => {
  return [...patterns].sort((a, b) => b.length - a.length);
};

export const searchOpenSearch = async (
  config: SearchConfig
): Promise<{ results: SearchResult[]; total: number }> => {
  if (!config.forms || config.forms.length === 0) {
    throw new Error('Search Error: Invalid query. Please check About->How-To for valid query format.');
  }

  // Remove forms with no patterns
  const validForms = config.forms.filter(form => form.patterns.length > 0);

  if (validForms.length === 0) {
    throw new Error('Search Error: No valid search patterns found');
  }

  // Create must array for AND logic between forms
  const must = validForms.map(form => {
    const orderedPatterns = orderPatternsByLength(form.patterns);
    const should = orderedPatterns.flatMap(pattern => createExactMatchQuery(pattern)); // Flatten the array
  
    return {
      bool: {
        should,
        minimum_should_match: 1
      }
    };
  });

  const headers = new Headers({
    'Authorization': 'Basic ' + btoa(`${API_USER}:${API_PASS}`),
    'Content-Type': 'application/json'
  });

  const query: any = {
    from: config.from,
    size: config.size,
    _source: ["text_id", "page_id", "vol", "page_num", "uri"],
    query: {
      bool: {
        must,
      }
    },
    sort: [
      { uri: 'asc', page_id: 'asc' }
    ],
    highlight: {
      fields: {
        "page_content": {
          type: 'fvh',
          number_of_fragments: 10,
          fragment_size: 200,
          pre_tags: ['<span class="highlight">'],
          post_tags: ['</span>']
        },
        "page_content.proclitic": {
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
  console.log(JSON.stringify(query))
  try {
    const response = await fetch(`${API_URL}/${API_INDEX}/_search`, {
      method: 'POST',
      headers,
      body: JSON.stringify(query)
    });

    if (!response.ok) {
      throw new Error(`Search Error: ${response.statusText}`);
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
    throw error instanceof Error ? error : new Error('Search Error: An unexpected error occurred');
  }
};