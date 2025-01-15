import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './home'; // assuming Home is already created
import Receiver from './receiver'; // import the new Receiver component

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/receiver" element={<Receiver />} />
      </Routes>
    </Router>
  );
};

export default App;
