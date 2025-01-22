// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EphemeralPubKeyRegistry {
    // General list of ephemeral public keys stored as strings
    string[] private pubKeys;

    // Events
    event PubKeyAdded(string pubKey);

    // Add a new ephemeral public key to the general list
    function addPubKey(string calldata pubKey) external {
        require(bytes(pubKey).length > 0, "Public key cannot be empty");

        pubKeys.push(pubKey);

        emit PubKeyAdded(pubKey);
    }

    // Get the entire list of ephemeral public keys
    function getPubKeys() external view returns (string[] memory) {
        return pubKeys;
    }

    // Get the total number of public keys in the list
    function getPubKeyCount() external view returns (uint256) {
        return pubKeys.length;
    }
}
