import React, { useState, useEffect, ReactNode } from "react";
import { useSDK } from "@metamask/sdk-react";

const Layout: React.FC<{ children?: ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | undefined>();
  const { sdk, connected, chainId } = useSDK();

  // Load the account from localStorage on initial render
  // useEffect(() => {
  //   const savedAccount = localStorage.getItem('account');
  //   if (savedAccount) {
  //     setAccount(savedAccount);
  //     // Automatically reroute to another page when account is found
  //     navigate('/receiver'); // Replace '/receiver' with the appropriate route
  //   }
  // }, []);

  const connect = async () => {
    try {
      const accounts = await sdk?.connect();
      const selectedAccount = accounts?.[0];
      setAccount(selectedAccount);
      if (selectedAccount) {
        // Store the account in localStorage
        localStorage.setItem('account', selectedAccount);
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
    <div className="button-container">
      {!connected ? (
        <button className="connect-button" onClick={connect}>
          Connect MetaMask
        </button>
      ) : (
        <>
          <p className="connection-info">
            {chainId && <span>Connected chain: {chainId}</span>}
          </p>
          <p className="connection-info">
            {account && <span>Connected account: {account}</span>}
          </p>
          <button className="connect-button" onClick={disconnect}>
            Disconnect
          </button>
        </>
      )}
    </div>
  );
};

export default Layout;
