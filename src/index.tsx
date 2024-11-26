import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { MetadataProvider } from './contexts/MetadataContext';
import { SearchProvider } from './contexts/SearchContext';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <MetadataProvider>
      <SearchProvider>
        <App />
      </SearchProvider>
    </MetadataProvider>
  </React.StrictMode>
);