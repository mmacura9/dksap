// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EphemeralPubKeyRegistry {
    // General list of ephemeral public keys
    address[] private pubKeys;

    // Events
    event PubKeyAdded(address pubKey);

    // Add a new ephemeral public key to the general list.
    function addPubKey(address pubKey) external {
        require(pubKey != address(0), "Public key cannot be zero");

        pubKeys.push(pubKey);

        emit PubKeyAdded(pubKey);
    }

    // Get the entire list of ephemeral public keys.
    function getPubKeys() external view returns (address[] memory) {
        return pubKeys;
    }

    // Get the total number of public keys in the list.
    function getPubKeyCount() external view returns (uint256) {
        return pubKeys.length;
    }
}
