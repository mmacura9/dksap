import BN from 'bn.js';
import { ec, curve } from 'elliptic';
import { keccak256 } from 'js-sha3';
import Web3 from 'web3';

// Assuming elliptic curve and types are set up
const ellipticCurve = new ec('secp256k1');
const web3 = new Web3();

// Calculate shared secret
const calculateSharedSecret = (r: BN, M: curve.base.BasePoint): curve.base.BasePoint => {
    const S = M.mul(r);  // Scalar multiplication: r * M
    console.log('S:',S.encode('hex',false))
    return S;
};

// Calculate the point P = M + G * hash(S)
export const calculateSpendingAddress = (r: BN, M: curve.base.BasePoint, T: curve.base.BasePoint): string => {
    const S = calculateSharedSecret(r,M);
    const SxHex = S.getX().toString('hex');  // Get X coordinate of S and convert to hex
    const hashOfS = keccak256(Buffer.from(SxHex, 'hex'));  // Keccak256 hash of S

    // Convert the hash to a BigInteger for scalar multiplication
    const hashScalar = ellipticCurve.keyFromPrivate(hashOfS).getPrivate();

    // G is the generator point for secp256k1
    const G = ellipticCurve.g;

    // G * hash(S)
    const GHashS = G.mul(hashScalar);

    // Finally, calculate P = M + G * hash(S)
    const P = T.add(GHashS);  // Point addition: M + G * hash(S)
    const x = P.getX().toString('hex');
    const y = P.getY().toString('hex');
    const fullPubKey = '0x04' + x + y;
    return fullPubKey;
};

export const getAddressFromPublicKey = (publicKey: string) => {
    const pubKeyHex = publicKey // .encode('hex');  // Encode public key in hex
    const address = web3?.utils?.sha3(pubKeyHex)?.slice(-40);  // Keccak-256 hash and take last 20 bytes
    return '0x'+address;
}

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

    // Finally, calculate p = m + hash(S)
    const p = m.add(hashScalar);  // Point addition: m + hash(S)

    return p.toString();
};

