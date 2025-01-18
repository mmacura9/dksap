import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useSDK } from "@metamask/sdk-react";
import './home.css';

const Home: React.FC = () => {
  const [account, setAccount] = useState<string | undefined>();
  const { sdk, connected, chainId } = useSDK();
  const navigate = useNavigate(); // Initialize the navigate hook

  // Load the account from localStorage on initial render
  useEffect(() => {
    const savedAccount = localStorage.getItem('account');
    if (savedAccount) {
      setAccount(savedAccount);
      // Automatically reroute to another page when account is found
      navigate('/receiver'); // Replace '/receiver' with the appropriate route
    }
  }, [navigate]);

  const connect = async () => {
    try {
      const accounts = await sdk?.connect();
      const selectedAccount = accounts?.[0];
      setAccount(selectedAccount);
      if (selectedAccount) {
        // Store the account in localStorage
        localStorage.setItem('account', selectedAccount);
        // Reroute to the receiver page after successful connection
        navigate('/receiver'); // Replace '/receiver' with the appropriate route
      }
    } catch (err) {
      console.warn("Failed to connect...", err);
    }
  };

  const disconnect = async () => {
    await sdk?.disconnect()
    setAccount(undefined);
    localStorage.removeItem('account'); // Clear the account from localStorage
  };

  return (
    <div className="home-container">
      <div className="home-card">
        <h1 className="header">Connect to MetaMask</h1>
        {!connected ? (
          <button className="connect-button" onClick={connect}>
            Connect MetaMask
          </button>
        ) : (
          <div className="connection-details">
            <p className="connection-info">
              {chainId && <span>Connected chain: {chainId}</span>}
            </p>
            <p className="connection-info">
              {account && <span>Connected account: {account}</span>}
            </p>
            <button className="disconnect-button" onClick={disconnect}>
              Disconnect
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
