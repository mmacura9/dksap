import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import './sender.css';
import { useNavigate } from 'react-router-dom';
import { ethers } from "ethers"; 
import { ensContractABI } from '../ABI/ensContractABI';
import { ephermalPubKeyRegistryContractABI } from '../ABI/ephermalPubKeyRegistryABI';
import {ec, curve} from 'elliptic';
import { keccak256 } from 'ethers';
import * as ethUtil from 'ethereumjs-util'; 
import { calculateSpendingAddress, getAddressFromPublicKey } from '../utils/addressUtils';
import BN from 'bn.js';

// Use the secp256k1 curve
const ellipticCurve = new ec('secp256k1');

// Example of smart contract ABI and address (replace these with your actual values)

// ENS contract address
const ENSContractAddress = "0xBfE39EbfD24c3bAA72dd2819564B8054c360F127";
const EphermalPubKeyRegistryContractAddress = "0xcEFffb6b5BC579b954eC1053A9DffcA7125d883d";

const Sender: React.FC = () => {
  const [account, setAccount] = useState<any>({ privateKey: '', address: '' });
  const [ephermalKey, setEphermalKey] = useState('');
  const [address, setAddress] = useState('');
  const [transactionStatus, setTransactionStatus] = useState<string>('');
  const [stealthAddress,setStealthAddress] = useState('');
  const web3 = new Web3();

  const navigate = useNavigate(); // Initialize the navigate hook

  // Load the account from localStorage on initial render
  useEffect(() => {
    const savedAccount = localStorage.getItem('account');
    if (!savedAccount) {
      navigate('/'); // Replace '/receiver' with the appropriate route
    }
  }, [navigate]);

  const handleGenerateEphermalPubKey = async () => {
    if (!address) {
      alert('Please enter a valid address.');
      return;
    }
    try {
      
      const web3 = new Web3(window.ethereum);

      await window.ethereum.request({ method: "eth_requestAccounts" });

      const accounts = await web3.eth.getAccounts();
      const userAddress = accounts[0];

      // Connect to MetaMask
      const ensContract = new web3.eth.Contract(ensContractABI,ENSContractAddress);

      // Get stealth key associated with reciever
      const stealthPublicAddress = await ensContract.methods.getStealthKey(address).call();
      console.log("Stealth Address:", stealthPublicAddress);
      setStealthAddress(stealthPublicAddress?.toString() ?? '');
      alert("Stealth address read successfully!");

      // Generate ephemeral key pair using ethers.js
      const ephermalAccount = web3.eth.accounts.create();
      const keyPair = ellipticCurve.keyFromPrivate(ephermalAccount.privateKey.slice(2), 'hex');
      const ephermalPublicKey = '0x' + keyPair.getPublic(false,'hex');
      //const ephermalPublicKey = '0xB95cdEAC24EA06a1B73b903bcAfB8baE094972F6';

      // console.log('Ephemeral Private Key:', ephermalAccount.privateKey);
      console.log('Ephemeral Public Key:', ephermalPublicKey);

      // Save the ephemeral key locally for use in transactions
      setEphermalKey(ephermalPublicKey);
      setAccount({ privateKey: ephermalAccount.privateKey, address: ephermalAccount.address });

      // setEphermalKey('0xB95cdEAC24EA06a1B73b903bcAfB8baE094972F6');
      // setAccount({ privateKey: '0x912e0479b1dc3de4d9b8033a3f60caffdca32c259f39ccdfb02ffcbfb7214cf3', address: '0xB95cdEAC24EA06a1B73b903bcAfB8baE094972F6' });
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

      // // Connect to MetaMask
      // const ephermalPubKeyRegistryContract = new web3.eth.Contract(ephermalPubKeyRegistryContractABI,EphermalPubKeyRegistryContractAddress);

      // // Send the transaction to add ephermal pub key
      // const txEphermal = await ephermalPubKeyRegistryContract.methods.addPubKey(ephermalKey).send({ from: userAddress });

      // console.log(`Transaction hash: ${txEphermal.transactionHash}`);  

      // // Optionally, wait for the transaction receipt
      // const receipt = await web3.eth.getTransactionReceipt(txEphermal.transactionHash);
      // console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);

      // alert("Ephermal pub key set successfully!");
      
      
      const ephermalKeyBasePoint = ellipticCurve.keyFromPrivate(ephermalKey, 'hex');
      console.log('Stealth address', stealthAddress)
      const stealthAddressBasePoint = ellipticCurve.keyFromPublic(stealthAddress.slice(2), 'hex').getPublic();

      const P = calculateSpendingAddress(new BN(account.privateKey.slice(2),16),stealthAddressBasePoint, stealthAddressBasePoint);
      console.log('PK for P: ',P);
      console.log('Address for sedning money: ' + getAddressFromPublicKey(P));

      const tx = {
                  from: userAddress,
                  to: getAddressFromPublicKey(P),
                  value: web3.utils.toWei('0.0000001', 'ether'),  // Send all balance
                  gas: 2000000,
                  gasPrice: await web3.eth.getGasPrice(),
                };
      const sentTx = await web3.eth.sendTransaction(tx);
      
      console.log(`Transaction successful with hash: ${sentTx.transactionHash}`);

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
                value={ephermalKey}
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