import { createContext, useState, useEffect, useContext } from "react";

import { ethers } from "ethers";

export const EthereumContext = createContext();

export const useEthereum = () => {
    const context = useContext(EthereumContext);
    if (!context) {
        throw new Error('useEthereum must be used within an EthereumProvider');
    }
    return context;
};

export const EthereumProvider = ({ children }) => {

    const { ethereum } = window;

    const [currentAccount, setCurrentAccount] = useState('');
    const [balance, setBalance] = useState('0');
    const [appMode, setAppMode] = useState('transactions'); // 'transactions' or 'votes'

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
        <EthereumContext.Provider value={{
            connectWallet,
            balance,
            currentAccount,
            appMode,
            setAppMode,
            truncateAddress: (address) => {
                if (!address) return 'Not Connected';
                return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
            },
        }}>
            {children}
        </EthereumContext.Provider>
    );
};