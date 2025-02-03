import React, { useState, useEffect, ReactNode } from "react";
import './RetrievalPopUp.css';
import * as bip39 from 'bip39';
import * as crypto from 'crypto';


interface RetrievalProps {
  children?: ReactNode;
  setRetrievalPopUp: React.Dispatch<React.SetStateAction<boolean>>;
}

const RetrievalPopUp: React.FC<RetrievalProps> = ({ children, setRetrievalPopUp }) => {
    
    const [mnemonicWords,setMnemonicWords] = useState(new Array(12).fill(''));
    const [privateKey, setPrivateKey] = useState('');
    const [fail, setFail] = useState(false);

    const getStoredMnemonics = () => {
        const storedData = localStorage.getItem("mnemonicStorage");
        return storedData ? JSON.parse(storedData) : [];
      };


    const updateWordAtIndex = (index: number, newWord: string) => {
        setMnemonicWords((prevWords) => {
          const updatedWords = [...prevWords]; // Copy the existing array
          updatedWords[index] = newWord; // Modify the specific index
          return updatedWords; // Return the updated array
        });
      };
    
    const findMnemonic = (mnemonic: string) => {
        const mnemonics = getStoredMnemonics();
        const foundEntry = mnemonics.find((entry: { mnemonic: string }) => entry.mnemonic === mnemonic);

        if (!foundEntry) {
            console.warn("Mnemonic not found!");
            return null; // Return null instead of undefined for better handling
          }
        
        return foundEntry;
    };
      

    const handleValidataion = async () => {
        
        try {
            const mnemonic = mnemonicWords.join(' ');
            const encrypted = findMnemonic(mnemonic)?.encrypted;
            
            if (!encrypted) {
                setFail(true);
                return;
            }

            // Generate the same key from mnemonic
            const seed = bip39.mnemonicToSeedSync(mnemonic);
            const key = crypto.createHash("sha256").update(seed).digest();

            // Decrypt the password
            const decipher = crypto.createDecipheriv("aes-256-cbc", key.slice(0, 32), Buffer.alloc(16, 0));
            let decrypted = decipher.update(encrypted, "hex", "utf8");
            decrypted += decipher.final("utf8");
            setPrivateKey(decrypted);

            console.log("Decrypted Password:", decrypted);
            return decrypted;
        } catch (error) {
            console.error("Decryption failed:", error);
            return null;
        }
    }

    return (
        <div className="popup-overlay">
          <div className="popup-content">
            <h2>Key Recovery Mechanism </h2>
            <p>Please enter your phrase</p>
            <div className="phrase-container">
                {Array.from({ length: 12 }).map((word, index) => (
                    <input key={index} 
                           type ='text' 
                           value={word?.toString()} 
                           className="phrase-box" 
                           onChange={(e) => updateWordAtIndex(index,e.target.value)}>
                    </input>
                ))}
            </div>
            { privateKey !== '' ?
                <div>
                    Your private key is: {privateKey}
                </div>
                : fail &&
                <p className="warning-text">
                    <strong>Your phrase doesn't exist! Try again!</strong>
                </p>
                
            }
            <div className="button-container-retrieve">
                <button className='button-retrieve' onClick = {handleValidataion}> Confirm phrase</button>
                <button className= 'button-retrieve' onClick={()=>{setRetrievalPopUp(false)}}>Close</button>
            </div>
          </div>
        </div>
      );
};

export default RetrievalPopUp;
