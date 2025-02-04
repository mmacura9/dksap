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

    //  Retrieve all key pairs 
    function getAllKeyPairs() external view returns (address[] memory, string[] memory, string[] memory) {
        uint256 length = allAddresses.length;
        address[] memory addresses = new address[](length);
        string[] memory metaStealthKeys = new string[](length);
        string[] memory viewingKeys = new string[](length);

        for (uint256 i = 0; i < length; i++) {
            address addr = allAddresses[i];
            KeyPair memory keys = addressToKeys[addr];

            addresses[i] = addr;
            metaStealthKeys[i] = keys.metaStealthKey;
            viewingKeys[i] = keys.viewingKey;
        }

        return (addresses, metaStealthKeys, viewingKeys);
    }
}
