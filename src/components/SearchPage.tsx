import React from 'react';
import { useMetadata } from '../contexts/MetadataContext';
import { useSearch } from '../contexts/SearchContext';
import MultiSelect from './MultiSelect';
import TextFilter from './TextFilter';
import SearchForm from './SearchForm';
import Results from './Results';
import DateRangeSlider from './DateRangeSlider';
import SelectedTexts from './SelectedTexts';


const SearchPage: React.FC = () => {
  const { collections, genres, isLoading } = useMetadata();
  const { 
    selectedCollections, 
    selectedGenres,
    setSelectedCollections,
    setSelectedGenres
  } = useSearch();

  if (isLoading) {
    return <div className="search-page">Loading metadata...</div>;
  }

  const collectionOptions = collections.map(c => ({ value: c, label: c }));
  const genreOptions = genres.map(g => ({ value: g, label: g }));

  return (
    <div className="search-page">
      <div className="search-container">
        <div className="search-layout">
          {/* Left Sidebar */}
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

          {/* Main Content */}
          <div className="search-main">
            <div className="filter-section">
              <TextFilter />
            </div>
            <div className="filter-section">
            <SelectedTexts />
            </div>
          </div>
        </div>
        <div className="search-input-section">
          <SearchForm />
        </div>
        <div className="results-container">
          <Results />
        </div>
      </div>
    </div>
  );
};

export default SearchPage;