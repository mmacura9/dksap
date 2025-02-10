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
import { ensContractABI } from './ABI/ensContractABI';

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
        .on('data', (event:any) => {
          const { returnValues } = event;
          if (!returnValues) {
              console.error("returnValues is undefined");
              return;
          }

          const publicKey = returnValues.pubKey;  // Use the event parameter names from Solidity
          const viewTag = returnValues.tag; 
          
          // You can save the data to localStorage or handle it as needed
          const data = { publicKey, viewTag };
          // Retrieve the existing data from localStorage (if any)
          const existingData = localStorage.getItem('ephemeralKeyData') ? JSON.parse(localStorage.getItem('ephemeralKeyData') ?? '') : [];

          // Add new data to the array
          const newData = { publicKey: publicKey, viewTag: viewTag };
          existingData.push(newData);
          
          const finalData : any = [];
          const publicKeys : string [] = [];
          const viewTags : string []= [];

          for (let i=0; i<existingData.length;i++) {
            const currPublicKey = existingData[i].publicKey;
            const currViewTag = existingData[i].viewTag;
    
            if (publicKeys.includes(currPublicKey) && viewTags.includes(currViewTag)){
              continue;
            }
    
            publicKeys.push(currPublicKey);
            viewTags.push(currViewTag);
            finalData.push(existingData[i]);
          }

          // Save the updated array back to localStorage
          localStorage.setItem('ephemeralKeyData', JSON.stringify(finalData));
        })
  
      // Cleanup listener on component unmount
      return () => {
        contract.events.PubKeyAndTagAdded().off('data',()=>{});
      };
    }, []);

    useEffect(() => {
      const contract = new web3.eth.Contract(
        ensContractABI,
        ensContractAddress
      );
      
      //address indexed publicAddress, string metaStealthKey, string viewingKey
      // Set up the event listener
      const eventListener = contract.events.KeyPairSet({
        fromBlock: 'latest',
      })
        .on('data', (event:any) => {
          const { returnValues } = event;
          if (!returnValues) {
              console.error("returnValues is undefined");
              return;
          }

          const metaStealthKey = returnValues.metaStealthKey;  // Use the event parameter names from Solidity
          const viewingKey = returnValues.viewingKey; 
  
          // You can save the data to localStorage or handle it as needed
          const data = { metaStealthKey, viewingKey };
          // Retrieve the existing data from localStorage (if any)
          const existingData = localStorage.getItem('stealthData') ? JSON.parse(localStorage.getItem('stealthData') ?? '') : [];

          // Add new data to the array
          const newData = { metaStealthKey: metaStealthKey, viewingKey: viewingKey };
          existingData.push(newData);

          const finalData : any = [];
          const metaStealthKeys : string [] = [];
          const viewingKeys : string []= [];

          for (let i=0; i<existingData.length;i++) {
            const currMetaStealthKey = existingData[i].metaStealthKey;
            const currViewingKey = existingData[i].viewingKey;
    
            if (metaStealthKeys.includes(currMetaStealthKey) && viewingKeys.includes(currViewingKey)){
              continue;
            }
    
            metaStealthKeys.push(currMetaStealthKey);
            viewingKeys.push(currViewingKey);
            finalData.push(existingData[i]);
          }

          // Save the updated array back to localStorage
          localStorage.setItem('stealthData', JSON.stringify(finalData));
        })
  
      // Cleanup listener on component unmount
      return () => {
        contract.events.KeyPairSet().off('data',()=>{});
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
