import React, { useCallback } from 'react';
import { useSearch } from '../contexts/SearchContext';
import { useMetadata } from '../contexts/MetadataContext';
import { SearchResult } from '../types';
import DownloadButton from './DownloadButton';
import './Results.css';
import Pagination from './Pagination';
import LoadingGif from './LoadingGif';

const Results: React.FC = () => {
  const {
    results,
    totalResults,
    isLoading,
    searchParams,
    itemsPerPage,
    hasSearched,
    updateURLParams,
    fetchNextBatchIfNeeded
  } = useSearch();
  
  const { texts } = useMetadata();

  const getTextTitle = useCallback((textId: number) => {
    const text = texts.find(t => t.text_id === textId);
    return text?.title_ar || 'Unknown Text';
  }, [texts]);

  const renderHighlights = (result: SearchResult) => {
    if (!result.highlights || Object.keys(result.highlights).length === 0) {
      return null;
    }

    return Object.values(result.highlights).map((highlights, index) => (
      <div key={index} className="highlight-group">
        {highlights.map((highlight, hIndex) => (
          <div
            key={`${index}-${hIndex}`}
            className="highlight"
          >
            <span>• </span>
            <span dangerouslySetInnerHTML={{ __html: highlight }} />
          </div>
        ))}
      </div>
    ));
  };

  const handlePageChange = useCallback(async (newPage: number) => {
    await fetchNextBatchIfNeeded(newPage);
    updateURLParams({ page: newPage });
    window.scrollTo(0, 0);
  }, [fetchNextBatchIfNeeded, updateURLParams]);

  if (isLoading) {
    return <div><LoadingGif /></div>;
  }

  if (results.length === 0 && !hasSearched) {
    return (
      <>

      </>
    );
  }
  if (results.length === 0 && hasSearched) {
    return (
      <div className="results-container">
        <div className="results-header center">
          <h3>
            No Results Found
          </h3>
        </div>
      </div>
    );
  }

  const startIndex = (searchParams.page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedResults = results.slice(startIndex, endIndex);
  const resultText = totalResults === 10000
    ? "Found 10,000+ results"
    : `Found ${totalResults.toLocaleString()} results`;

  return (
    <div className="results-container">
      <div className="results-header center">
        <h3>{resultText}</h3>
      </div>

      <div className="results-list">
        {paginatedResults.map((result, index) => (
          <div key={`${result.text_id}-${result.page_id}-${index}`} className="result-item">
            <div className="result-title">
              <h4>{getTextTitle(result.text_id)}</h4>
            </div>
            <div className="highlights">
              {renderHighlights(result)}
            </div>
            <div className="result-page">
              <span className="page-info">
                {result.vol}:{result.page_num}
              </span>
            </div>
          </div>
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