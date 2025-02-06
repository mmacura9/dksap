export const ensContractABI = [
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
    "name": "KeyPairRemoved",
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
        "indexed": false,
        "internalType": "string",
        "name": "metaStealthKey",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "viewingKey",
        "type": "string"
      }
    ],
    "name": "KeyPairSet",
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
    "name": "getKeyPair",
    "outputs": [
      {
        "internalType": "string",
        "name": "metaStealthKey",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "viewingKey",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "publicAddress",
        "type": "address"
      }
    ],
    "name": "hasKeyPair",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "removeKeyPair",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "metaStealthKey",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "viewingKey",
        "type": "string"
      }
    ],
    "name": "setKeyPair",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];
