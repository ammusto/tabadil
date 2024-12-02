import React, { useState, useEffect, useCallback } from 'react';
import { FixedSizeList } from 'react-window';
import { Text } from '../types';
import { useMetadata } from '../contexts/MetadataContext';
import { useSearch } from '../contexts/SearchContext';
import './TextFilter.css'

const ITEM_HEIGHT = 25;
const LIST_HEIGHT = 300;
const LIST_WIDTH = '100%';

interface RowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    items: Text[];
    selectedTexts: number[];
    onToggle: (textId: number) => void;
  };
}

const Row: React.FC<RowProps> = ({ index, style, data }) => {
  const { items, selectedTexts, onToggle } = data;
  const text = items[index];
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const truncateTitle = (title: string): string => {
    if (windowWidth < 468 && title.length > 30) {
      return title.substring(0, 20) + '...';
    }
    return title;
  };

  return (
    <label
      className="flex"
      style={{
        ...style,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <input
        type="checkbox"
        checked={selectedTexts.includes(text.text_id)}
        onChange={() => onToggle(text.text_id)}
        className="mr-3 flex-shrink-0"
      />
      <div className="flex">
        <span dir="rtl">
          {truncateTitle(text.title_ar)} <span className='author-shuhra'>- {text.author_sh_ar}</span> (ت {text.author_death})
        </span>
      </div>
    </label>
  );
};
const TextFilter: React.FC = () => {
  const { texts, isLoading } = useMetadata();
  const {
    dateRange,
    selectedCollections,
    selectedGenres,
    selectedTextIds,
    setSelectedTextIds
  } = useSearch();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredTexts, setFilteredTexts] = useState<Text[]>([]);

  useEffect(() => {
    let filtered = [...texts];

    if (selectedCollections.length > 0) {
      filtered = filtered.filter(text =>
        text.collection && selectedCollections.includes(text.collection)
      );
    }

    if (selectedGenres.length > 0) {
      filtered = filtered.filter(text =>
        text.tags?.some(tag => selectedGenres.includes(tag))
      );
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(text =>
        text.title_ar?.includes(searchTerm) ||
        text.title_lat?.toLowerCase().includes(searchLower) ||
        text.author_ar?.includes(searchTerm) ||
        text.author_lat?.toLowerCase().includes(searchLower) ||
        text.author_sh_ar?.includes(searchTerm) ||
        text.author_sh_lat?.toLowerCase().includes(searchLower)
      );
    }

    if (dateRange) {
      filtered = filtered.filter(text => {
        const death = parseInt(text.author_death || '0');
        return death >= dateRange.min && death <= dateRange.max;
      });
    }

    setFilteredTexts(filtered);
  }, [texts, searchTerm, selectedCollections, selectedGenres, dateRange]);

  const handleTextToggle = useCallback((textId: number) => {
    setSelectedTextIds(prev =>
      prev.includes(textId)
        ? prev.filter(id => id !== textId)
        : [...prev, textId]
    );
  }, [setSelectedTextIds]);


  const handleAddAll = useCallback(() => {
    setSelectedTextIds(prev => {
      const newIds = filteredTexts.map(text => text.text_id);
      return Array.from(new Set([...prev, ...newIds]));
    });
  }, [filteredTexts, setSelectedTextIds]);

  const handleRemoveAll = useCallback(() => {
    setSelectedTextIds(prev => {
      const filteredIds = new Set(filteredTexts.map(text => text.text_id));
      return prev.filter(id => !filteredIds.has(id));
    });
  }, [filteredTexts, setSelectedTextIds]);

  const showBulkActions = searchTerm || selectedCollections.length > 0 ||
    selectedGenres.length > 0 || dateRange !== null;

  if (isLoading) {
    return <div className="p-4">Loading texts...</div>;
  }

  const itemData = {
    items: filteredTexts,
    selectedTexts: selectedTextIds,
    onToggle: handleTextToggle,
  };

  return (
    <div className="text-filter">
      <div className="text-filter-input-container">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search texts or authors..."
          className=""
        />
      </div>

      <div className="text-list relative">
        <FixedSizeList
          height={LIST_HEIGHT}
          width={LIST_WIDTH}
          itemCount={filteredTexts.length}
          itemSize={ITEM_HEIGHT}
          itemData={itemData}
          style={{ direction: 'rtl' }}
        >
          {Row}
        </FixedSizeList>
      </div>
      <div className="text-list-buttons-container">
        {selectedTextIds.length > 0 && (
          <div>
            <button onClick={() => setSelectedTextIds([])}>
              Clear Selected Texts
            </button>
          </div>
        )}
        {showBulkActions && (
          <>
            <div>
              <button onClick={handleAddAll}>
                Add All Filtered ({filteredTexts.length})
              </button>
            </div>
            <div>
              <button onClick={handleRemoveAll}>
                Remove All Filtered
              </button>
            </div>
          </>
        )}
      </div>

    </div>
  );
};

export default TextFilter;