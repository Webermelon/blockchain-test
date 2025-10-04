import { useTransaction } from "../context/TransactionContext";
import { useState, useEffect } from "react";
import { ethers } from "ethers";

const Wallet = () => {
    const { connectWallet, currentAccount, transactionCount } = useTransaction();
    const [balance, setBalance] = useState('0');

    // Helper function to truncate address
    const truncateAddress = (address) => {
        if (!address) return 'Not Connected';
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    };

    // Fetch wallet balance
    useEffect(() => {
        const getBalance = async () => {
            if (currentAccount && window.ethereum) {
                try {
                    const provider = new ethers.BrowserProvider(window.ethereum);
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
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Wallet</h2>

            <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-purple-500 via-fuchsia-500 to-purple-400 p-6 text-white mb-4">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>

                <div className="relative">
                    <div className="mb-4">
                        <p className="text-white/80 text-sm font-medium">Address</p>
                        <p className="text-white text-lg font-mono" title={currentAccount}>
                            {truncateAddress(currentAccount)}
                        </p>
                    </div>

                    <div className="mb-4">
                        <p className="text-white/80 text-sm font-medium">Balance</p>
                        <p className="text-white text-xl font-bold">
                            {parseFloat(balance).toFixed(4)} ETH
                        </p>
                    </div>

                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-white/80 text-sm font-medium">Network</p>
                            <p className="text-white text-sm">Ethereum</p>
                        </div>
                        <div className="text-right">
                            <p className="text-white/80 text-sm font-medium">Transactions</p>
                            <p className="text-white text-sm font-bold">{transactionCount}</p>
                        </div>
                    </div>
                </div>
            </div>

            {!currentAccount ? (
                <div className="space-y-3">
                    <button
                        className="w-full bg-purple-500 hover:bg-purple-600 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200 flex items-center justify-center space-x-2"
                        onClick={connectWallet}
                    >
                        <span>🦊</span>
                        <span>Connect MetaMask</span>
                    </button>
                    <p className="text-sm text-gray-600 text-center">
                        Connect your wallet to start making transactions
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="flex items-center justify-center space-x-2 text-green-600 bg-green-50 py-2 px-4 rounded-md">
                        <span>✅</span>
                        <span className="font-medium">Wallet Connected</span>
                    </div>
                    <p className="text-sm text-gray-600 text-center">
                        You can now send transactions
                    </p>
                </div>
            )}
        </div>
    );
};

export default Wallet;