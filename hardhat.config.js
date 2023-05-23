require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.18",
  networks: {
    "hardhat": {
      chainId: 1337
    },
    "TEVMOS": {
      url: "https://eth.bd.evmos.dev:8545",
      chainId: 9000,
      accounts: ['557e1f7bf0f02d50a16647caa8644e2143ff0d86046cccc4b18d4f7ab492c83b']
    }
  }
};