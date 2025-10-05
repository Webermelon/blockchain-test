require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const config = {
    solidity: "0.8.27",
    networks: {
        sepolia: {
            url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
            accounts: [process.env.PRIVATE_KEY]
        }
    }
};

module.exports = config;
