import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import './receiver.css';
import { useNavigate } from 'react-router-dom';
import { ensContractABI } from '../ABI/ensContractABI';
import { ephermalPubKeyRegistryContractABI } from '../ABI/ephermalPubKeyRegistryABI';
import { ethers } from "ethers"; 
import {ec} from "elliptic"
import { calculateSpendingAddress, calculateSpendingAddressPrivateKey, checkBalance, getAddressFromPublicKey } from '../utils/addressUtils';
const ellipticCurve = new ec('secp256k1');

// Example of smart contract ABI and address (replace these with your actual values)

// ENS contract address
const contractAddress = "0x3D9b6cC7F9523da3986166daB36138D40ba276B2";
const EphermalPubKeyRegistryContractAddress = "0xcEFffb6b5BC579b954eC1053A9DffcA7125d883d";

const Receiver: React.FC = () => {
  const [account, setAccount] = useState<any>({ privateKey: '', address: '' });
  const [stealth, setStealth] = useState('');
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
    const newAccount = generateAccount();
    console.log('Ethereum Address:', newAccount.address);
    console.log('Private Key:', newAccount.privateKey);

    // Extract the public key (G * m)
    const keyPair = ellipticCurve.keyFromPrivate(newAccount.privateKey.slice(2), 'hex');
    const publicKey = keyPair.getPublic(false,'hex'); // This is G * m
    console.log('Public Key (G * m)/stealth address:', '0x'+publicKey);
    setStealth('0x'+publicKey);
    setAccount(newAccount);
  };

  const handleGenerateSpendingKey = async () => {
    try {
      if (typeof window.ethereum === "undefined") {
        throw new Error("MetaMask is not installed");
      }
  
      const web3 = new Web3(window.ethereum);
  
      await window.ethereum.request({ method: "eth_requestAccounts" });
  
      const accounts = await web3.eth.getAccounts();
      const userAddress = accounts[0];
  
      // Connect to the contract
      const contract = new web3.eth.Contract(
        ephermalPubKeyRegistryContractABI,
        EphermalPubKeyRegistryContractAddress
      );
  
      // Call the contract method to fetch all ephemeral keys
      const ephemeralKeys = await contract.methods.getPubKeys().call({ from: userAddress });

      const m = ellipticCurve.keyFromPrivate(account.privateKey, 'hex').getPrivate();
      console.log("Ephemeral Keys:", ephemeralKeys);

      if (Array.isArray(ephemeralKeys)) {
        for (let i = 0; i < ephemeralKeys.length; i++) {
            const R = ellipticCurve.keyFromPublic(ephemeralKeys[i], 'hex').getPublic();
            const M = ellipticCurve.keyFromPublic(stealth, 'hex').getPublic();
            const currentP = calculateSpendingAddress(m,R,M);
            const ehtereumAddressP = getAddressFromPublicKey(currentP);
            const balanceAtP = await checkBalance(ehtereumAddressP ?? '');
            console.log(`Balance for address ${ehtereumAddressP}: ${balanceAtP} ETH`);
            if (parseFloat(balanceAtP) > 0 ) {
              const tx = {
                from: currentP,
                to: account.address,
                value: web3.utils.toWei(balanceAtP, 'ether'),  // Send all balance
                gas: 2000000,
                gasPrice: await web3.eth.getGasPrice(),
              };
              
              const p = calculateSpendingAddressPrivateKey(m,R,m);
              // Sign the transaction using the private key
              const signedTx = await web3.eth.accounts.signTransaction(tx, p);
        
              // Send the transaction
              const sentTx = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
              
              console.log(`Transaction successful with hash: ${sentTx.transactionHash}`);
            } else {
              console.log('Insufficient balance to send funds');
            }
          }
        }
    } catch (error) {
      console.error("Error fetching ephemeral keys:", error);
      alert("Failed to fetch ephemeral keys. Check console for details.");
    }
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
      const contract = new web3.eth.Contract(ensContractABI, contractAddress);

      // Send the transaction to set the stealth address
      const tx = await contract.methods.setStealthAddress(stealth).send({ from: userAddress });

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
                value={stealth}
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
      <div className="get-ephermals-card">
      <h1 className="header"> Generate spending key </h1>
        <button className="get-ephermal-btn" onClick={handleGenerateSpendingKey}>
          Generate spending key
        </button>
      </div>
    </div>
  );
};

export default Receiver;
