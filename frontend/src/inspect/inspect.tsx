import React, { useEffect, useState, ReactNode } from 'react';
import Web3 from 'web3';
import { ensContractABI } from '../ABI/ensContractABI';
import { ephermalPubKeyRegistryContractABI } from '../ABI/ephermalPubKeyRegistryABI';
import {ec} from "elliptic"
import { calculateSharedSecret, calculateSpendingAddress, calculateSpendingAddressPrivateKey, checkBalance, generatePublicKeyFromPrivate, getAddressFromPublicKey} from '../utils/addressUtils';
import BN from 'bn.js';

interface RecieverProps {
  children?: ReactNode;
}


// ENS contract address
const contractENSAddress = "0xBfE39EbfD24c3bAA72dd2819564B8054c360F127";

const Inspect: React.FC <RecieverProps> = ({children}) => {
  
    const [viweingAddress,setViweingAddress] = useState('');

    const handleListAllStealthAddresses = async () => {
        
    }

    return (
        <div className="receiver-container">
        <div className="receiver-card">
          <h1 className="header">List all stealth addresses</h1>
          <div >
              <input
              type="text"
              className="myTextbox"
              placeholder="Enter viewing key"
              value={viweingAddress}
              onChange={(e) => setViweingAddress(e.target.value)} // Update state on input change
              />    
              <button className="generate-ephermal-btn" onClick={handleListAllStealthAddresses}>
              List
              </button>
          </div>
        </div>
        </div>
    );
};

export default Inspect;
