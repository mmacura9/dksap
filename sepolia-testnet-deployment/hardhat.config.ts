import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require('@nomicfoundation/hardhat-verify');
import * as dotenv from "dotenv";
dotenv.config();

const HTTPS_RPC_URL = process.env.SEPOLIA_URL || "";
const WSS_RPC_URL = process.env.SEPOLIA_RPC_URL_WSS || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

module.exports = {
  solidity: "0.8.24",
  networks: {
    sepolia_https: {
      url: HTTPS_RPC_URL,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    sepolia_wss: {
      url: WSS_RPC_URL,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY,
    },
  },
};

const config: HardhatUserConfig = {
  solidity: "0.8.24",
};

export default config;
