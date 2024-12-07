import React from 'react';
import { MetadataProvider } from './contexts/MetadataContext';
import { SearchProvider } from './contexts/SearchContext';
import { ToastContainer } from 'react-toastify';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import TextMetadataPage from './components/TextMeta';
import Reader from 'components/Reader';
import Layout from 'components/Layout';
import SearchPage from './components/SearchPage';
import About from 'components/About';

import 'react-toastify/dist/ReactToastify.css';


const App: React.FC = () => {
  return (
    <Router>

      <MetadataProvider>
        <SearchProvider>
          <ToastContainer position="top-right" />
          <Layout>
            <Routes>
              <Route path="/reader/:textId/:pageId" element={<Reader />} />
              <Route path="/about" element={<About />} />
              <Route path="/text/:textId" element={<TextMetadataPage />} />
              <Route path="/" element={<SearchPage />} />
            </Routes>
          </Layout>
        </SearchProvider>
      </MetadataProvider>
    </Router>

  );
};

export default App;