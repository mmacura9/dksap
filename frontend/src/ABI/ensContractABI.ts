export const ensContractABI = [
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
        "indexed": false,
        "internalType": "string",
        "name": "stealthKey",
        "type": "string"
      }
    ],
    "name": "StealthKeySet",
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
      }
    ],
    "name": "StealthKeyRemoved",
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
    "name": "getStealthKey",
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
    "name": "removeStealthKey",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "stealthKey",
        "type": "string"
      }
    ],
    "name": "setStealthKey",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];
