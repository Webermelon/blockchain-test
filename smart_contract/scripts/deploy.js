const hre = require("hardhat");

async function main() {
    console.log("Deploying Transaction contract...");

    const Transactions = await hre.ethers.getContractFactory("Transactions");
    const transactions = await Transactions.deploy();

    await transactions.waitForDeployment();

    const address = await transactions.getAddress();
    console.log("Transaction deployed to:", address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });