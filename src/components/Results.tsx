import React, { useCallback } from 'react';
import { useSearch } from '../contexts/SearchContext';
import { useMetadata } from '../contexts/MetadataContext';
import { SearchResult } from '../types';
import DownloadButton from './DownloadButton';
import './Results.css';

const Results: React.FC = () => {
  const { results, totalResults, isLoading } = useSearch();
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

  if (isLoading) {
    return <div>Searching...</div>;
  }

  if (results.length === 0) {
    return <div>No results found</div>;
  }

  return (
    <div className="results-container">
      <div className="results-header">
        <h3>Found {totalResults} results</h3>
        <DownloadButton />
      </div>

      <div className="results-list">
        {results.map((result, index) => (
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
    </div>
  );
};

export default Results;