# DKSAP

## Introduction

Dual-Key Stealth Address Protocol (DKSAP) is a protocol that is used to protect the receiver in a transaction. This project will use elliptic curves. This method is safe for computers used today, but it is endangered by future development of quantum computers. DKSAP and SAP are similar and for an easier understanding of DKSAP, the understanding of SAP is required. 

## SAP

The idea is that the receiver (Bob) can privately receive money from the sender (Alice). To achieve that, Bob and Alice together make a stealth address such that only Bob knows the private key of that address.

This can be achieved with the following steps:

- Bob generates spending key $m$, and publishes stealth meta-address $M = G*m$
- Alice makes ephemeral key $r$ and publishes ephemeral public key $R = G*r$
- Now they both now shared secret $S = G*m*r = M*r = m*R$
- Public key of stealth address is $P = M + G*hash(S)$
- Private key of stealth address is $p = m + hash(S)$

They both can calculate the public key, but only Bob can calculate the private key. This way Bob receives money safely and privately.

## DKSAP

The problem with SAP is that nobody knows how much money Bob gets, so some regulations (like tax paying) could be avoided. To protect regulations DKSAP is developed. With this method, a viewing key $v$ is introduced. Holders of this key can see the transactions that Bob received, but at the same time, they do not know the private key.

The DKSAP protocol is like this:

- Bob generates spending key $k$ and viewing key $v$, and publishes their public key pair $(K, V)$
- Like in SAP, Alice makes ephemeral key $r$ and publishes ephemeral public key $R = G*r$
- Shared secret $S$ is now $S = G*v*r = V*r = v*R$ and both Alice and Bob know how to calculate it
- Public stealth address is now $P = K + G*hash(S)$ and can be calculated by the viewer
- Private stealth address is $p = k + hash(S)$ and can be calculated only bu Bob


# Key Recovery