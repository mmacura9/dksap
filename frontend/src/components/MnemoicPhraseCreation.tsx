import React, { useState, useEffect, ReactNode } from "react";
import './MnemoicPhraseCreation.css';
import * as bip39 from 'bip39';
import * as crypto from 'crypto';

interface MnemoicPhraseCreationProps {
  children?: ReactNode;
  setCreateMnemonic: React.Dispatch<React.SetStateAction<boolean>>;
  keysSet?: string;
}

const MnemoicPhraseCreation: React.FC<MnemoicPhraseCreationProps> = ({ children, setCreateMnemonic, keysSet }) => {

    const [privateKey,setPrivateKey] = useState(keysSet ?? '');
    const [generatedMnemoic, setGeneratedMnemoic] = useState(false);
    const [mnemoic,setMnemoic] = useState('');

    const handleCreateMnemoic = async () => {
        // Generate Mnemonic
        const mnemonic = bip39.generateMnemonic();
       
        // Derive seed from mnemonic
        const seed = bip39.mnemonicToSeedSync(mnemonic);
        const key = crypto.createHash('sha256').update(seed).digest(); // Use SHA-256 hash of seed

        // Encrypt password
        const password = privateKey;
        const cipher = crypto.createCipheriv('aes-256-cbc', key.slice(0, 32), Buffer.alloc(16, 0));
        let encrypted = cipher.update(password, 'utf8', 'hex');
        encrypted += cipher.final('hex');
 
        const storedData = localStorage.getItem("mnemonicStorage");
        const mnemonics = storedData ? JSON.parse(storedData) : [];
      
        // Add new mnemonic entry
        mnemonics.push({ mnemonic, encrypted });
        setMnemoic(mnemonic);
        // Save back to localStorage
        localStorage.setItem("mnemonicStorage", JSON.stringify(mnemonics));

        setGeneratedMnemoic(true);
    }
    
    return (
        <div className="popup-overlay">
          <div className="popup-content-mnemoic">
            <h2>Add key recovery mechanism </h2>
            <p>Please enter your private key</p>
            <input
                type="text"
                className="myTextbox"
                placeholder="Enter your private stealth keys"
                value={privateKey}
                onChange={(e) => {
                    setPrivateKey(e.target.value);
                }} // Update state on input change
            />
            {generatedMnemoic && mnemoic !== '' &&
            <>
            <h4 className="phrase-title">This is your phrase</h4>
          
            <div className="phrase-container">
              {Array.from({ length: 12 }).map((_, index) => (
                <div key={index} className="phrase-box">
                  {mnemoic ? mnemoic.split(' ')[index] : 's'} 
                </div>
              ))}
            </div>          
            <p className="warning-text">
              <strong>Please write down your phrase before closing!</strong>
            </p>
          </>
          
              } 
            <div className="button-container-mnemoic">
                <button className='button-mnemoic' onClick = {handleCreateMnemoic}> Generate phrase</button>
                <button className= 'button-mnemoic' onClick={()=>{setCreateMnemonic(false)}}>Close</button>
            </div>
          </div>
        </div>
      );
};

export default MnemoicPhraseCreation;
