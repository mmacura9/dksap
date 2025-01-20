export const ensContractABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "string",
        "name": "publicAddress",
        "type": "string"
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
        "internalType": "string",
        "name": "publicAddress",
        "type": "string"
      },
      {
        "indexed": true,
        "internalType": "string",
        "name": "stealthAddress",
        "type": "string"
      }
    ],
    "name": "StealthAddressSet",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "publicAddress",
        "type": "string"
      }
    ],
    "name": "getStealthAddress",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
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
        "internalType": "string",
        "name": "stealthAddress",
        "type": "string"
      }
    ],
    "name": "setStealthAddress",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];
