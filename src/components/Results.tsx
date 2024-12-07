import React, { useCallback, useMemo } from 'react';
import { useSearch } from '../contexts/SearchContext';
import { useMetadata } from '../contexts/MetadataContext';
import { SearchResult } from '../types';
import DownloadButton from './DownloadButton';
import './Results.css';
import Pagination from './Pagination';
import LoadingGif from './LoadingGif';
import { useLocation } from 'react-router-dom';

const ResultHeader: React.FC<{ totalResults: number }> = ({ totalResults }) => (
  <div className="results-header">
    <h4>
      {totalResults === 10000
        ? "Found 10,000+ results"
        : `Found ${totalResults.toLocaleString()} results`}
    </h4>
  </div>
);



const NoResults: React.FC<{ hasSearched: boolean }> = ({ hasSearched }) => {
  if (!hasSearched) return null;

  return (
    <div className="results-container">
      <div className="results-header center">
        <h3>No Results Found</h3>
      </div>
    </div>
  );
};

const ResultTableHeader: React.FC = () => (
  <div className='result-item bold'>
    <div className="result-title">Title</div>
    <div className="highlights center">Result</div>
    <div className="result-page center">Vol:Pg</div>
  </div>
);

interface ResultItemProps {
  result: SearchResult;
  title: string;
}

const ResultItem: React.FC<ResultItemProps> = ({ result, title }) => {
  const baseUrl = window.location.origin;
  // Get both display highlights and highlighted terms
  const { displayHighlights, highlightTerms } = useMemo(() => {
    if (!result.highlights || Object.keys(result.highlights).length === 0) {
      return { displayHighlights: [], highlightTerms: '' };
    }

    const uniqueHighlights = new Set<string>();
    const allHighlights: string[] = [];
    const terms = new Set<string>();

    // Extract highlighted terms using DOM parser
    const getHighlightedContent = (htmlString: string): string[] => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlString, 'text/html');
      const highlights = Array.from(doc.querySelectorAll('span.highlight'));
      return highlights.map(span => span.textContent || '');
    };

    Object.values(result.highlights).forEach(highlights => {
      highlights.forEach(highlight => {
        // Handle display highlights
        if (!uniqueHighlights.has(highlight)) {
          uniqueHighlights.add(highlight);
          allHighlights.push(highlight);
        }

        // Extract highlighted terms
        const highlightedTerms = getHighlightedContent(highlight);
        highlightedTerms.forEach(term => {
          if (term.trim()) {
            terms.add(term.trim());
          }
        });
      });
    });

    return {
      displayHighlights: allHighlights,
      highlightTerms: encodeURIComponent(Array.from(terms).join(','))
    };
  }, [result.highlights]);

  return (
    <div className="result-item">
      <div className="result-title">
        <a href={`/text/${result.text_id}`} target="_blank" rel="noopener noreferrer">
          <h4>{title}</h4>
        </a>
      </div>
      <div className="highlights">
        <div className="highlight-group">
          {displayHighlights.map((highlight, index) => (
            <div key={index} className="highlight">
              <span>• </span>
              <span dangerouslySetInnerHTML={{ __html: highlight }} />
            </div>
          ))}
        </div>
      </div>
      <div className="result-page">
        <span className="page-info rtl">
          <a
            href={`${baseUrl}/reader/${result.text_id}/${result.page_id}?highlights=${highlightTerms}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {result.vol}:{result.page_num}
          </a>

        </span>
      </div>
    </div>
  );
};

const Results: React.FC = () => {
  const {
    results,
    totalResults,
    isLoading,
    searchParams,
    itemsPerPage,
    hasSearched,
    updateURLParams,
    error,
    fetchNextBatchIfNeeded
  } = useSearch();

  const { texts } = useMetadata();

  const getTextTitle = useCallback((textId: number) => {
    const text = texts.find(t => t.text_id === textId);
    return text?.title_ar || 'Unknown Text';
  }, [texts]);

  const handlePageChange = useCallback(async (newPage: number) => {
    await fetchNextBatchIfNeeded(newPage);
    updateURLParams({ page: newPage });
    window.scrollTo(0, 0);
  }, [fetchNextBatchIfNeeded, updateURLParams]);

  if (isLoading) return <div><LoadingGif /></div>;
  if (error) return <div className="results-container"><div className="results-header center"><h3>{error.message}</h3></div></div>;
  if (results.length === 0) return <NoResults hasSearched={hasSearched} />;

  const startIndex = (searchParams.page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedResults = results.slice(startIndex, endIndex);

  return (
    <div className="results-container">
      <ResultHeader totalResults={totalResults} />

      <div className="results-list">
        <ResultTableHeader />
        {paginatedResults.map((result, index) => (
          <ResultItem
            key={`${result.text_id}-${result.page_id}-${index}`}
            result={result}
            title={getTextTitle(result.text_id)}
          />
        ))}
      </div>

      <Pagination
        currentPage={searchParams.page}
        totalItems={Math.min(totalResults, 10000)}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        maxResults={10000}
        enableKeyboardNav={true}
      />

      <DownloadButton />
    </div>
  );
};

export default Results;