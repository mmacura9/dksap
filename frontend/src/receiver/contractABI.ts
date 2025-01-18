export const contractABI = [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "publicAddress",
          "type": "address"
        }
      ],
      "name": "StealthAddressRemoved",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "publicAddress",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "stealthAddress",
          "type": "address"
        }
      ],
      "name": "StealthAddressSet",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "publicAddress",
          "type": "address"
        }
      ],
      "name": "getStealthAddress",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "removeStealthAddress",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "stealthAddress",
          "type": "address"
        }
      ],
      "name": "setStealthAddress",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];