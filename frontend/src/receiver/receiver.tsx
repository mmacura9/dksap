import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import './receiver.css';
import { useNavigate } from 'react-router-dom';
import { contractABI } from './contractABI';
import { ethers } from "ethers"; 

// Example of smart contract ABI and address (replace these with your actual values)

// ENS contract address
const contractAddress = "0x3dc3251A1CeAFb50ce6CC107262668B75983c06B";

const Receiver: React.FC = () => {
  const [account, setAccount] = useState<any>({ privateKey: '', address: '' });
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

  const generateAccount = (): any => {
    const newAccount = web3.eth.accounts.create();
    return newAccount;
  };

  const handleGenerateAccount = () => {
    console.log(localStorage.getItem('account'));
    const newAccount = generateAccount();
    setAccount(newAccount);
  };

  const handleSendMetaAddress = async () => {
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
      const contract = new web3.eth.Contract(contractABI, contractAddress);

      // Send the transaction to set the stealth address
      const tx = await contract.methods.setStealthAddress(account.address).send({ from: userAddress });

      console.log(`Transaction hash: ${tx.transactionHash}`);

      // Optionally, wait for the transaction receipt
      const receipt = await web3.eth.getTransactionReceipt(tx.transactionHash);
      console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);

      alert("Stealth address set successfully!");
    } catch (error) {
      console.error("Error setting stealth address:", error);
      alert("Failed to set stealth address. Check console for details.");
    }
  };
  

  return (
    <div className="receiver-container">
      <div className="receiver-card">
        <h1 className="header">Generate Stealth Meta-Address</h1>
        <button className="generate-btn" onClick={handleGenerateAccount}>
          Generate Stealth Meta-Address
        </button>
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
              <h2>Public Address:</h2>
              <textarea
                value={account.address}
                readOnly
                rows={5}
                className="account-textarea"
              />
            </div>
            <button className="send-btn" onClick={handleSendMetaAddress}>
              Send Meta Address to Contract
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

export default Receiver;
