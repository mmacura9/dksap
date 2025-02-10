import React, { useEffect, useState, ReactNode } from 'react';
import Web3 from 'web3';
import { ensContractABI } from '../ABI/ensContractABI';
import { ensContractAddress } from '../constants';
import { ephermalPubKeyRegistryContractABI } from '../ABI/ephermalPubKeyRegistryABI';
import {ec} from "elliptic"
import { calculateSharedSecret, calculateSpendingAddress, calculateSpendingAddressPrivateKey, checkBalance, generatePublicKeyFromPrivate, getAddressFromPublicKey, web3} from '../utils/addressUtils';
import BN from 'bn.js';

interface RecieverProps {
  children?: ReactNode;
}



const Inspect: React.FC <RecieverProps> = ({children}) => {
  
    const [viweingAddress,setViweingAddress] = useState('');
    const [listOfStealthAddresses, setListOfStealthAddresses] = useState<string[]>([]);

    const handleListAllStealthAddresses = async () => {
      const V = generatePublicKeyFromPrivate(viweingAddress);
      const stealthData = JSON.parse(localStorage.getItem('stealthData') ?? '{}') ?? {};
      const metaStealthKeys: string[] = [];
      const viewingKeys: string[] = [];

      for(let i =0;i<stealthData.length;i++) {
        const currStealth = stealthData[i];
        metaStealthKeys.push(currStealth.metaStealthKey);
        viewingKeys.push(currStealth.viewingKey);
      }

      const filteredStealthKeys = metaStealthKeys.filter((_,index) => viewingKeys[index] === V);
      setListOfStealthAddresses(filteredStealthKeys);
    }

    return (
        <div className="receiver-container">
        <div className="receiver-card">
          <h1 className="header">List all stealth addresses</h1>
          <div>
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
          <div className="stealth-address-list">
            {listOfStealthAddresses.length > 0 ? (
              <ul>
                {listOfStealthAddresses.map((address, index) => (
                  <li title ={address} key={index}>{address}</li>
                ))}
              </ul>
            ) : (
              <p>No stealth addresses found.</p>
            )}
        </div>
        </div>
        </div>
    );
};

export default Inspect;
