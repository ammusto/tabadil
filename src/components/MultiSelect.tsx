import React, { useState, useCallback } from 'react';
import './MultiSelect.css';

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  label: string;
  options: Option[];
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
}

const diacriticMap: { [key: string]: string } = {
  'ā': 'a', 'Ā': 'a',
  'ī': 'i', 'Ī': 'i',
  'ū': 'u', 'Ū': 'u',
  'ṭ': 't', 'Ṭ': 't',
  'ḥ': 'h', 'Ḥ': 'h',
  'ḍ': 'd', 'Ḍ': 'd',
  'ẓ': 'z', 'Ẓ': 'z',
  'ṣ': 's', 'Ṣ': 's',
  'ʿ': "'",
  'ʾ': "'",
};

const normalizeText = (text: string): string => {
  // Convert to lowercase first
  let normalized = text.toLowerCase();
  
  // Normalize any fancy quotes to simple straight quote
  normalized = normalized.replace(/['']/g, "'");
  
  // Replace diacritics with their base characters
  Object.entries(diacriticMap).forEach(([diacritic, base]) => {
    normalized = normalized.replace(new RegExp(diacritic, 'g'), base);
  });
  
  return normalized;
};

const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  selectedValues,
  onSelectionChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOptions = options
    .filter(option => {
      const normalizedLabel = normalizeText(option.label);
      const normalizedSearch = normalizeText(searchTerm);
      return normalizedLabel.includes(normalizedSearch);
    })
    .sort((a, b) => a.label.localeCompare(b.label));

  const handleToggle = useCallback((value: string) => {
    const newSelection = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value];
    onSelectionChange(newSelection);
  }, [selectedValues, onSelectionChange]);

  return (
    <div className="multi-select-container">
      <label className="multi-select-header">
        {label}
      </label>
      <div className="multi-select-content">
        <div className="multi-select-input">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Search ${label.toLowerCase()}...`}
            className=""
          />
        </div>
        <div className="multi-select-scrollable">
          {filteredOptions.map(option => (
            <label
              key={option.value}
              className=""
            >
              <input
                type="checkbox"
                checked={selectedValues.includes(option.value)}
                onChange={() => handleToggle(option.value)}
                className="mr-2"
              />
              <span className="text-sm">{option.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MultiSelect;