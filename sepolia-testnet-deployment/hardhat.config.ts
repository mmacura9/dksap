import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require('@nomicfoundation/hardhat-verify');
import * as dotenv from "dotenv";
dotenv.config();

const HTTPS_RPC_URL = process.env.HOLESKY_URL || "";
const WSS_RPC_URL = process.env.HOLESKY_RPC_URL_WSS || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

module.exports = {
  solidity: "0.8.24",
  networks: {
    holesky_https: {
      url: HTTPS_RPC_URL,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 17000,
    },
    holesky_wss: {
      url: WSS_RPC_URL,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 17000,
    },
  },
  etherscan: {
    apiKey: {
      holesky: ETHERSCAN_API_KEY, // Update if Holesky gets an Etherscan alternative
    },
  },
};

const config: HardhatUserConfig = {
  solidity: "0.8.24",
};

export default config;
