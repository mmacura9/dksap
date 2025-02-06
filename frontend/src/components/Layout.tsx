import React, { useState, useEffect, ReactNode } from "react";
import { useSDK } from "@metamask/sdk-react";
import './Layout.css';

interface LayoutProps {
  children?: ReactNode;
  setRetrievalPopUp: React.Dispatch<React.SetStateAction<boolean>>;
  setCreateMnemonic: React.Dispatch<React.SetStateAction<boolean>>;
}

const Layout: React.FC<LayoutProps> = ({ children, setRetrievalPopUp, setCreateMnemonic }) => {
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

  const handleRetrieve = async () => {
    setRetrievalPopUp(true)
  }

  const handleCreateMnemonic = async() => {
    setCreateMnemonic(true);
  }

  return (
    <div className="button-container-layout">
      {!connected ? (
        <button className="connect-button-layout" onClick={connect}>
          Connect MetaMask
        </button>
      ) : (
        <>
          {/* <p className="connection-info">
            {chainId && <span>Connected chain: {chainId}</span>}
          </p>
          <p className="connection-info">
            {account && <span>Connected account: {account}</span>}
          </p> */}
          <button className="connect-button-layout" onClick={disconnect}>
            Disconnect
          </button>
          <button className="connect-button-layout" onClick={handleRetrieve}>
            Retrieve private stealth keys
          </button>
          <button className="connect-button-layout" onClick={handleCreateMnemonic}>
            Add key recovery mechanism
          </button>
        </>
      )}
    </div>
  );
};

export default Layout;
