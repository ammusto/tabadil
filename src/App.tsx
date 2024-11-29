import React from 'react';
import { MetadataProvider } from './contexts/MetadataContext';
import { SearchProvider } from './contexts/SearchContext';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from 'components/Layout';
import SearchPage from './components/SearchPage';
import About from 'components/About';
import { ToastContainer } from 'react-toastify';


const App: React.FC = () => {
  return (
    <Router>

      <MetadataProvider>
        <SearchProvider>
          <ToastContainer position="top-right" />
          <Layout>
            <Routes>
              <Route path="/about" element={<About />} />
              <Route path="/" element={<SearchPage />} />
            </Routes>
          </Layout>
        </SearchProvider>
      </MetadataProvider>
    </Router>

  );
};

export default App;