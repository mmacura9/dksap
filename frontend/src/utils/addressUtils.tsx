import BN from 'bn.js';
import { ec, curve } from 'elliptic';
import { keccak256 } from 'js-sha3';
import Web3 from 'web3';
import * as dotenv from 'dotenv';

// Assuming elliptic curve and types are set up
const ellipticCurve = new ec('secp256k1');


// Calculate shared secret
const calculateSharedSecret = (r: BN, M: curve.base.BasePoint): curve.base.BasePoint => {
    const S = M.mul(r);  // Scalar multiplication: r * M
    return S;
};

const generateWeb3 = () => {
    if (!window.ethereum) {
        alert('Please install MetaMask first.');
        throw new Error('MetaMask not found');
    }
    return new Web3(window.ethereum);
}
export const web3 = generateWeb3();


// Calculate the point P = M + G * hash(S)
export const calculateSpendingAddress = (r: BN, M: curve.base.BasePoint, T: curve.base.BasePoint): string => {
    const S = calculateSharedSecret(r, T);
    const SxHex = S.getX().toString('hex');  // Get X coordinate of S and convert to hex
    const hashOfS = keccak256(Buffer.from(SxHex, 'hex'));  // Keccak256 hash of S

    // Convert the hash to a BigInteger for scalar multiplication
    const hashScalar = ellipticCurve.keyFromPrivate(hashOfS).getPrivate();

    // G is the generator point for secp256k1
    const G = ellipticCurve.g;

    // G * hash(S)
    const GHashS = G.mul(hashScalar);

    // Finally, calculate P = M + G * hash(S)
    const P = M.add(GHashS);  // Point addition: M + G * hash(S)
    return P.encode('hex',false);
};

export const getAddressFromPublicKey = (publicKey: string) => {
    
    // Remove the "0x04" prefix from the uncompressed public key
    publicKey = publicKey.startsWith('04') ? '0x' + publicKey : publicKey; 
    publicKey = publicKey.startsWith('0x04') ? publicKey : '0x04' + publicKey;
    const rawPublicKey = publicKey.slice(4); // Skip "0x04"

    // Compute the Keccak-256 hash of the public key
    const addressHash = web3.utils.keccak256('0x' + rawPublicKey);

    // Take the last 20 bytes (40 characters) of the hash for the Ethereum address
    const ethereumAddress = '0x' + addressHash.slice(-40);

    return ethereumAddress.toLowerCase(); // Convert to lowercase (standard for Ethereum)
};

export const checkBalance = async (address: string) => {
    const balance = await web3.eth.getBalance(address);
    return web3.utils.fromWei(balance, 'ether');  // Return balance in Ether
}

export const calculateSpendingAddressPrivateKey = (r: BN, M: curve.base.BasePoint, m: BN): string => {
    const S = calculateSharedSecret(r,M);
    const SxHex = S.getX().toString('hex');  // Get X coordinate of S and convert to hex
    const hashOfS = keccak256(Buffer.from(SxHex, 'hex'));  // Keccak256 hash of S

    // Convert the hash to a BigInteger for scalar multiplication
    const hashScalar = ellipticCurve.keyFromPrivate(hashOfS).getPrivate();

    // Calculate p = (m + hash(S)) mod n
    const curveOrder = ellipticCurve.curve.n;
    const p = m.add(hashScalar).umod(curveOrder); 
    const privateKey = p.toString('hex'); // Convert BN to hex string

    return privateKey;
};

export const generatePublicKeyFromPrivate =  (privateKey:string) : string => {
    const privateKeySliced = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey; 
    const keyPair = ellipticCurve.keyFromPrivate(privateKeySliced, 'hex');
    const publicKey = keyPair.getPublic(false,'hex'); // This is G * m
    
    return '0x' + publicKey;
};

