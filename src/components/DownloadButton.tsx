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

  // Function to generate a file name based on search terms
  const generateFileName = useCallback(() => {
    const searchTerms: string[] = [];
    
    // Extract key search terms from each form
    searchParams.forms.forEach((form, index) => {
      const formTerms: string[] = [];
      
      // Add kunyas
      if (form.kunyas.length > 0) {
        const kunyaTerm = form.kunyas.join('_');
        if (kunyaTerm) formTerms.push(kunyaTerm);
      }
      
      // Add nasab
      if (form.nasab) {
        // Replace spaces with underscores
        const nasabTerm = form.nasab.replace(/\s+/g, '_');
        formTerms.push(nasabTerm);
      }
      
      // Add nisbas
      if (form.nisbas.length > 0) {
        const nisbaTerm = form.nisbas.join('_');
        if (nisbaTerm) formTerms.push(nisbaTerm);
      }
      
      // Add shuhra if present
      if (form.shuhra) {
        const shuhraTerm = form.shuhra.replace(/\s+/g, '_');
        formTerms.push(`shuhra_${shuhraTerm}`);
      }
      
      // Combine terms for this form
      if (formTerms.length > 0) {
        searchTerms.push(formTerms.join('-'));
      }
    });
    
    // Get current date
    const now = new Date().toISOString().split('T')[0];
    
    // Create filename with search terms or default
    let fileName = `tabadil_results_${now}`;
    if (searchTerms.length > 0) {
      // Limit the length of the filename to avoid excessive length
      const searchTermsStr = searchTerms.join('_').substring(0, 100);
      fileName = `tabadil_${searchTermsStr}_${now}`;
    }
    
    return `${fileName}.xlsx`;
  }, [searchParams.forms]);

  const handleDownload = useCallback(async () => {
    if (isLoading) return;

    setIsDownloading(true);
    try {
      // Create search config with all forms
      const searchConfig: SearchConfig = {
        forms: searchParams.forms.map(form => {
          const { kunyas, nasab, nisbas, shuhra, allowRareKunyaNisba, allowTwoNasab, allowKunyaNasab, allowOneNasabNisba, allowOneNasab, allowSingleField } = form;
          const { searchPatterns, filterPatterns } = generateNamePatterns(
            kunyas, 
            nasab, 
            nisbas, 
            allowRareKunyaNisba,
            allowTwoNasab,
            allowKunyaNasab,
            allowOneNasabNisba,
            allowOneNasab,
            allowSingleField,
            shuhra
          );
          return { patterns: searchPatterns, filterPatterns };
        }),
        selectedTexts: searchParams.text_ids,
        from: 0,
        size: Math.min(totalResults, MAX_RESULTS)
      };

      const { results } = await searchOpenSearch(searchConfig);
      const processedData = results.flatMap(processResult);

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(processedData);

      XLSX.utils.book_append_sheet(wb, ws, 'Search Results');

      const fileName = generateFileName();
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error('Error generating download:', error);
    } finally {
      setIsDownloading(false);
    }
  }, [isLoading, searchParams, totalResults, generateFileName]);

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