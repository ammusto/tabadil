import React from 'react';
import { MetadataProvider } from './contexts/MetadataContext';
import { SearchProvider } from './contexts/SearchContext';
import SearchPage from './components/SearchPage';

const App: React.FC = () => {
  return (
    <MetadataProvider>
      <SearchProvider>
        <div className="app">
          <SearchPage />
        </div>
      </SearchProvider>
    </MetadataProvider>
  );
};

export default App;