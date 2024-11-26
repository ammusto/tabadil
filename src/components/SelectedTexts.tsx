import React from 'react';
import { FixedSizeList } from 'react-window';
import { Text } from '../types';
import { useMetadata } from '../contexts/MetadataContext';
import { useSearch } from '../contexts/SearchContext';

const ITEM_HEIGHT = 25;
const LIST_HEIGHT = 231;
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
            className="selected-text-item flex items-center px-4 hover:bg-gray-50"
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
            <div className="flex flex-col overflow-hidden">
                <span className="text-title font-medium overflow-hidden text-ellipsis whitespace-nowrap" dir="rtl">
                    {text.title_ar} {authorInfo}
                </span>
            </div>
        </label>
    );
};

const SelectedTexts: React.FC = () => {
    const { texts } = useMetadata();
    const { selectedTexts, setSelectedTexts } = useSearch();

    const selectedTextObjects = texts.filter(text => selectedTexts.includes(text.text_id));

    const handleToggle = (textId: number) => {
        setSelectedTexts(prev => prev.filter(id => id !== textId));
    };

    const handleClearAll = () => {
        setSelectedTexts([]);
    };

    const itemData = {
        items: selectedTextObjects,
        onToggle: handleToggle,
    };

    return (
        <div className="">
            <div className="">
                <h4 className="center">Selected Texts ({selectedTexts.length})
                    {selectedTexts.length > 0 && (
                        <button
                            onClick={handleClearAll}
                            className='text-button'
                        >
                            (Clear All)
                        </button>
                    )}
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