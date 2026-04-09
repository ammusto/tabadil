import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from 'components/Layout';
import About from 'components/About';
import MaintenancePage from './components/MaintenancePage';

import 'react-toastify/dist/ReactToastify.css';


const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/about" element={<About />} />
          <Route path="*" element={<MaintenancePage />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;