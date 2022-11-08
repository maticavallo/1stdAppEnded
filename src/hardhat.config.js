require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
const dotenv = require("dotenv");
const { task } = require("hardhat/config");


dotenv.config();
//this is the private key of the account that will deploy the contract
//https://docs.ethers.io/v5/api/signer/#Signer--properties 

task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();
  for (const account of accounts) {
    console.log(account.address);
  }
});
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.7",
  defaultNetwork: "mumbai",
  networks: {
    hardhat: {},
      mumbai: {
      url: process.env.POLYGON_MUMBAI,
      accounts: [process.env.PRIVATE_KEY],
    }
  },
  etherscan:{ 
    apiKey: process.env.API_KEY
  }
  };
