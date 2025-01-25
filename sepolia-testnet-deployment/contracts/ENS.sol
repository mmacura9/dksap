// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract StealthAddressRegistry {
    // Struct to store both the meta-stealth key and viewing key
    struct KeyPair {
        string metaStealthKey; // The stealth public key
        string viewingKey;     // The viewing key
    }

    // Mapping from public address to their KeyPair
    mapping(address => KeyPair) private addressToKeys;

    // Events
    event KeyPairSet(address indexed publicAddress, string metaStealthKey, string viewingKey);
    event KeyPairRemoved(address indexed publicAddress);

    // Set both the meta-stealth key and viewing key for the sender's public address
    function setKeyPair(string calldata metaStealthKey, string calldata viewingKey) external {
        addressToKeys[msg.sender] = KeyPair(metaStealthKey, viewingKey);

        emit KeyPairSet(msg.sender, metaStealthKey, viewingKey);
    }

    // Get the meta-stealth key and viewing key associated with a public address
    function getKeyPair(address publicAddress) 
        external 
        view 
        returns (string memory metaStealthKey, string memory viewingKey) 
    {
        KeyPair memory keys = addressToKeys[publicAddress];
        return (keys.metaStealthKey, keys.viewingKey);
    }


    // Remove the meta-stealth key and viewing key for the sender's public address
    function removeKeyPair() external {
        require(
            bytes(addressToKeys[msg.sender].metaStealthKey).length > 0,
            "No key pair set for caller"
        );

        delete addressToKeys[msg.sender];

        emit KeyPairRemoved(msg.sender);
    }

    // Optional: Check if a public address has a key pair set (without exposing details)
    function hasKeyPair(address publicAddress) external view returns (bool) {
        return bytes(addressToKeys[publicAddress].metaStealthKey).length > 0;
    }
}
