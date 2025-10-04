// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract Transactions {
    uint256 private transactionCount;

    event Transfer(address indexed from, address indexed receiver, uint amount, string message, uint256 timestamp, string keyword);

    struct TransferStruct {
        address sender;
        address receiver;
        uint amount;
        string message;
        uint256 timestamp;
        string keyword;
    }

    TransferStruct[] private transactions;

    function addToBlockchain(address payable receiver, uint amount, string memory message, string memory keyword) public payable {
        require(receiver != address(0), "Invalid receiver address");
        require(msg.value == amount, "Sent value must equal amount parameter");
        
        transactionCount += 1;
        transactions.push(TransferStruct(msg.sender, receiver, amount, message, block.timestamp, keyword));

        // Transfer the actual Ether
        (bool success, ) = receiver.call{value: amount}("");
        require(success, "Transfer failed");

        emit Transfer(msg.sender, receiver, amount, message, block.timestamp, keyword);
    }

    function getAllTransactions() public view returns (TransferStruct[] memory) {
        return transactions;
    }

    function getTransactionCount() public view returns (uint256) {
        return transactionCount;
    }
}