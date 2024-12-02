import React from 'react';
import InfoTooltip from './InfoTooltip';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  tooltip?: string;
  dir?: 'rtl' | 'ltr';
  className?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder,
  tooltip,
  dir = 'ltr',
  className = ''
}) => {
  return (
    <div className="search-input-wrapper">
      {tooltip && (
        <div className="tooltip-wrapper">
          <InfoTooltip content={tooltip} />
        </div>
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        dir={dir}
        className={`search-input ${className}`}
      />
    </div>
  );
};

export default SearchInput;