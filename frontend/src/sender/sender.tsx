import React, { useEffect, useState } from 'react';
import { ensContractABI } from '../ABI/ensContractABI';
import { ephermalPubKeyRegistryContractABI } from '../ABI/ephermalPubKeyRegistryABI';
import {ec} from 'elliptic';
import { calculateSharedSecret, calculateSpendingAddress, getAddressFromPublicKey } from '../utils/addressUtils';
import BN from 'bn.js';
import { web3 } from '../utils/addressUtils';
import { ensContractAddress, ephermalKeysContractAddress } from '../constants';

// Use the secp256k1 curve
const ellipticCurve = new ec('secp256k1');

const Sender: React.FC = () => {
  const [account, setAccount] = useState<any>({ privateKey: '', address: '' });
  const [fundsToSend, setFundsToSend] = useState('0');
  const [ephermalKey, setEphermalKey] = useState('');
  const [address, setAddress] = useState('');
  const [transactionStatus, setTransactionStatus] = useState<string>('');
  const [stealthAddress, setStealthAddress] = useState('');
  const [viewingKey, setViewingKey] = useState('');

  const handleGenerateEphermalPubKey = async () => {
    if (!address) {
      alert('Please enter a valid address.');
      return;
    }
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });

      const accounts = await web3.eth.getAccounts();
      const userAddress = accounts[0];

      // Connect to MetaMask
      const ensContract = new web3.eth.Contract(ensContractABI,ensContractAddress);

      // Get stealth key associated with reciever
      const keyPairFromContract: {
        0: string;
        1: string;
        __length__: number;
        metaStealthKey: string;
        viewingKey: string;
      } = await ensContract.methods.getKeyPair(address).call();
      if (keyPairFromContract.__length__ !== 2) {
        alert('Not correct length of stealth address and viewing key' + keyPairFromContract.__length__);
        return;
      }
      setStealthAddress(keyPairFromContract.metaStealthKey ?? '');
      setViewingKey(keyPairFromContract.viewingKey ?? '');
      alert("Stealth address read successfully!");

      // Generate ephemeral key pair using ethers.js
      const ephermalAccount = web3.eth.accounts.create();
      const keyPair = ellipticCurve.keyFromPrivate(ephermalAccount.privateKey.slice(2), 'hex');
      const ephermalPublicKey = '0x' + keyPair.getPublic(false,'hex');
    
      // Save the ephemeral key locally for use in transactions
      setEphermalKey(ephermalPublicKey);
      setAccount({ privateKey: ephermalAccount.privateKey, address: ephermalAccount.address });

    } catch (error) {
      console.error('Error generating ephemeral key:', error);
    }
  };

  const handleSendEphermalPubKeyAndSendFunds = async () => {
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

      await window.ethereum.request({ method: "eth_requestAccounts" });

      const accounts = await web3.eth.getAccounts();
      const userAddress = accounts[0];

      // Connect to MetaMask
      const ephermalPubKeyRegistryContract = new web3.eth.Contract(ephermalPubKeyRegistryContractABI,ephermalKeysContractAddress);

      const K = ellipticCurve.keyFromPublic(stealthAddress.slice(2), 'hex').getPublic(); // K
      const V = ellipticCurve.keyFromPublic(viewingKey.slice(2), 'hex').getPublic(); // V
      const r = new BN(account.privateKey.slice(2),16); // r
      const sharedSecret = calculateSharedSecret(r,V);
      const viewTag = new TextEncoder().encode(sharedSecret.getX().toString('hex'))[0].toString();

      const P = calculateSpendingAddress(r,V, K);

      const txEphermal = await ephermalPubKeyRegistryContract.methods.addPubKeyAndTag(ephermalKey, viewTag).send({ from: userAddress });
      // Optionally, wait for the transaction receipt
      const receipt = await web3.eth.getTransactionReceipt(txEphermal.transactionHash);
      
      alert("Ephermal pub key set successfully!");

      const tx = {
                  from: userAddress,
                  to: getAddressFromPublicKey(P),
                  value: web3.utils.toWei(fundsToSend, 'ether'),  // Send all balance
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
            className="myTextbox"
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
            <div className="account-section">
            <h2>Funds to send:</h2>
            <input
              type="text"
              className="myTextbox"
              placeholder="Enter private key of your stealth address"
              value={fundsToSend}
              onChange={(e) => {
                setFundsToSend(e.target.value);
              }} // Update state on input change
            />   
            <button className="send-btn" onClick={handleSendEphermalPubKeyAndSendFunds}>
              Send Ephermal pubkey to Contract and Send funds to the address
            </button>
            {transactionStatus && (
              <div className="status-message">{transactionStatus}</div>
            )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


export default Sender;