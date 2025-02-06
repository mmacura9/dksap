  import React, { useState, useEffect } from 'react';
  import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
  import Layout from './components/Layout'; // Import the Layout component
  import Sender from './sender/sender'; // Import the Sender component
  import Receiver from './receiver/receiver'; // Import the Receiver component
  import './App.css'; // Optional: Your custom styles
  import RetrievalPopUp from './components/RetrievalPopUp';
  import MnemoicPhraseCreation from './components/MnemoicPhraseCreation';
  import Inspect from './inspect/inspect';
  import ChoicePopUp from './components/ChoicePopUp';
  import { web3 } from './utils/addressUtils';
  import { ephermalPubKeyRegistryContractABI } from './ABI/ephermalPubKeyRegistryABI';
  import { ensContractAddress, ephermalKeysContractAddress } from './constants';

  const App: React.FC = () => {

    const [retrievePopUp, setRetrievePopUp] = useState(false);
    const [createMnemonic, setCreateMnemonic] = useState(false);
    const [choisePopUp, setChoisePopUp] = useState(false);
    const [keysSet, setKeysSet] = useState('');

    useEffect(() => {
      const contract = new web3.eth.Contract(
        ephermalPubKeyRegistryContractABI,
        ephermalKeysContractAddress
      );
  
      // Set up the event listener
      const eventListener = contract.events.PubKeyAndTagAdded({
        fromBlock: 'latest',
      })
        .on('data', (event) => {
          const publicKey = event.returnValues.publicKey;
          const viewTag = event.returnValues.viewTag;
          console.log("New Public Key Added:", publicKey);
          console.log("View Tag:", viewTag);
  
          // You can save the data to localStorage or handle it as needed
          const data = { publicKey, viewTag };
          // Retrieve the existing data from localStorage (if any)
          const existingData = localStorage.getItem('ephemeralKeyData') ? JSON.parse(localStorage.getItem('ephemeralKeyData') ?? '') : [];

          // Add new data to the array
          const newData = { publicKey: 'newPublicKey', viewTag: 'newViewTag' };
          existingData.push(newData);

          // Save the updated array back to localStorage
          localStorage.setItem('ephemeralKeyData', JSON.stringify(existingData));
        })
  
      // Cleanup listener on component unmount
      return () => {
        return;
      };
    }, []);

    
    const onNo = async () => {
      setChoisePopUp(false);
    }

    const onYes = async () => {
      setCreateMnemonic(true);
      setChoisePopUp(false);
    }

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
              <Route path="/receiver" element={<Receiver setChoisePopUp={setChoisePopUp}setRetrievalPopUp={setRetrievePopUp} setCreateMnemonic={setCreateMnemonic} setKeysSet={setKeysSet}/>} />
              <Route path="/inspect" element={<Inspect/>} />
            </Routes>
          </div>
      </Router>
      {retrievePopUp && <RetrievalPopUp setRetrievalPopUp={setRetrievePopUp}/>}
      {createMnemonic && <MnemoicPhraseCreation setCreateMnemonic={setCreateMnemonic} keysSet= {keysSet}/>}
      {choisePopUp && <ChoicePopUp header='Do you want to save your private keys?' onNo={onNo} onYes = {onYes}/>}
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
