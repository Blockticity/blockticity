require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  networks: {
    hardhat: {},
    blockticityTestnet: {
      url: "https://testnet-btest-ub57a.avax-test.network/ext/bc/2GMLdy7Fmb2FqA1EyHsUVre5rj1W5upmsDwqyKT1FEvJgWg79z/rpc?token=f3d07db83ce3d2ed8cd5e844136e7f5fbf66e7e7e83b11a984dfb6fdf5f99eba",
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
