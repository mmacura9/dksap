import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import './receiver.css';
import { useNavigate } from 'react-router-dom';
import { ensContractABI } from '../ABI/ensContractABI';
import { ephermalPubKeyRegistryContractABI } from '../ABI/ephermalPubKeyRegistryABI';
import { ethers } from "ethers"; 
import {ec} from "elliptic"
import { calculateSpendingAddress, calculateSpendingAddressPrivateKey, checkBalance, getAddressFromPublicKey } from '../utils/addressUtils';
import BN from 'bn.js';
const ellipticCurve = new ec('secp256k1');

// Example of smart contract ABI and address (replace these with your actual values)

// ENS contract address
const contractAddress = "0xBfE39EbfD24c3bAA72dd2819564B8054c360F127";
const EphermalPubKeyRegistryContractAddress = "0xcEFffb6b5BC579b954eC1053A9DffcA7125d883d";

const Receiver: React.FC = () => {
  const [account, setAccount] = useState<any>({ privateKey: '', address: '' });
  const [stealth, setStealth] = useState('');
  const [privateStelath,setPrivateStealth] = useState('');
  const [publicStealth, setPubicStealth] = useState('');
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
    //setStealth(publicKey);
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
      const ephemeralKeys : string [] = await contract.methods.getPubKeys().call({ from: userAddress });

      // const m1 = '0xafafd5e2077355648f32b6dbe9b0e784dab49c9c24baddb27ab2550dd710c6e8';
      // const m = ellipticCurve.keyFromPrivate(privateStelath, 'hex').getPrivate();
      const m = new BN(privateStelath.slice(2),16);
      
      // const generatorPoint = ellipticCurve.g; // Get generator point G
      // const calculatedPoint = generatorPoint.mul(m); // G * privateKey

      // // Encode the result in uncompressed format
      // const manualPublicKey = '0x' + calculatedPoint.encode('hex', false);
      // console.log('Manually Calculated M:', manualPublicKey);


      // const m = ellipticCurve.keyFromPrivate(m1, 'hex').getPrivate();
      // const M1 = '0x04596b3c9fba8e39f938ed3af1c7383cd33b7dca08a9a4754afadb3b73d1fbd11a6b7515c3b16be0f370216ccfa62f5da70037d5b3d24541676d96a57ce9005048';
      console.log('m:',m.toString());
      ephemeralKeys.push('0x04b0124f32af8d1640a259672ad84480c478d6ea08a8df1c64f5931a8056a7979e983cff3f699f87ff33ecf234f0c7517eddf37be772f8ce7e490d9fcf8eea51ea');
      console.log("Ephemeral Keys:", ephemeralKeys);

      if (Array.isArray(ephemeralKeys)) {
        for (let i = 0; i < ephemeralKeys.length; i++) {
            console.log('ephermalKeys i:', ephemeralKeys[i]);
            if (ephemeralKeys[i].length < 66) {
              continue;
            }
            const R = ellipticCurve.keyFromPublic(ephemeralKeys[i].slice(2), 'hex').getPublic();
            console.log('R:',R.encode('hex',false));
            console.log('stealth',stealth);
            const M = ellipticCurve.keyFromPublic(publicStealth.slice(2), 'hex').getPublic();
            // const M = ellipticCurve.keyFromPublic(M1.slice(2), 'hex').getPublic();
            console.log('M:',M.encode('hex',false));
            const currentP = calculateSpendingAddress(m,R,M);
            console.log('currentP:',currentP);
            const ehtereumAddressP = getAddressFromPublicKey(currentP);
            console.log('ethereumAddressP:',ehtereumAddressP);
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
      console.log('Stealth before ENS contract: ' + stealth, 'Bytes: ', stealth.length/2-1);
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
        <input
          type="text"
          id="myTextbox"
          placeholder="Enter private key of your stealth address"
          value={privateStelath}
          onChange={(e) => setPrivateStealth(e.target.value)} // Update state on input change
        />
        <input
          type="text"
          id="myTextbox"
          placeholder="Enter your public stealth address"
          value={publicStealth}
          onChange={(e) => setPubicStealth(e.target.value)} // Update state on input change
        />    
        <button className="get-ephermal-btn" onClick={handleGenerateSpendingKey}>
          Generate spending key
        </button>
      </div>
    </div>
  );
};

export default Receiver;
