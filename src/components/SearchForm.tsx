import React, { useState, useCallback } from 'react';
import { useSearch } from '../contexts/SearchContext';

const SearchForm: React.FC = () => {
  const { performSearch, isLoading } = useSearch();
  const [kunya, setKunya] = useState('');
  const [nasab, setNasab] = useState('');
  const [nisbas, setNisbas] = useState<string[]>(['']);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    await performSearch(
      kunya,
      nasab,
      nisbas.filter(Boolean)
    );
  }, [kunya, nasab, nisbas, performSearch]);

  const addNisba = useCallback(() => {
    setNisbas(prev => [...prev, '']);
  }, []);

  const updateNisba = useCallback((index: number, value: string) => {
    setNisbas(prev => prev.map((n, i) => i === index ? value : n));
  }, []);

  const removeNisba = useCallback((index: number) => {
    setNisbas(prev => prev.filter((_, i) => i !== index));
  }, []);

  return (
    <form onSubmit={handleSubmit} className="search-form">
      <div className="input-group">
        <input
          type="text"
          value={kunya}
          onChange={(e) => setKunya(e.target.value)}
          placeholder="كنية (e.g., أبو منصور)"
          className="rtl-input"
          dir="rtl"
        />
      </div>
      
      <div className="input-group">
        <input
          type="text"
          value={nasab}
          onChange={(e) => setNasab(e.target.value)}
          placeholder="نسب (e.g., معمر بن أحمد)"
          className="rtl-input"
          dir="rtl"
        />
      </div>

      <div className="nisba-group">
        {nisbas.map((nisba, index) => (
          <div key={index} className="nisba-input">
            <input
              type="text"
              value={nisba}
              onChange={(e) => updateNisba(index, e.target.value)}
              placeholder="نسبة (e.g., الاصبهاني)"
              className="rtl-input"
              dir="rtl"
            />
            {index > 0 && (
              <button
                type="button"
                onClick={() => removeNisba(index)}
                className="remove-nisba"
              >
                ×
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={addNisba} className="add-nisba">
          + Add Nisba
        </button>
      </div>

      <button type="submit" disabled={isLoading} className="search-button">
        {isLoading ? 'Searching...' : 'Search'}
      </button>
    </form>
  );
};

export default SearchForm;