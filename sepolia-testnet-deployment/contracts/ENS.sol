// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract StealthAddressRegistry {
    // Mapping from public address to stealth public key (stored as a string)
    mapping(address => string) private publicToStealth;

    // Events
    event StealthKeySet(address indexed publicAddress, string stealthKey);
    event StealthKeyRemoved(address indexed publicAddress);

    // Set a stealth public key (64 bytes as a string) for the sender's public address
    function setStealthKey(string calldata stealthKey) external {
        //require(bytes(stealthKey).length == 64, "Stealth key must be 64 bytes long");

        publicToStealth[msg.sender] = stealthKey;

        emit StealthKeySet(msg.sender, stealthKey);
    }

    // Get the stealth public key associated with a public address
    function getStealthKey(address publicAddress) external view returns (string memory) {
        return publicToStealth[publicAddress];
    }

    // Remove the stealth key mapping for the sender's public address
    function removeStealthKey() external {
        require(bytes(publicToStealth[msg.sender]).length > 0, "No stealth key set for caller");

        delete publicToStealth[msg.sender];

        emit StealthKeyRemoved(msg.sender);
    }
}
