import { createContext, useState, useEffect, useContext } from "react";

import { ethers } from "ethers";

import { TransactionsContractABI, TransactionsContractAddress } from "../utils/constants";

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

    const [currentAccount, setCurrentAccount] = useState('');
    const [balance, setBalance] = useState('0');
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

    // Simple storage for transaction hashes
    const storeTransactionHash = (hash, txData) => {
        const key = `tx_${hash}`;
        localStorage.setItem(key, JSON.stringify(txData));
    };

    // Simple hash lookup from localStorage
    const getTransactionHash = (sender, receiver, amount, keyword, message) => {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('tx_')) {
                try {
                    const stored = JSON.parse(localStorage.getItem(key));
                    if (stored &&
                        stored.from.toLowerCase() === sender.toLowerCase() &&
                        stored.to.toLowerCase() === receiver.toLowerCase() &&
                        Math.abs(stored.amount - amount) < 0.0001 &&
                        stored.keyword === keyword &&
                        stored.message === message) {
                        return key.replace('tx_', '');
                    }
                } catch (e) {
                    console.error("Error parsing transaction from localStorage:", e);
                }
            }
        }
        return null;
    };

    const checkIfWalletIsConnected = async () => {
        try {
            if (!ethereum) return alert("Please install MetaMask.");
            const accounts = await ethereum.request({ method: "eth_accounts" });

            if (accounts.length) {
                setCurrentAccount(accounts[0]);
            }
        } catch (error) {
            throw new Error("No Ethereum object.");
        }
    };

    const connectWallet = async () => {
        try {
            if (!ethereum) return alert("Please install MetaMask.");
            const accounts = await ethereum.request({ method: "eth_requestAccounts" });
            setCurrentAccount(accounts[0]);
            window.location.reload();
        } catch (error) {
            throw new Error("No Ethereum object.");
        }
    };

    const loadAllTransactions = async () => {
        try {
            if (!ethereum) return;

            const transactionsContract = await getEthereumTransactionsContract();
            const availableTransactions = await transactionsContract.getAllTransactions();

            const structuredTransactions = availableTransactions.map(transaction => {
                const amount = parseInt(transaction.amount) / (10 ** 18);
                const hash = getTransactionHash(
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

            // Store transaction data
            storeTransactionHash(transactionHash.hash, {
                from: currentAccount,
                to: addressTo,
                amount: parseFloat(amount),
                keyword: keyword,
                message: message
            });

            await transactionHash.wait();
            alert(`Transaction sent! Hash: ${transactionHash.hash}`);

            // TODO: Add timestamp or more unique data to distinguish transactions hash collisions
            console.log('Transaction sent!', transactionHash);

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
        checkIfWalletIsConnected();
    }, []);

    useEffect(() => {
        const getBalance = async () => {
            if (currentAccount) {
                try {
                    const provider = new ethers.BrowserProvider(ethereum);
                    const balance = await provider.getBalance(currentAccount);
                    setBalance(ethers.formatEther(balance));
                } catch (error) {
                    console.error("Error fetching balance:", error);
                }
            }
        };

        getBalance();
    }, [currentAccount]);

    return (
        <TransactionContext.Provider value={{
            getEthereumTransactionsContract,
            connectWallet,
            balance,
            currentAccount,
            formData,
            handleChange,
            sendTransaction,
            loadAllTransactions,
            transactions,
            transactionCount,
            isLoading,
            truncateAddress: (address) => {
                if (!address) return 'Not Connected';
                return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
            },
        }}>
            {children}
        </TransactionContext.Provider>
    );
};