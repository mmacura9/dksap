// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract StealthAddressRegistry {
    // Mapping from public address to stealth public key (stored as two 32-byte parts)
    mapping(address => bytes32[2]) private publicToStealth;

    // Events
    event StealthKeySet(address indexed publicAddress, bytes32[2] stealthKey);
    event StealthKeyRemoved(address indexed publicAddress);

    // Set a stealth public key (64 bytes) for the sender's public address
    function setStealthKey(bytes32 part1, bytes32 part2) external {
        // Store the 64-byte key in two bytes32 parts
        publicToStealth[msg.sender] = [part1, part2];

        emit StealthKeySet(msg.sender, [part1, part2]);
    }

    // Get the stealth public key associated with a public address
    function getStealthKey(address publicAddress) external view returns (bytes32[2] memory) {
        return publicToStealth[publicAddress];
    }

    // Remove the stealth key mapping for the sender's public address
    function removeStealthKey() external {
        require(publicToStealth[msg.sender][0] != bytes32(0), "No stealth key set for caller");

        delete publicToStealth[msg.sender];

        emit StealthKeyRemoved(msg.sender);
    }
}
