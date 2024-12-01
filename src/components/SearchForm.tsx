import React, { useState, useCallback } from 'react';
import { useSearch } from '../contexts/SearchContext';
import { toast } from 'react-toastify';
import SearchInput from './SearchInput';
import './SearchForm.css';

interface SearchFormProps {
  showFilters: boolean;
  setShowFilters: React.Dispatch<React.SetStateAction<boolean>>;
}

const SearchForm: React.FC<SearchFormProps> = ({ showFilters, setShowFilters }) => {
  const { searchParams, updateURLParams, setHasSearched, isLoading, setSelectedTextIds, setSelectedCollections,
    setSelectedGenres, setResults } = useSearch();

  const [kunyas, setKunyas] = useState<string[]>(
    searchParams.kunyas.length > 0 ? searchParams.kunyas : ['']
  );
  const [nasab, setNasab] = useState(searchParams.nasab);
  const [nisbas, setNisbas] = useState<string[]>(
    searchParams.nisbas.length > 0 ? searchParams.nisbas : ['']
  );
  const [allowRareKunyaNisba, setAllowRareKunyaNisba] = useState(searchParams.allowRareKunyaNisba);
  const [allowTwoNasab, setallowTwoNasab] = useState(searchParams.allowTwoNasab);
  const [allowKunyaNasab, setAllowKunyaNasab] = useState(searchParams.allowKunyaNasab);
  const [allowOneNasab, setallowOneNasab] = useState(searchParams.allowOneNasab);

  const tooltips = {
    kunya: "Enter the kunya (e.g. أبو منصور)",
    laqab: "Enter a laqab (e.g. قوام السنة)",
    nasab: "Enter nasab with at least two names (e.g. معمر بن أحمد)",
    nisba: "Enter a nisba (e.g. الأصبهاني)"
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateInputs(kunyas, nasab, nisbas, allowRareKunyaNisba, allowTwoNasab, allowKunyaNasab)) {
      toast.error("Please enter at least 2 of: kunya, nasab, or nisba to search");
      return;
    }

    updateURLParams({
      kunyas: kunyas.filter(Boolean),
      nasab,
      nisbas: nisbas.filter(Boolean),
      allowRareKunyaNisba,
      allowTwoNasab,
      allowKunyaNasab,
      page: 1
    });
    setHasSearched(true);
    setShowFilters(false);
  };

  const handleReset = useCallback(() => {
    setKunyas(['']);
    setNasab('');
    setNisbas(['']);
    setHasSearched(false);
    setAllowRareKunyaNisba(false);
    setallowTwoNasab(false);
    setAllowKunyaNasab(false);
    setSelectedTextIds([]);
    setSelectedCollections([]);
    setSelectedGenres([]);
    setResults([]);
    setShowFilters(false);
  }, [
    setHasSearched,
    setResults,
    setSelectedTextIds,
    setSelectedCollections,
    setSelectedGenres,
    setShowFilters
  ]);

  const addKunya = useCallback(() => {
    if (kunyas.length < 2) {
      setKunyas(prev => [...prev, '']);
    }
  }, [kunyas.length]);

  const updateKunya = useCallback((index: number, value: string) => {
    setKunyas(prev => prev.map((k, i) => i === index ? value : k));
  }, []);

  const removeKunya = useCallback((index: number) => {
    setKunyas(prev => prev.filter((_, i) => i !== index));
  }, []);

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
    <div className='search-form-container'>
      <form onSubmit={handleSubmit} className="search-form">
        <div className="input-group">
          {kunyas.map((kunya, index) => (
            <div key={index} className="kunya-input">
              <SearchInput
                value={kunya}
                onChange={(value) => updateKunya(index, value)}
                placeholder={index === 1 ? 'لقب' : 'كنية'}
                tooltip={index === 1 ? tooltips.laqab : tooltips.kunya}
                dir="rtl"
              />
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeKunya(index)}
                  className="remove-kunya"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          {kunyas.length < 2 && (
            <button type="button" onClick={addKunya} className="add-kunya">
              Add Laqab
            </button>
          )}
          <div className="form-checkbox">
            <label>
              <input
                type="checkbox"
                checked={allowRareKunyaNisba}
                onChange={(e) => setAllowRareKunyaNisba(e.target.checked)}
              />
              Search Kunya + Nisba
            </label>
          </div>
        </div>

        <div className="input-group">
          <SearchInput
            value={nasab}
            onChange={setNasab}
            placeholder="نَسَب"
            tooltip={tooltips.nasab}
            dir="rtl"
          />
          <div className="form-checkbox">
            <label>
              <input
                type="checkbox"
                checked={allowTwoNasab}
                onChange={(e) => setallowTwoNasab(e.target.checked)}
              />
              Search 2-part nasab
            </label>
          </div>
          <div className="form-checkbox">
            <label>
              <input
                type="checkbox"
                checked={allowKunyaNasab}
                onChange={(e) => setAllowKunyaNasab(e.target.checked)}
              />
              Search Kunya + 1st Nasab
            </label>
          </div>
          <div className="form-checkbox">
            <label>
              <input
                type="checkbox"
                checked={allowOneNasab}
                onChange={(e) => setallowOneNasab(e.target.checked)}
              />
              Search 1st Nasab + Nisba
            </label>
          </div>
        </div>

        <div className="input-group">
          {nisbas.map((nisba, index) => (
            <div key={index} className="nisba-input">
              <SearchInput
                value={nisba}
                onChange={(value) => updateNisba(index, value)}
                placeholder={`نسبة ${index + 1}`}
                tooltip={tooltips.nisba}
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
            Add Nisba
          </button>
        </div>
        <div className="search-form-buttons">
          <button
            type="submit"
            disabled={isLoading}
            className="search-button"
          >
            {isLoading ? 'Loading...' : 'Search'}
          </button>

          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="filter-button"
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="reset-button"
          >
            Reset Search
          </button>
        </div>
      </form>
    </div>
  );
};

const validateInputs = (
  kunyas: string[],
  nasab: string,
  nisbas: string[],
  allowRare: boolean,
  allowNasab: boolean,
  allowKunyaNasab: boolean,
): boolean => {
  const hasKunya = kunyas.some(kunya => kunya.trim().length > 0);
  const hasNasab = nasab.trim().length > 0;
  const hasNisba = nisbas.some(nisba => nisba.trim().length > 0);

  if (allowRare && allowNasab && hasKunya && hasNisba && allowKunyaNasab) {
    return true;
  }

  const filledInputs = [hasKunya, hasNasab, hasNisba].filter(Boolean).length;
  return filledInputs >= 2;
};

export default SearchForm;