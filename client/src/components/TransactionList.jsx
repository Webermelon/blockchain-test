import { useTransaction } from "../context/TransactionContext";
import { useEffect, useState } from "react";

const TransactionList = () => {
    const { transactions, loadAllTransactions, currentAccount, truncateAddress } = useTransaction();
    const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        const fetchTransactions = async () => {
            if (currentAccount) {
                setIsLoadingTransactions(true);
                try {
                    await loadAllTransactions();
                } catch (error) {
                    console.error("Error fetching transactions:", error);
                } finally {
                    setIsLoadingTransactions(false);
                }
            }
        };

        fetchTransactions();
    }, [currentAccount, refreshKey]);

    // Helper function to get keyword badge color
    const getKeywordBadgeColor = (keyword) => {
        const colors = {
            transfer: 'bg-blue-100 text-blue-800',
            donation: 'bg-green-100 text-green-800',
            payment: 'bg-purple-100 text-purple-800',
            refund: 'bg-orange-100 text-orange-800',
            other: 'bg-gray-100 text-gray-800'
        };
        return colors[keyword] || colors.other;
    };

    // Helper function to truncate hash
    const truncateHash = (hash) => {
        if (!hash) return null;
        return `${hash.substring(0, 10)}...${hash.substring(hash.length - 8)}`;
    };

    // Refresh function
    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
    };

    if (!currentAccount) {
        return (
            <div className="mt-12 p-8 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <h3 className="text-xl font-bold text-gray-600 mb-2">Transaction History</h3>
                <p className="text-gray-500">Please connect your wallet to view transaction history</p>
            </div>
        );
    }

    const getEtherscanAddress = (addressTo) => <>
        <div className="flex items-center">
            <a href={`https://sepolia.etherscan.io/address/${addressTo}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-0.5 text-sm font-medium text-gray-900 group hover:text-purple-600 transition-colors">
                <svg className="w-3 h-3 mr-1 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                {truncateAddress(addressTo)}
            </a>
            {addressTo.toLowerCase() === currentAccount.toLowerCase() && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    You
                </span>
            )}
        </div>
    </>;

    return (
        <div className="mt-12">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Transaction History</h3>
                <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">
                        Total: {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
                    </span>
                    <button
                        onClick={handleRefresh}
                        disabled={isLoadingTransactions}
                        className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:bg-gray-400 transition-colors text-sm"
                    >
                        {isLoadingTransactions ? 'Refreshing...' : 'Refresh'}
                    </button>

                </div>
            </div>

            {isLoadingTransactions ? (
                <div className="flex justify-center items-center p-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                    <span className="ml-4 text-gray-600">Loading transactions...</span>
                </div>
            ) : transactions.length === 0 ? (
                <div className="text-center p-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="text-gray-400 text-6xl mb-4">📊</div>
                    <h4 className="text-lg font-medium text-gray-600 mb-2">No transactions found</h4>
                    <p className="text-gray-500">Your transactions will appear here once you make your first transaction</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
                    <div className="max-h-screen overflow-auto">
                        <table className="w-full table-auto">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount (ETH)</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keyword</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">View</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {transactions.reverse().slice(0, 500).map((transaction, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getEtherscanAddress(transaction.addressFrom)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getEtherscanAddress(transaction.addressTo)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-900">
                                                {parseFloat(transaction.amount).toFixed(4)} ETH
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getKeywordBadgeColor(transaction.keyword)}`}>
                                                {transaction.keyword}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 max-w-52 truncate" title={transaction.message}>
                                                {transaction.message || 'No message'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">
                                                {transaction.timestamp}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {transaction.hash ? (
                                                <div className="flex flex-col space-y-1">
                                                    <a
                                                        href={`https://sepolia.etherscan.io/tx/${transaction.hash}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors group"
                                                        title={`View on Etherscan: ${transaction.hash}`}
                                                    >
                                                        <svg className="w-3 h-3 mr-1 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                        </svg>
                                                        Etherscan
                                                    </a>
                                                    <span className="text-xs text-gray-500 font-mono text-center" title={`Full hash: ${transaction.hash}`}>
                                                        {truncateHash(transaction.hash)}
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center space-y-1">
                                                    <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-500 bg-gray-100 rounded-md">
                                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        N/A
                                                    </span>
                                                    <span className="text-xs text-gray-400 text-center">
                                                        No hash available
                                                    </span>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransactionList;