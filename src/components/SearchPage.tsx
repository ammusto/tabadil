import React, { useState, useCallback } from 'react';
import { useMetadata } from '../contexts/MetadataContext';
import { useSearch } from '../contexts/SearchContext';
import MultiSelect from './MultiSelect';
import TextFilter from './TextFilter';
import SearchForm from './SearchForm';
import Results from './Results';
import DateRangeSlider from './DateRangeSlider';
import SelectedTexts from './SelectedTexts';
import LoadingGif from './LoadingGif';



const SearchPage: React.FC = () => {
  const { collections, genres, isLoading } = useMetadata();
  const {
    selectedCollections,
    selectedGenres,
    setSelectedCollections,
    setSelectedGenres,
    searchParams,
    addSearchForm,
    removeSearchForm,
    updateURLParams,
    setHasSearched,
    setSelectedTextIds,
    setResults,
    isLoading: isSearchLoading
  } = useSearch();

  const [showFilters, setShowFilters] = useState(false);





  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    // Filter out empty forms
    const nonEmptyForms = searchParams.forms.filter(form => {
      const hasKunya = form.kunyas.some(k => k.trim().length > 0);
      const hasNasab = form.nasab.trim().length > 0;
      const hasNisba = form.nisbas.some(n => n.trim().length > 0);
      return hasKunya || hasNasab || hasNisba;
    });

    // Update URL with all form data
    updateURLParams({
      forms: nonEmptyForms,
      page: 1
    });

    setHasSearched(true);
    setShowFilters(false);
  }, [searchParams.forms, updateURLParams, setHasSearched]);

  if (isLoading) {
    return <div className="container">
      <div className="search-container center">
        <p>Loading App and Text Metadata</p>
        <LoadingGif />
      </div>
    </div>;
  }

  const collectionOptions = collections.map(c => ({ value: c, label: c }));
  const genreOptions = genres.map(g => ({ value: g, label: g }));

  return (
    <div className="container">
      <div className="search-container">
        <form onSubmit={handleSubmit} className="search-forms-container">

          <div className="search-input-section">
            {searchParams.forms.map((form) => (
              <div key={form.formId} className="search-form-wrapper">
                <SearchForm
                  showFilters={showFilters}
                  setShowFilters={setShowFilters}
                  formId={form.formId}
                  isFirstForm={form.formId === 'form-0'}
                  onRemove={() => removeSearchForm(form.formId)}
                  onAdd={addSearchForm}
                  canAdd={searchParams.forms.length < 4}
                />
              </div>
            ))}
          </div>

          <div className="search-form-buttons">
            <button
              type="submit"
              disabled={isSearchLoading}
              className="search-button"
            >
              {isSearchLoading ? 'Loading...' : 'Search'}
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
              onClick={() => {
                updateURLParams({
                  forms: [{
                    formId: 'form-0',
                    kunyas: [],
                    nasab: '',
                    nisbas: [],
                    shuhra: '',
                    allowRareKunyaNisba: false,
                    allowTwoNasab: false,
                    allowKunyaNasab: false,
                    allowOneNasabNisba: false,
                    allowOneNasab: false,
                    allowSingleField: true,
                  }],
                  text_ids: [],
                  page: 1
                });
                setShowFilters(false);
                setSelectedTextIds([]);
                setSelectedCollections([]);
                setSelectedGenres([]);
                setResults([]);
                setHasSearched(false);
              }}
              className="reset-button"
            >
              Reset Search
            </button>
          </div>
        </form>


        {
          showFilters && (
            <div className="search-layout">
              <div className="search-sidebar">
                <div className="space-y-10">
                  <MultiSelect
                    label="Collections"
                    options={collectionOptions}
                    selectedValues={selectedCollections}
                    onSelectionChange={setSelectedCollections}
                  />

                  <MultiSelect
                    label="Genres"
                    options={genreOptions}
                    selectedValues={selectedGenres}
                    onSelectionChange={setSelectedGenres}
                  />

                  <DateRangeSlider />
                </div>
              </div>
              <div className="search-main">
                <div className="filter-section">
                  <TextFilter />
                </div>
                <div className="filter-section">
                  <SelectedTexts />
                </div>
              </div>
            </div>
          )
        }

        <Results />
      </div >
    </div>

  );
};

export default SearchPage;