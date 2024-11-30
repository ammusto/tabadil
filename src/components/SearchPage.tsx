import React, { useState } from 'react';
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
    setSelectedGenres
  } = useSearch();


  const [showFilters, setShowFilters] = useState(false);
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
        <div className="search-input-section">
          <SearchForm
            showFilters={showFilters}
            setShowFilters={setShowFilters}
          />
        </div>

        {showFilters && (
          <div className="search-layout">
            <div className="search-sidebar">
              <div className="filter-section">
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
        )}

        <Results />
      </div>
    </div>
  );
};

export default SearchPage;