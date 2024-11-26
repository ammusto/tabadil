import React, { useState, useEffect } from 'react';
import ReactSlider from 'react-slider';
import { useMetadata } from '../contexts/MetadataContext';
import { useSearch } from '../contexts/SearchContext';

const DateRangeSlider: React.FC = () => {
  const { dateRangeCache } = useMetadata();
  const { setDateRange } = useSearch();
  const [values, setValues] = useState<[number, number]>([0, 0]);

  useEffect(() => {
    if (dateRangeCache) {
      setValues([dateRangeCache.min, dateRangeCache.max]);
    }
  }, [dateRangeCache]);

  if (!dateRangeCache) return null;

  const handleChange = (newValues: [number, number]) => {
    setValues(newValues);
    setDateRange({ min: newValues[0], max: newValues[1] });
  };

  return (
    <div className="border rounded-lg bg-white p-4">
      <h3 className="text-sm font-medium mb-4">Author Death Date Range</h3>
      <ReactSlider
        className="horizontal-slider"
        thumbClassName="thumb"
        trackClassName="track"
        defaultValue={[dateRangeCache.min, dateRangeCache.max]}
        value={values}
        min={dateRangeCache.min}
        max={dateRangeCache.max}
        onChange={handleChange}
        pearling
        minDistance={10}
      />
      <div className="flex justify-between mt-2">
        <span className="text-sm text-gray-600">{values[0]}</span>
        <span className="text-sm text-gray-600">{values[1]}</span>
      </div>
    </div>
  );
};

export default DateRangeSlider;