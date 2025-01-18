import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import './sender.css';
import { useNavigate } from 'react-router-dom';
import { ethers } from "ethers"; 
import { ensContractABI } from '../ABI/ensContractABI';
import { ephermalPubKeyRegistryContractABI } from '../ABI/ephermalPubKeyRegistryABI';

// Example of smart contract ABI and address (replace these with your actual values)

// ENS contract address
const ENSContractAddress = "0x3dc3251A1CeAFb50ce6CC107262668B75983c06B";
const EphermalPubKeyRegistryContractAddress = "0xD0c1CD72CAEe16b7c488Aa6B9185b5fd219EC45C";

const Sender: React.FC = () => {
  const [account, setAccount] = useState<any>({ privateKey: '', address: '' });
  const [ephermalKey, setEphermalKey] = useState('');
  const [address, setAddress] = useState('');
  const [transactionStatus, setTransactionStatus] = useState<string>('');
  const web3 = new Web3();

  const navigate = useNavigate(); // Initialize the navigate hook

  // Load the account from localStorage on initial render
  useEffect(() => {
    const savedAccount = localStorage.getItem('account');
    if (!savedAccount) {
      navigate('/'); // Replace '/receiver' with the appropriate route
    }
  }, [navigate]);

  const handleGenerateEphermalPubKey = () => {
    if (!address) {
      alert('Please enter a valid address.');
      return;
    }
    try {
      // Generate ephemeral key pair using ethers.js
      const ephermalAccount = web3.eth.accounts.create();
      const ephermalPublicKey = ephermalAccount.address;

      console.log('Ephemeral Private Key:', ephermalAccount.privateKey);
      console.log('Ephemeral Public Key:', ephermalPublicKey);

      // Save the ephemeral key locally for use in transactions
      setEphermalKey(ephermalAccount.address);
      setAccount({ privateKey: ephermalAccount.privateKey, address: ephermalPublicKey });
    } catch (error) {
      console.error('Error generating ephemeral key:', error);
    }
  };

  const handleSendEphermalPubKey = async () => {
    try {
      if (!account.address) {
        setTransactionStatus('Error: No account address generated.');
        return;
      }
  
      const savedAccount = localStorage.getItem('account');
      if (!savedAccount) {
        setTransactionStatus('Error: No account found in localStorage.');
        return;
      }
      if (typeof window.ethereum === "undefined") {
        throw new Error("MetaMask is not installed");
      }

      const web3 = new Web3(window.ethereum);

      await window.ethereum.request({ method: "eth_requestAccounts" });

      const accounts = await web3.eth.getAccounts();
      const userAddress = accounts[0];

      // Connect to MetaMask
      const ephermalPubKeyRegistryContract = new web3.eth.Contract(ephermalPubKeyRegistryContractABI,EphermalPubKeyRegistryContractAddress);

      // Send the transaction to add ephermal pub key
      const tx = await ephermalPubKeyRegistryContract.methods.addPubKey(ephermalKey).send({ from: userAddress });

      console.log(`Transaction hash: ${tx.transactionHash}`);

      // Optionally, wait for the transaction receipt
      const receipt = await web3.eth.getTransactionReceipt(tx.transactionHash);
      console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);

      alert("Ephermal pub key set successfully!");
    } catch (error) {
      console.error("Error publishing ephermal pubkey:", error);
      alert("Failed to add ephermal pub key. Check console for details.");
    }
  };
  

  return (
    <div className="receiver-container">
      <div className="receiver-card">
        <h1 className="header">Generate Ephermal Pub Key</h1>
        <div >
            <input
            type="text"
            id="myTextbox"
            placeholder="Enter address where you want to send funds"
            value={address}
            onChange={(e) => setAddress(e.target.value)} // Update state on input change
            />    
            <button className="generate-ephermal-btn" onClick={handleGenerateEphermalPubKey}>
            Generate Ephermal PubKey
            </button>
        </div>
        {account.privateKey && (
          <div className="account-info">
            <div className="account-section">
              <h2>Private Key:</h2>
              <textarea
                value={account.privateKey}
                readOnly
                rows={5}
                className="account-textarea"
              />
            </div>
            <div className="account-section">
              <h2>Ephermal pub key:</h2>
              <textarea
                value={account.address}
                readOnly
                rows={5}
                className="account-textarea"
              />
            </div>
            <button className="send-btn" onClick={handleSendEphermalPubKey}>
              Send Ephermal pubkey to Contract
            </button>
            {transactionStatus && (
              <div className="status-message">{transactionStatus}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sender;
