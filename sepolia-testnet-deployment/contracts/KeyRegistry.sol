// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EphemeralPubKeyRegistry {
    struct KeyAndTag{
        string pubKey;
        string tag;
    }
    // General list of ephemeral public keys and view tags
    KeyAndTag[] private keysAndTags;

    // Events
    event PubKeyAndTagAdded(string pubKey, string tag);

    // Add a new ephemeral public key with view tag to the general list
    function addPubKeyAndTag(string calldata publicKey, string calldata viewTag) external {
        require(bytes(publicKey).length > 0, "Public key cannot be empty");
        require(bytes(publicKey).length == 132, "Not correct size of the key");
        require(bytes(viewTag).length <= 3, "Not correct size of the tag");

        keysAndTags.push(KeyAndTag(publicKey,viewTag));

        emit PubKeyAndTagAdded(publicKey,viewTag);
    }

    // Get the total number of public keys in the list
    function getPubKeyAndTagCount() external view returns (uint256) {
        return keysAndTags.length;
    }
}
