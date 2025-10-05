const hre = require("hardhat");

async function main() {

    const CONTRACTS = ["VotingSystem"];

    for (const contractName of CONTRACTS) {
        console.log(`Deploying ${contractName}...`);

        const Contract = await hre.ethers.getContractFactory(contractName);
        const contract = await Contract.deploy();

        await contract.waitForDeployment();

        const address = await contract.getAddress();
        console.log(`${contractName} deployed to:`, address);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });