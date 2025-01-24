import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import { ensContractABI } from '../ABI/ensContractABI';
import { ephermalPubKeyRegistryContractABI } from '../ABI/ephermalPubKeyRegistryABI';
import {ec} from "elliptic"
import { calculateSpendingAddress, calculateSpendingAddressPrivateKey, checkBalance, generatePublicKeyFromPrivate, getAddressFromPublicKey} from '../utils/addressUtils';
import BN from 'bn.js';

const ellipticCurve = new ec('secp256k1');

// ENS contract address
const contractAddress = "0xBfE39EbfD24c3bAA72dd2819564B8054c360F127";
const EphermalPubKeyRegistryContractAddress = "0xcEFffb6b5BC579b954eC1053A9DffcA7125d883d";

const Receiver: React.FC = () => {
  const [account, setAccount] = useState<any>({ privateKey: '', address: '' });
  const [viweingAddress, setViweingAddress] = useState<any>({ privateKey: '', address: '' });
  const [userAddress, setUserAddress] = useState('');
  const [stealth, setStealth] = useState('');
  const [completeStealth, setCompleteStealth] = useState<{ privateStealth: string, publicStealth: string }>({
    privateStealth: '',
    publicStealth: ''
  });
  const [transactionStatus, setTransactionStatus] = useState<string>('');
  const [generatedSpendingKey,setGeneratedSpendingKey] = useState<string>('');
  const [sendingAddress,setSendingAddress] = useState<string>('');
  const [spendingKeyForTransaction,setSpendingKeyForTransaction] = useState<string>('');
  const [fundsForTransaction,setFundsForTransaction] = useState<string>('');

  const web3 = new Web3(process.env.REACT_APP_SEPOLIA_URL);

  const checkConnection = async () => {
    if (typeof window.ethereum === "undefined") {
      throw new Error("MetaMask is not installed");
    }

    const web3 = new Web3(window.ethereum);

    // Get accounts and set the first account as the user address
    const accounts = await web3.eth.getAccounts();
    console.log(accounts);
    if (!accounts.length) {
      return [];
    }
    return accounts;
  };

  useEffect(() => {
    const fetchAccount = async () => {
      const accounts = await checkConnection();
      if (!accounts.length) {
        return;
      }
      setUserAddress(accounts[0]);
    };

    fetchAccount();
  }, []); 

  const generateAccount = (): any => {
    const newAccount = web3.eth.accounts.create();
    return newAccount;
  };

  const handleGenerateAccount = () => {
    const newAccount = generateAccount();
    const publicKey = generatePublicKeyFromPrivate(newAccount.privateKey)
    const newViewingAccount = generateAccount();
    const newViewingKey = generatePublicKeyFromPrivate(newViewingAccount.privateKey);
    
    setStealth(publicKey);
    setAccount(newAccount);
    setViweingAddress(newViewingAccount);
  };

  const handleGenerateSpendingKey = async () => {
    try {
      if (typeof window.ethereum === "undefined") {
        throw new Error("MetaMask is not installed");
      }

      if (userAddress === '') {
        throw new Error("No accounts found");
      }
      
      // Connect to the contract
      const contract = new web3.eth.Contract(
        ephermalPubKeyRegistryContractABI,
        EphermalPubKeyRegistryContractAddress
      );
  
      // Call the contract method to fetch all ephemeral keys
      const ephemeralKeys : string [] = await contract.methods.getPubKeys().call({ from: userAddress });

      const m = new BN(completeStealth.privateStealth.slice(2),16);
      
      if (Array.isArray(ephemeralKeys)) {
        for (let i = 0; i < ephemeralKeys.length; i++) {
            if (ephemeralKeys[i].length < 66) {
              continue;
            }
            const R = ellipticCurve.keyFromPublic(ephemeralKeys[i].slice(2), 'hex').getPublic();
            const M = ellipticCurve.keyFromPublic(completeStealth.publicStealth.slice(2), 'hex').getPublic();

            const currentP = calculateSpendingAddress(m,R,M);
            const ehtereumAddressP = getAddressFromPublicKey(currentP);
            const balanceAtP = await checkBalance(ehtereumAddressP ?? '');
            console.log(`Balance for address ${ehtereumAddressP}: ${balanceAtP} ETH`);
            const balanceAtPFloat = parseFloat(balanceAtP);
            
            if (balanceAtPFloat > 0) {
              const p = calculateSpendingAddressPrivateKey(m,R,m);
              setGeneratedSpendingKey(p);
              
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
  
      const listAccounts = await checkConnection();
      console.log(listAccounts);
      if (listAccounts.length === 0) {
        setTransactionStatus('Error: No account found.');
        return;
      }
      const userAddress = listAccounts[0];
      if (typeof window.ethereum === "undefined") {
        throw new Error("MetaMask is not installed");
      }

      const web3 = new Web3(window.ethereum);

      await window.ethereum.request({ method: "eth_requestAccounts" });

      if (userAddress === '') {
        throw new Error("No accounts found");
      }

      // Connect to MetaMask
      const contract = new web3.eth.Contract(ensContractABI, contractAddress);
      const estimatedGas = await contract.methods.setStealthKey(stealth).estimateGas({ from: userAddress });
      // Send the transaction to set the stealth address
      const tx = await contract.methods.setStealthKey(stealth).send(
        { from: userAddress, 
        gas: estimatedGas.toString(),  // Use the estimated gas for accuracy
        gasPrice: web3.utils.toWei('20', 'gwei') });

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
  
  const handleUseSpendingKey = async () => {
    try {
      const latestBlock = await web3.eth.getBlock('latest');
      const baseFeePerGas = latestBlock.baseFeePerGas;
      const baseFee = parseInt(baseFeePerGas?.toString() ?? '0'); // Convert to a number
      const priorityFee = web3.utils.toWei('2', 'gwei'); // A typical priority fee
      const maxFee = baseFee + parseInt(priorityFee);
      const addressForTransaction = getAddressFromPublicKey(generatePublicKeyFromPrivate(spendingKeyForTransaction));

      const tx = {
        from: addressForTransaction,
        to: userAddress,
        value: web3.utils.toWei(fundsForTransaction, 'ether'),  // Send all balance
        gas: 21000,
        maxPriorityFeePerGas: priorityFee,
        maxFeePerGas: maxFee,
        chainId: 11155111
      };

      console.log(tx);

      const signedTx = await web3.eth.accounts.signTransaction(tx, spendingKeyForTransaction);

      // Send the transaction
      const sentTx = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
      
      console.log(`Transaction successful with hash: ${sentTx.transactionHash}`);

      alert("Funds sent successfully!");
    } catch (error) {
      console.error("Error using spending key:", error);
      alert("Failed to send assets with given spending key. Check console for details.");
    }
  };

  return (
    <div className="receiver-container">
      <div className="receiver-card">
        <h1 className="header">Generate Stealth Meta-Address</h1>
        <button className="generate-btn" onClick={handleGenerateAccount}>
          Generate Stealth Meta-Address
        </button>
        
        <div className="account-info">
          <div className="account-section">
            <h3>Private Key:</h3>
            <textarea
              value={account.privateKey || ""}
              readOnly
              rows={2}
              className="account-textarea"
            />
          </div>
          <div className="account-section">
            <h3>Public Address:</h3>
            <textarea
              value={stealth}
              readOnly
              rows={4}
              className="account-textarea"
            />
          </div>
          <div className="account-section">
            <h3>Private Viewing Key:</h3>
            <textarea
              value={account.privateKey}
              readOnly
              rows={2}
              className="account-textarea"
            />
          </div>
          <div className="account-section">
            <h3>Public Viewing Address:</h3>
            <textarea
              value={stealth}
              readOnly
              rows={4}
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
        <div className="get-ephermals-card">
      <h1 className="header"> Generate spending key </h1>
        <input
          type="text"
          className="myTextbox"
          placeholder="Enter private key of your stealth address"
          value={completeStealth.privateStealth}
          onChange={(e) => {
            const privateKey = e.target.value;
            setCompleteStealth({
              privateStealth:privateKey,
              publicStealth:generatePublicKeyFromPrivate(privateKey)});
          }} // Update state on input change
        />   
        <button className="get-ephermal-btn" onClick={handleGenerateSpendingKey}>
          Generate spending key
        </button>
        {generatedSpendingKey ??
        <div>
          <h2>Spending key for given private stealth address</h2>
          <div className="generated-spending-key">
              {generatedSpendingKey}
          </div>
        </div>
        }
      </div>
      <div className="get-transfer-card">
      <h1 className="header"> Transfer funds with spending key </h1>
        <input
          type="text"
          className="myTextbox"
          placeholder="Enter your private spending key"
          value={spendingKeyForTransaction}
          onChange={(e) => {
           setSpendingKeyForTransaction(e.target.value);}} // Update state on input change
        />   
        <input
          type="text"
          className="myTextbox"
          placeholder="Enter amount you want to send with your spending key"
          value={fundsForTransaction}
          onChange={(e) => {
           setFundsForTransaction(e.target.value)}} // Update state on input change
        /> 
        <input
          type="text"
          className="myTextbox"
          placeholder="Enter where you want to send funds"
          value={sendingAddress}
          onChange={(e) => {
            setSendingAddress(e.target.value);
          }} // Update state on input change
        /> 
        <button className="get-ephermal-btn" onClick={handleUseSpendingKey}>
          Send funds with your private spending key
        </button>
      </div>
      </div>
      
    </div>
  );
};

export default Receiver;
