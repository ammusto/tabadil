import React from 'react';
import { FixedSizeList } from 'react-window';
import { Text } from '../types';
import { useMetadata } from '../contexts/MetadataContext';
import { useSearch } from '../contexts/SearchContext';
import './SelectedTexts.css';


const ITEM_HEIGHT = 25;
const LIST_HEIGHT = 180;
const LIST_WIDTH = '100%';

interface RowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    items: Text[];
    onToggle: (textId: number) => void;
  };
}

const Row: React.FC<RowProps> = ({ index, style, data }) => {
  const { items, onToggle } = data;
  const text = items[index];

  const authorInfo = text.author_sh_ar
    ? ` - ${text.author_sh_ar}${text.author_death ? ` (${text.author_death})` : ''}`
    : '';

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
        checked={true}
        onChange={() => onToggle(text.text_id)}
        className="mr-3 flex-shrink-0"
      />
      <div className="flex">
        <span dir="rtl">
          {text.title_ar} {authorInfo}
        </span>
      </div>
    </label>
  );
};

const SelectedTexts: React.FC = () => {
  const { texts } = useMetadata();
  const { selectedTextIds } = useSearch();

  const selectedTextObjects = texts.filter(text => 
    selectedTextIds.includes(text.text_id)
  );

  const itemData = {
    items: selectedTextObjects,
    onToggle: () => {},
  };


  return (
    <div className="">
      <div className="">
        <h4 className="center">
          Selected Texts ({selectedTextObjects.length})
        </h4>
      </div>
      <div className="selected-texts-list">
        <FixedSizeList
          height={LIST_HEIGHT}
          width={LIST_WIDTH}
          itemCount={selectedTextObjects.length}
          itemSize={ITEM_HEIGHT}
          itemData={itemData}
          style={{ direction: 'rtl' }}
        >
          {Row}
        </FixedSizeList>
      </div>
    </div>
  );
};

export default SelectedTexts;