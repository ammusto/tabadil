import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { MetadataProvider } from './contexts/MetadataContext';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
    <MetadataProvider>
      <App />
    </MetadataProvider>
);