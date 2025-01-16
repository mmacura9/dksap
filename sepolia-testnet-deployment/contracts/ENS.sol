// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract StealthAddressRegistry {
    // Mapping from public address to stealth meta-address
    mapping(address => address) private publicToStealth;

    // Events
    event StealthAddressSet(address indexed publicAddress, address indexed stealthAddress);
    event StealthAddressRemoved(address indexed publicAddress);

    // Set a stealth meta-address for a public address
    function setStealthAddress(address stealthAddress) external {
        require(stealthAddress != address(0), "Stealth address cannot be zero address");

        publicToStealth[msg.sender] = stealthAddress;

        emit StealthAddressSet(msg.sender, stealthAddress);
    }

    // Get the stealth address associated with a public address
    function getStealthAddress(address publicAddress) external view returns (address) {
        return publicToStealth[publicAddress];
    }

    // Remove the stealth address mapping for the sender's public address
    function removeStealthAddress() external {
        require(publicToStealth[msg.sender] != address(0), "No stealth address set for caller");

        delete publicToStealth[msg.sender];

        emit StealthAddressRemoved(msg.sender);
    }
}
