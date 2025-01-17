// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EphemeralPubKeyRegistry {
    // General list of ephemeral public keys
    bytes32[] private pubKeys;

    // Events
    event PubKeyAdded(bytes32 pubKey);

    // Add a new ephemeral public key to the general list.
    function addPubKey(bytes32 pubKey) external {
        require(pubKey != bytes32(0), "Public key cannot be zero");

        pubKeys.push(pubKey);

        emit PubKeyAdded(pubKey);
    }

    // Get the entire list of ephemeral public keys.
    function getPubKeys() external view returns (bytes32[] memory) {
        return pubKeys;
    }

    // Get the total number of public keys in the list.
    function getPubKeyCount() external view returns (uint256) {
        return pubKeys.length;
    }

    // Get all public keys added after a specific index.
    function getNewPubKeys(uint256 lastIndex) external view returns (bytes32[] memory) {
        require(lastIndex < pubKeys.length, "Index out of bounds");

        uint256 newCount = pubKeys.length - lastIndex;
        bytes32[] memory newKeys = new bytes32[](newCount);

        for (uint256 i = 0; i < newCount; i++) {
            newKeys[i] = pubKeys[lastIndex + i];
        }

        return newKeys;
    }
}
