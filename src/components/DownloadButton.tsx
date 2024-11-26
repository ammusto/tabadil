import React, { useState, useCallback } from 'react';
import { useSearch } from '../contexts/SearchContext';
import { SearchResult } from '../types';
import * as XLSX from 'xlsx';

const DownloadButton: React.FC = () => {
  const { results } = useSearch();
  const [isDownloading, setIsDownloading] = useState(false);

  const processResult = (result: SearchResult) => {
    const processedHighlights = Object.values(result.highlights || {})
      .flat()
      .map(highlight => highlight.replace(/<\/?[^>]+(>|$)/g, '')); // Remove HTML tags

    return processedHighlights.map(highlight => ({
      text_id: result.text_id,
      volume: result.vol,
      page: result.page_num,
      content: highlight
    }));
  };

  const handleDownload = useCallback(async () => {
    if (results.length === 0) return;

    setIsDownloading(true);
    try {
      const processedData = results.flatMap(processResult);

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(processedData);

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Search Results');

      // Generate file and trigger download
      const now = new Date().toISOString().split('T')[0];
      XLSX.writeFile(wb, `search_results_${now}.xlsx`);
    } catch (error) {
      console.error('Error generating download:', error);
    } finally {
      setIsDownloading(false);
    }
  }, [results]);

  if (results.length === 0) {
    return null;
  }

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading}
      className="download-button"
    >
      {isDownloading ? 'Preparing Download...' : `Download Results (${results.length})`}
    </button>
  );
};

export default DownloadButton;