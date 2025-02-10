import React, { useEffect, useState, ReactNode } from 'react';
// import Web3 from 'web3';
import { ensContractABI } from '../ABI/ensContractABI';
import { ephermalPubKeyRegistryContractABI } from '../ABI/ephermalPubKeyRegistryABI';
import {ec} from "elliptic"
import { calculateSharedSecret, calculateSpendingAddress, calculateSpendingAddressPrivateKey, checkBalance, generatePublicKeyFromPrivate, getAddressFromPublicKey} from '../utils/addressUtils';
import BN from 'bn.js';
import { web3 } from '../utils/addressUtils';
import { chainId, ensContractAddress, ephermalKeysContractAddress } from '../constants';

interface RecieverProps {
  children?: ReactNode;
  setRetrievalPopUp: React.Dispatch<React.SetStateAction<boolean>>;
  setCreateMnemonic: React.Dispatch<React.SetStateAction<boolean>>;
  setChoisePopUp: React.Dispatch<React.SetStateAction<boolean>>;
  setKeysSet?: React.Dispatch<React.SetStateAction<string>>;
}


const ellipticCurve = new ec('secp256k1');
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const Receiver: React.FC <RecieverProps> = ({children,setRetrievalPopUp, setCreateMnemonic, setKeysSet, setChoisePopUp}) => {
  const [account, setAccount] = useState<any>({ privateKey: '', address: '' });
  const [viewingAddress, setViewingAddress] = useState<any>({ privateKey: '', address: '' });
  const [viewingGenerationAddress, setViewingGenerationAddress] = useState<any>({ privateKey: '', address: '' });
  const [viewingKey, setViewingKey] = useState('');
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

  const checkConnection = async () => {
    if (typeof window.ethereum === "undefined") {
      throw new Error("MetaMask is not installed");
    }

    // Get accounts and set the first account as the user address
    const accounts = await web3.eth.getAccounts();
    
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
    setViewingAddress(newViewingAccount);
    setViewingKey(newViewingKey);
  };

  const handleGenerateSpendingKey = async () => {
    try {
      if (typeof window.ethereum === "undefined") {
        throw new Error("MetaMask is not installed");
      }

      if (userAddress === '') {
        throw new Error("No accounts found");
      }
      
      const result =localStorage.getItem('ephemeralKeyData') ? JSON.parse(localStorage.getItem('ephemeralKeyData') ?? ''): [];
      const ephemeralKeys: string[] = [];
      const viewTags: string[] = [];

      for (let i=0; i<result.length;i++) {
        const currPubKey = result[i].publicKey;
        const currViewTag = result[i].viewTag;

        if (ephemeralKeys.includes(currPubKey) && viewTags.includes(currViewTag)){
          continue;
        }

        ephemeralKeys.push(currPubKey);
        viewTags.push(currViewTag);
      }

      const v = new BN(viewingGenerationAddress.privateKey.slice(2), 16);
      const V = ellipticCurve.keyFromPublic(viewingGenerationAddress.publicKey.slice(2), 'hex').getPublic();
      const k = new BN(completeStealth.privateStealth.slice(2), 16);
      const K = ellipticCurve.keyFromPublic(completeStealth.publicStealth.slice(2), 'hex').getPublic();
      
      if (Array.isArray(ephemeralKeys)) {
          for (let i=ephemeralKeys.length-1; i>=0; i--) {
            await sleep(100);
            const ephemeral = ephemeralKeys[i];
            const viewTag = viewTags[i]
            if (viewTag === 'newViewTag') {
              continue;
            }
            
            const R = ellipticCurve.keyFromPublic(ephemeral.slice(2), 'hex').getPublic();
            const S =calculateSharedSecret(v,R);
            const currentViewTag = new TextEncoder().encode(S.getX().toString('hex'))[0].toString();
           
            if (currentViewTag !== viewTag) {
              continue;
            }
            
            const P = calculateSpendingAddress(v, R, K);
            const ehtereumAddressP = getAddressFromPublicKey(P);
            const balanceAtP = await checkBalance(ehtereumAddressP ?? '');
            const balanceAtPFloat = parseFloat(balanceAtP);
            
            if (balanceAtPFloat > 0) {
              const p = calculateSpendingAddressPrivateKey(v, R, k);
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
  

  const callSetKeys = async () => {
    const privateKeyString = account?.privateKey ? account.privateKey : 'No private key';
    const viewingKeyString = viewingAddress?.privateKey ? viewingAddress.privateKey : 'No viewing key';

    if (setKeysSet) {
      setKeysSet('private key: '+ privateKeyString + ', viewing key: ' + viewingKeyString);
    }
  }

  const handleSendMetaAddress = async () => {
    try {
      if (!account.address) {
        setTransactionStatus('Error: No account address generated.');
        return;
      }
  
      const listAccounts = await checkConnection();
      if (listAccounts.length === 0) {
        setTransactionStatus('Error: No account found.');
        return;
      }
      const userAddress = listAccounts[0];
      if (typeof window.ethereum === "undefined") {
        throw new Error("MetaMask is not installed");
      }

      await window.ethereum.request({ method: "eth_requestAccounts" });

      if (userAddress === '') {
        throw new Error("No accounts found");
      }

      const contract = new web3.eth.Contract(ensContractABI, ensContractAddress);
      const estimatedGas = await contract.methods.setKeyPair(stealth, viewingKey).estimateGas({ from: userAddress });

      const gasPrice = await web3.eth.getGasPrice(); 
      const fastGasPrice = BigInt(gasPrice) * BigInt(2); // Double it for faster execution

      const bufferGas = Math.floor(Number(estimatedGas) * 1.2); // Add 20% buffer
      // Send the transaction to set the stealth address
      const tx = await contract.methods.setKeyPair(stealth, viewingKey).send(
        { from: userAddress, 
        gas: bufferGas.toString(),  // Use the estimated gas for accuracy
        gasPrice: fastGasPrice.toString() });

      // Optionally, wait for the transaction receipt
      const receipt = await web3.eth.getTransactionReceipt(tx.transactionHash);

      alert("Stealth address set successfully!");
      
      setChoisePopUp(true);
      callSetKeys();

      setTransactionStatus('');
    
    } catch (error) {
      console.error("Error setting stealth address:", error);
      alert("Failed to set stealth address. Check console for details.");
    }
  };

  const handleForgotPrivateKey = async () => {
    setRetrievalPopUp(true);
  }
  
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
        chainId: chainId
      };
      
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
              value={viewingAddress.privateKey}
              readOnly
              rows={2}
              className="account-textarea"
            />
          </div>
          <div className="account-section">
            <h3>Public Viewing Address:</h3>
            <textarea
              value={viewingKey}
              readOnly
              rows={4}
              className="account-textarea"
            />
          </div>
          <button className="send-btn" onClick={handleSendMetaAddress}>
            Send Meta Address to Contract
          </button>
          {transactionStatus && (
            <div className="status-message error">{transactionStatus}</div>
          )}
        </div>
        <div className="get-ephermals-card">
      <h1 className="header"> Generate spending key </h1>
        <input
          type="text"
          className="myTextbox"
          placeholder="Enter private key of your stealth address"
          onChange={(e) => {
            const privateKey = e.target.value;
            setCompleteStealth({
              privateStealth: privateKey,
              publicStealth: generatePublicKeyFromPrivate(privateKey)});
          }} // Update state on input change
        />
        <input
          type="text"
          className="myTextbox"
          placeholder="Enter private viewing key of your stealth address"
          onChange={(e) => {
            const privateKey = e.target.value;
            setViewingGenerationAddress({
              privateKey: privateKey,
              publicKey: generatePublicKeyFromPrivate(privateKey)});
          }} // Update state on input change
        />
        {generatedSpendingKey &&
        <div>
          <h3>Spending key for given private stealth address</h3>
          <div className="generated-spending-key">
              {generatedSpendingKey}
          </div>
        </div>
        }
        <button className="get-ephermal-btn" onClick={handleGenerateSpendingKey}>
          Generate spending key
        </button>
        <div onClick={handleForgotPrivateKey} className="forgot-link">
          Forgot private stealth keys?
        </div>
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
