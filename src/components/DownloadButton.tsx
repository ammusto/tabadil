import React, { useState, useCallback } from 'react';
import { useSearch } from '../contexts/SearchContext';
import { SearchResult, SearchConfig } from '../types';
import { searchOpenSearch } from '../utils/searchClient';
import { generateNamePatterns } from '../utils/namePatterns';
import * as XLSX from 'xlsx-js-style';

const MAX_RESULTS = 10000;

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

const DownloadButton: React.FC = () => {
  const {
    totalResults,
    searchParams,
    isLoading
  } = useSearch();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = useCallback(async () => {
    if (isLoading) return;

    setIsDownloading(true);
    try {
      const { kunyas, nasab, nisbas, allowRareKunyaNisba, allowTwoNasab, allowKunyaNasab, allowOneNasab } = searchParams;
      const { searchPatterns, filterPatterns } = generateNamePatterns(
        kunyas, 
        nasab, 
        nisbas, 
        allowRareKunyaNisba,
        allowTwoNasab,
        allowKunyaNasab,
        allowOneNasab
      );

      const searchConfig: SearchConfig = {
        patterns: searchPatterns,
        filterPatterns,
        selectedTexts: searchParams.text_ids,
        from: 0,
        size: Math.min(totalResults, MAX_RESULTS)
      };

      const { results } = await searchOpenSearch(searchConfig);
      const processedData = results.flatMap(processResult);

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(processedData);

      XLSX.utils.book_append_sheet(wb, ws, 'Search Results');

      const now = new Date().toISOString().split('T')[0];
      XLSX.writeFile(wb, `search_results_${now}.xlsx`);
    } catch (error) {
      console.error('Error generating download:', error);
    } finally {
      setIsDownloading(false);
    }
  }, [isLoading, searchParams, totalResults]);

  const downloadCount = Math.min(totalResults, MAX_RESULTS);

  return (
    <div className='center'>
      <button
        onClick={handleDownload}
        disabled={isDownloading || isLoading}
        className="download-button"
      >
        {isDownloading
          ? 'Preparing Download...'
          : `Download Results (${downloadCount.toLocaleString()})`}
      </button>
    </div>
  );
};

export default DownloadButton;