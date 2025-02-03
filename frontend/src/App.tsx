import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Layout from './components/Layout'; // Import the Layout component
import Sender from './sender/sender'; // Import the Sender component
import Receiver from './receiver/receiver'; // Import the Receiver component
import './App.css'; // Optional: Your custom styles
import RetrievalPopUp from './components/RetrievalPopUp';
import MnemoicPhraseCreation from './components/MnemoicPhraseCreation';
import Inspect from './inspect/inspect';

const App: React.FC = () => {

  const [retrievePopUp, setRetrievePopUp] = useState(false);
  const [createMnemonic, setCreateMnemonic] = useState(false);
    

  return (
    <div>
    <Router>

        <div className="app">
        <Layout setRetrievalPopUp={setRetrievePopUp} setCreateMnemonic={setCreateMnemonic}/>

          {/* Tab navigation */}
          <div className="tabs">
            <Link to="/sender" className="tab-link">Sender</Link>
            <Link to="/receiver" className="tab-link">Receiver</Link>
            <Link to="/inspect" className= 'tab-link'>Inspect</Link>
          </div>

          {/* Routes for Sender and Receiver components */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/sender" element={<Sender />} />
            <Route path="/receiver" element={<Receiver setRetrievalPopUp={setRetrievePopUp} setCreateMnemonic={setCreateMnemonic}/>} />
            <Route path="/inspect" element={<Inspect/>} />
          </Routes>
        </div>
    </Router>
    {retrievePopUp && <RetrievalPopUp setRetrievalPopUp={setRetrievePopUp}/>}
    {createMnemonic && <MnemoicPhraseCreation setCreateMnemonic={setCreateMnemonic}/>}
  </div>
  );
};

const Home: React.FC = () => {
  return (
    <div>
      <h1>Welcome to the DKSAP with key recovery </h1>
      <p>Select Sender or Receiver mode to proceed.</p>
    </div>
  );
};

export default App;
