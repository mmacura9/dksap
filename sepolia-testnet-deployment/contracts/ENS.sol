// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract StealthAddressRegistry {
    struct KeyPair {
        string metaStealthKey;
        string viewingKey;
    }

    mapping(address => KeyPair) private addressToKeys;
    address[] private allAddresses;

    event KeyPairSet(address indexed publicAddress, string metaStealthKey, string viewingKey);
    event KeyPairRemoved(address indexed publicAddress);

    function setKeyPair(string calldata metaStealthKey, string calldata viewingKey) external {
        if (bytes(addressToKeys[msg.sender].metaStealthKey).length == 0) {
            allAddresses.push(msg.sender); // Store new address only if it's new
        }
        addressToKeys[msg.sender] = KeyPair(metaStealthKey, viewingKey);
        emit KeyPairSet(msg.sender, metaStealthKey, viewingKey);
    }

    function getKeyPair(address publicAddress) 
        external 
        view 
        returns (string memory metaStealthKey, string memory viewingKey) 
    {
        KeyPair memory keys = addressToKeys[publicAddress];
        return (keys.metaStealthKey, keys.viewingKey);
    }

    function hasKeyPair(address publicAddress) external view returns (bool) {
        return bytes(addressToKeys[publicAddress].metaStealthKey).length > 0;
    }

    function removeKeyPair() external {
        require(bytes(addressToKeys[msg.sender].metaStealthKey).length > 0, "No key pair set for caller");
        delete addressToKeys[msg.sender];
        emit KeyPairRemoved(msg.sender);
    }
}
