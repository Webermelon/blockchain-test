const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Transactions", function () {
    let transactions;
    let owner;
    let addr1;
    let addr2;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();

        const Transactions = await ethers.getContractFactory("Transactions");
        transactions = await Transactions.deploy();
        await transactions.waitForDeployment();
    });

    describe("Deployment", function () {
        it("Should set the initial transaction count to 0", async function () {
            expect(await transactions.getTransactionCount()).to.equal(0);
        });

        it("Should return empty array for getAllTransactions", async function () {
            const allTransactions = await transactions.getAllTransactions();
            expect(allTransactions.length).to.equal(0);
        });
    });

    describe("Transactions", function () {
        it("Should add a transaction to the blockchain", async function () {
            const amount = ethers.parseEther("1.0");

            await transactions.addToBlockchain(
                addr1.address,
                amount,
                "Test message",
                "test",
                { value: amount }
            );

            expect(await transactions.getTransactionCount()).to.equal(1);

            const allTransactions = await transactions.getAllTransactions();
            expect(allTransactions.length).to.equal(1);
            expect(allTransactions[0].sender).to.equal(owner.address);
            expect(allTransactions[0].receiver).to.equal(addr1.address);
            expect(allTransactions[0].amount).to.equal(amount);
        });

        it("Should transfer Ether to the receiver", async function () {
            const amount = ethers.parseEther("1.0");
            const initialBalance = await ethers.provider.getBalance(addr1.address);

            await transactions.addToBlockchain(
                addr1.address,
                amount,
                "Test transfer",
                "transfer",
                { value: amount }
            );

            const finalBalance = await ethers.provider.getBalance(addr1.address);
            expect(finalBalance).to.equal(initialBalance + amount);
        });

        it("Should revert if sent value doesn't match amount", async function () {
            const amount = ethers.parseEther("1.0");
            const wrongAmount = ethers.parseEther("0.5");

            await expect(
                transactions.addToBlockchain(
                    addr1.address,
                    amount,
                    "Test message",
                    "test",
                    { value: wrongAmount }
                )
            ).to.be.revertedWith("Sent value must equal amount parameter");
        });

        it("Should revert with invalid receiver address", async function () {
            const amount = ethers.parseEther("1.0");

            await expect(
                transactions.addToBlockchain(
                    ethers.ZeroAddress,
                    amount,
                    "Test message",
                    "test",
                    { value: amount }
                )
            ).to.be.revertedWith("Invalid receiver address");
        });

        it("Should emit Transfer event", async function () {
            const amount = ethers.parseEther("1.0");

            await expect(
                transactions.addToBlockchain(
                    addr1.address,
                    amount,
                    "Test message",
                    "test",
                    { value: amount }
                )
            ).to.emit(transactions, "Transfer")
                .withArgs(owner.address, addr1.address, amount, "Test message", anyValue, "test");
        });
    });
});

// Helper function for testing events with timestamp
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");