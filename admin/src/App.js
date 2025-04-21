import React, { useEffect } from 'react';
import './App.css';
import './Theme.css';
import Engine from './Engine';
import { BrowserRouter as Router } from 'react-router-dom';
import AuthProvider from './AuthProvider';
import ScrollToTop from './ScrollToTop';


function App() {

  return (
    <Router>
      <div className="App">
        <ScrollToTop />
        <AuthProvider />
      </div>
    </Router>
  );
}

export default App;
