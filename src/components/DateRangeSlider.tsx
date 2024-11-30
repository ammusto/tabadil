import React, { useState, useEffect } from 'react';
import ReactSlider from 'react-slider';
import { useMetadata } from '../contexts/MetadataContext';
import { useSearch } from '../contexts/SearchContext';
import './DateRangeSlider.css'

const DateRangeSlider: React.FC = () => {
  const { dateRangeCache } = useMetadata();
  const { setDateRange } = useSearch();
  const [values, setValues] = useState<[number, number]>([0, 0]);
  const [inputValues, setInputValues] = useState<[string, string]>(['0', '0']);

  useEffect(() => {
    if (dateRangeCache) {
      setValues([dateRangeCache.min, dateRangeCache.max]);
      setInputValues([dateRangeCache.min.toString(), dateRangeCache.max.toString()]);
    }
  }, [dateRangeCache]);

  if (!dateRangeCache) return null;

  const handleSliderChange = (newValues: [number, number]) => {
    setValues(newValues);
    setInputValues([newValues[0].toString(), newValues[1].toString()]);
    setDateRange({ min: newValues[0], max: newValues[1] });
  };

  const handleInputChange = (value: string, index: 0 | 1) => {
    const newInputValues: [string, string] = [...inputValues] as [string, string];
    newInputValues[index] = value;
    setInputValues(newInputValues);

    // Only update if both values are valid numbers
    const newMin = parseInt(newInputValues[0]);
    const newMax = parseInt(newInputValues[1]);

    if (!isNaN(newMin) && !isNaN(newMax)) {
      // Ensure values stay within bounds
      const boundedMin = Math.max(dateRangeCache.min, Math.min(newMin, dateRangeCache.max));
      const boundedMax = Math.max(dateRangeCache.min, Math.min(newMax, dateRangeCache.max));
      
      // Ensure min doesn't exceed max
      const finalMin = Math.min(boundedMin, boundedMax);
      const finalMax = Math.max(boundedMin, boundedMax);

      setValues([finalMin, finalMax]);
      setDateRange({ min: finalMin, max: finalMax });
    }
  };

  const handleInputBlur = (index: 0 | 1) => {
    // Reset to current slider value if input is invalid
    const currentValue = values[index];
    const inputValue = parseInt(inputValues[index]);

    if (isNaN(inputValue)) {
      const newInputValues: [string, string] = [...inputValues] as [string, string];
      newInputValues[index] = currentValue.toString();
      setInputValues(newInputValues);
    }
  };

  return (
    <div className="date-slider-container center">
      Author Death Date Range
      <ReactSlider
        className="horizontal-slider"
        thumbClassName="thumb"
        trackClassName="track"
        defaultValue={[dateRangeCache.min, dateRangeCache.max]}
        value={values}
        min={dateRangeCache.min}
        max={dateRangeCache.max}
        onChange={handleSliderChange}
        pearling
        minDistance={10}
      />
      <div className="center date-range-inputs">
        <input
          type="number"
          value={inputValues[0]}
          onChange={(e) => handleInputChange(e.target.value, 0)}
          onBlur={() => handleInputBlur(0)}
          min={dateRangeCache.min}
          max={dateRangeCache.max}
          className="date-input"
        />
        <span className="date-separator">-</span>
        <input
          type="number"
          value={inputValues[1]}
          onChange={(e) => handleInputChange(e.target.value, 1)}
          onBlur={() => handleInputBlur(1)}
          min={dateRangeCache.min}
          max={dateRangeCache.max}
          className="date-input"
        />
      </div>
    </div>
  );
};

export default DateRangeSlider;