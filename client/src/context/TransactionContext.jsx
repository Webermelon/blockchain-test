import { createContext, useState, useEffect, useContext } from "react";

import { ethers } from "ethers";

import { TransactionsContractABI, TransactionsContractAddress } from "../utils/constants";
import { useEthereum } from "./EthereumContext";

export const TransactionContext = createContext();

export const useTransaction = () => {
    const context = useContext(TransactionContext);
    if (!context) {
        throw new Error('useTransaction must be used within a TransactionProvider');
    }
    return context;
};

export const TransactionProvider = ({ children }) => {

    const { ethereum } = window;

    const { currentAccount } = useEthereum();

    const [formData, setFormData] = useState({ addressTo: '', amount: '', keyword: '', message: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [transactionCount, setTransactionCount] = useState(0);
    const [transactions, setTransactions] = useState([]);

    const getEthereumTransactionsContract = async () => {
        const provider = new ethers.BrowserProvider(ethereum);
        const signer = await provider.getSigner();
        const transactionsContract = new ethers.Contract(TransactionsContractAddress, TransactionsContractABI, signer);

        return transactionsContract;
    };

    const handleChange = (e, name) => {
        setFormData((prevState) => ({ ...prevState, [name]: e.target.value }));
    }

    const cleanUpOldTransactions = () => {
        const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const storageKey = localStorage.key(i);
            if (storageKey && storageKey.startsWith('tx_')) {
                const storedTimestamp = parseInt(storageKey.replace('tx_', ''));
                if (storedTimestamp < weekAgo) {
                    localStorage.removeItem(storageKey);
                }
            }
        }
    };

    // Store transaction hash with data and timestamp
    const storeTransactionHash = (hash, txData, timestamp) => {
        const key = `tx_${timestamp}`;
        localStorage.setItem(key, JSON.stringify({ hash, ...txData }));
    };

    // Match transaction by timestamp AND transaction data
    const getTransactionHash = (blockchainTimestamp, sender, receiver, amount, keyword, message) => {
        const timestampMs = blockchainTimestamp * 1000;
        const tolerance = 15000; // 15 seconds

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('tx_')) {
                const storedTimestamp = parseInt(key.replace('tx_', ''));

                // First check: timestamp within tolerance
                if (Math.abs(storedTimestamp - timestampMs) <= tolerance) {
                    try {
                        const stored = JSON.parse(localStorage.getItem(key));

                        // Second check: match transaction data
                        if (stored &&
                            stored.from.toLowerCase() === sender.toLowerCase() &&
                            stored.to.toLowerCase() === receiver.toLowerCase() &&
                            Math.abs(stored.amount - amount) < 0.0001 &&
                            stored.keyword === keyword &&
                            stored.message === message) {
                            return stored.hash;
                        }
                    } catch (e) {
                        console.error("Error parsing transaction:", e);
                    }
                }
            }
        }
        return null;
    };

    const loadAllTransactions = async () => {
        try {
            if (!ethereum) return;

            const transactionsContract = await getEthereumTransactionsContract();
            const availableTransactions = await transactionsContract.getAllTransactions();

            const structuredTransactions = availableTransactions.map(transaction => {
                const amount = parseInt(transaction.amount) / (10 ** 18);
                const hash = getTransactionHash(
                    Number(transaction.timestamp),
                    transaction.sender,
                    transaction.receiver,
                    amount,
                    transaction.keyword,
                    transaction.message
                );

                return {
                    addressTo: transaction.receiver,
                    addressFrom: transaction.sender,
                    timestamp: new Date(Number(transaction.timestamp) * 1000).toLocaleString(),
                    message: transaction.message,
                    keyword: transaction.keyword,
                    amount: amount,
                    hash: hash
                };
            });

            setTransactions(structuredTransactions);

            const newCount = await transactionsContract.getTransactionCount();
            setTransactionCount(Number(newCount));
        } catch (error) {
            console.error("Error fetching transactions:", error);
        }
    };

    const sendTransaction = async (addressTo, amount, keyword, message) => {
        try {
            if (!ethereum) return alert("Please install MetaMask.");

            setIsLoading(true);
            const transactionsContract = await getEthereumTransactionsContract();
            const parsedAmount = ethers.parseEther(amount);

            const transactionHash = await transactionsContract.addToBlockchain(
                addressTo,
                parsedAmount,
                message,
                keyword,
                { value: parsedAmount }
            );

            // Store transaction hash with data and timestamp
            storeTransactionHash(
                transactionHash.hash,
                {
                    from: currentAccount,
                    to: addressTo,
                    amount: parseFloat(amount),
                    keyword: keyword,
                    message: message
                },
                Date.now()
            );

            await transactionHash.wait();
            alert(`Transaction sent! Hash: ${transactionHash.hash}`);

            // Refresh data
            await loadAllTransactions();
            setFormData({ addressTo: '', amount: '', keyword: '', message: '' });

        } catch (error) {
            alert(`Transaction failed: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        cleanUpOldTransactions(); // Clean up old transactions (older than 7 days)
    }, []);

    return (
        <TransactionContext.Provider value={{
            getEthereumTransactionsContract,
            formData,
            handleChange,
            sendTransaction,
            loadAllTransactions,
            transactions,
            transactionCount,
            isLoading,
        }}>
            {children}
        </TransactionContext.Provider>
    );
};