import { useEthereum } from "../context/EthereumContext";
import { useTransaction } from "../context/TransactionContext";
import { useState } from "react";

const TransactionForm = () => {
    const { currentAccount } = useEthereum();
    const { formData, handleChange, sendTransaction, isLoading } = useTransaction();
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};

        // Validate Ethereum address
        if (!formData.addressTo) {
            newErrors.addressTo = 'Recipient address is required';
        } else if (!/^0x[a-fA-F0-9]{40}$/.test(formData.addressTo)) {
            newErrors.addressTo = 'Invalid Ethereum address format';
        }

        // Validate amount
        if (!formData.amount) {
            newErrors.amount = 'Amount is required';
        } else if (isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
            newErrors.amount = 'Amount must be a positive number';
        }

        // Validate keyword
        if (!formData.keyword) {
            newErrors.keyword = 'Please select a keyword';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!currentAccount) {
            alert('Please connect your wallet first');
            return;
        }

        if (validateForm()) {
            sendTransaction(formData.addressTo, formData.amount, formData.keyword, formData.message || 'No message');
        }
    };

    const resetForm = () => {
        const emptyForm = { addressTo: '', amount: '', keyword: '', message: '' };
        Object.keys(emptyForm).forEach(key => {
            handleChange({ target: { value: '' } }, key);
        });
        setErrors({});
    };

    if (!currentAccount) {
        return (
            <div className="bg-white h-max rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Send Transaction</h2>
                <div className="text-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="text-gray-400 text-4xl mb-4">🔗</div>
                    <p className="text-gray-600">Connect your wallet to start sending transactions</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white h-max rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Send Transaction</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Recipient Address <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.addressTo}
                        placeholder="0x..."
                        onChange={(e) => handleChange(e, 'addressTo')}
                        className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.addressTo ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    <small className="text-gray-500">0x2A8Aa23F19bd1B8F618748E8F1A291735A48eA8B <b>(Use this address for testing)</b></small>
                    {errors.addressTo && <p className="text-red-500 text-sm mt-1">{errors.addressTo}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Amount (ETH) <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        required
                        step="0.0001"
                        min="0"
                        value={formData.amount}
                        placeholder="0.01"
                        onChange={(e) => handleChange(e, 'amount')}
                        className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.amount ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Transaction Type <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="keyword"
                        required
                        value={formData.keyword}
                        onChange={(e) => handleChange(e, 'keyword')}
                        className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.keyword ? 'border-red-500' : 'border-gray-300'}`}
                    >
                        <option value="">Select transaction type</option>
                        <option value="transfer">💸 Transfer</option>
                        <option value="donation">💝 Donation</option>
                        <option value="payment">💳 Payment</option>
                        <option value="refund">🔄 Refund</option>
                        <option value="other">📦 Other</option>
                    </select>
                    {errors.keyword && <p className="text-red-500 text-sm mt-1">{errors.keyword}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Message (Optional)
                    </label>
                    <textarea
                        placeholder="Add a message..."
                        value={formData.message}
                        onChange={(e) => handleChange(e, 'message')}
                        rows="3"
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    />
                </div>

                <div className="flex space-x-3 pt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors duration-200 ${isLoading
                            ? 'bg-gray-400 cursor-not-allowed text-white'
                            : 'bg-purple-500 hover:bg-purple-600 text-white'
                            }`}
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Sending...</span>
                            </span>
                        ) : (
                            'Send Transaction'
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={resetForm}
                        disabled={isLoading}
                        className="px-4 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    >
                        Reset
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TransactionForm;