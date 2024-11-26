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

interface MatchPhraseQuery {
  match_phrase: {
    page_content: {
      query: string;
      slop?: number;
    } | string;
  };
}

interface OpenSearchQuery {
  from: number;
  size: number;
  query: {
    bool: {
      should: MatchPhraseQuery[];
    };
  };
  sort: [
    { uri: 'asc' }
  ];
  highlight: {
    fields: {
      page_content: {
        number_of_fragments: number;
        fragment_size: number;
        pre_tags: string[];
        post_tags: string[];
      };
    };
  };
}

export const searchOpenSearch = async (config: SearchConfig): Promise<{ results: SearchResult[]; total: number }> => {
  const headers = new Headers();
  headers.append('Authorization', 'Basic ' + btoa(`${API_USER}:${API_PASS}`));
  headers.append('Content-Type', 'application/json');

  console.log('Search config:', config);

  const should = config.patterns.map(pattern => ({
    match_phrase: {
      page_content: {
        query: pattern,
        slop: 5
      }
    }
  }));

  const query: OpenSearchQuery = {
    from: config.from,
    size: config.size,
    query: {
      bool: {
        should
      }
    },
    sort: [
      { uri: 'asc' }
    ],
    highlight: {
      fields: {
        page_content: {
          number_of_fragments: 3,
          fragment_size: 200,
          pre_tags: ['<span class="highlight">'],
          post_tags: ['</span>']
        }
      }
    }
  };

  console.log('Final query:', JSON.stringify(query, null, 2));

  try {
    console.log('Making request to OpenSearch API...');
    const response = await fetch(`${API_URL}/${API_INDEX}/_search`, {
      method: 'POST',
      headers,
      body: JSON.stringify(query)
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }

    console.log('Received response from OpenSearch API');
    const data: OpenSearchResponse = await response.json();

    const results = data.hits.hits.map(hit => ({
      text_id: hit._source.text_id,
      page_id: hit._source.page_id,
      vol: hit._source.vol,
      page_num: hit._source.page_num,
      uri: hit._source.uri,
      highlights: hit.highlight
    }));

    console.log('Formatted results:', results);

    return {
      results,
      total: data.hits.total.value
    };
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
};