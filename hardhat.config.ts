import "@nomicfoundation/hardhat-chai-matchers"
import "@nomicfoundation/hardhat-network-helpers"
import "@nomiclabs/hardhat-ethers"
import "@nomiclabs/hardhat-etherscan"
import "@typechain/hardhat"
import "@unlock-protocol/contracts"
import "@unlock-protocol/hardhat-plugin"
import * as dotenv from "dotenv"
import "hardhat-change-network"
import { HardhatUserConfig } from "hardhat/config"

dotenv.config()

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.13",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
      blockGasLimit: 30_000_000,
      forking: {
        url: "https://rpc.ankr.com/eth",
        enabled: true,
        blockNumber: 17330000,
      },
    },
    localhost: {
      url: "http://127.0.0.1:8545/",
    },
    ethereum: {
      url: "https://rpc.ankr.com/eth",
      chainId: 1,
      accounts: [`0x${process.env.DEPLOYER_PRIVATE_KEY}`],
    },
    ethereumGoeril: {
      url: "https://rpc.ankr.com/eth_goerli",
      chainId: 5,
      accounts: [`0x${process.env.DEPLOYER_PRIVATE_KEY}`],
    },
  },
  paths: {
    sources: "./contracts",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  etherscan: {
    apiKey: {
      ethereum: `${process.env.ETHERSCAN_API_KEY}`,
    },
  },
}

export default config
