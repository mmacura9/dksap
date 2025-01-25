import React, { useState } from 'react';
import { web3 } from './utils/addressUtils';


const StealthMetaAddress: React.FC = () => {

  // Function to generate random private key
  const generateAccount = (): any => {
    const newAccount = web3.eth.accounts.create(); // Generates a new account with private key and public address
    return newAccount; // Returns the account object containing private key and public address
  };
  const [privateMetaAddress, setPrivateMetaAddress] = useState<string | null>(null);
  const [publicMetaAddress, setPublicMetaAddress] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');

  // Function to generate a stealth meta-address (simulated)
  const generateMetaAddress = () => {
    const account = generateAccount();
    setPrivateMetaAddress(account.privateKey);
    setPublicMetaAddress(account.address);
    // const publicAddress = web3.eth.accounts.privateToAddress(privateKey);
    setStatus('Stealth Meta-Address generated!');
  };

  // Function to simulate sending the address to the chain
  const sendToChain = () => {
    if (privateMetaAddress) {
      setStatus(`Private: ${privateMetaAddress}, public: ${publicMetaAddress}`);
      // Simulate sending it to the blockchain
      setTimeout(() => {
        setStatus(`${publicMetaAddress} sent to the chain successfully!`);
      }, 2000);
    } else {
      setStatus('Please generate a stealth meta-address first.');
    }
  };

  return (
    <div className="stealth-meta-address-container" style={{ textAlign: 'center', marginTop: '20px' }}>
      <h1>Stealth Meta-Address</h1>
      <div style={{ margin: '20px' }}>
        {privateMetaAddress && <p>Generated Private Meta-Address: {privateMetaAddress}</p>}
        {publicMetaAddress && <p>Generated Public Meta-Address: {publicMetaAddress}</p>}
        <button onClick={generateMetaAddress} style={buttonStyle}>
          Generate Stealth Meta-Address
        </button>
        <br />
        <button onClick={sendToChain} style={buttonStyle}>
          Send Stealth Meta-Address to Chain
        </button>
      </div>
      <p>{status}</p>
    </div>
  );
};

// Simple button styling
const buttonStyle = {
  padding: '10px 20px',
  fontSize: '16px',
  cursor: 'pointer',
  margin: '10px',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
};

export default StealthMetaAddress;
