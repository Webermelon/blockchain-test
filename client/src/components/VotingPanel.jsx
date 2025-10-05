import { useState } from "react";
import { useEthereum } from "../context/EthereumContext";
import { useVoting } from "../context/VotingContext";

const VotingPanel = () => {
    const { currentAccount, truncateAddress } = useEthereum();
    const { isOwner, votingActive, totalVotes, voterInfo, toggleVoting, addCandidate, registerVoter, deleteVoter, registeredVoters, isLoading } = useVoting();

    const [candidateName, setCandidateName] = useState("");
    const [candidateDescription, setCandidateDescription] = useState("");
    const [voterAddress, setVoterAddress] = useState("");
    const [showVotersTable, setShowVotersTable] = useState(false);
    const [showOwnerControls, setShowOwnerControls] = useState(false);

    const handleAddCandidate = async (e) => {
        e.preventDefault();
        if (!candidateName.trim()) {
            alert("Please enter candidate name");
            return;
        }
        await addCandidate(candidateName, candidateDescription);
        setCandidateName("");
        setCandidateDescription("");
    };

    const handleRegisterVoter = async (e) => {
        e.preventDefault();
        if (!/^0x[a-fA-F0-9]{40}$/.test(voterAddress)) {
            alert("Invalid Ethereum address");
            return;
        }
        await registerVoter(voterAddress);
        setVoterAddress("");
    };

    const handleDeleteVoter = async (address) => {
        const confirmed = window.confirm(`Are you sure you want to remove voter ${truncateAddress(address)}?`);
        if (confirmed) {
            await deleteVoter(address);
        }
    };

    if (!currentAccount) {
        return (
            <div className="bg-white h-max rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Voting Panel</h2>
                <div className="text-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="text-gray-400 text-4xl mb-4">🗳️</div>
                    <p className="text-gray-600">Connect your wallet to access voting features</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white h-max rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Voting Panel</h2>

            {/* Voting Status */}
            <div className="mb-6 p-4 bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-lg border border-purple-200">
                <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-700">Voting Status:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${votingActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {votingActive ? 'Active' : 'Inactive'}
                    </span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Total Votes:</span>
                    <span className="text-lg font-bold text-purple-600">{totalVotes}</span>
                </div>
            </div>

            {/* Voter Status */}
            {voterInfo && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-medium text-gray-700 mb-2">Your Voter Status</h3>
                    <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                            <span>Registered:</span>
                            <span className={voterInfo.isRegistered ? 'text-green-600 font-medium' : 'text-red-600'}>
                                {voterInfo.isRegistered ? '✓ Yes' : '✗ No'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>Has Voted:</span>
                            <span className={voterInfo.hasVoted ? 'text-green-600 font-medium' : 'text-gray-600'}>
                                {voterInfo.hasVoted ? '✓ Yes' : '✗ No'}
                            </span>
                        </div>
                        {voterInfo.hasVoted && (
                            <div className="flex justify-between">
                                <span>Voted for:</span>
                                <span className="font-medium text-purple-600">Candidate #{voterInfo.votedCandidateId}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Owner Controls */}
            {isOwner && (
                <div className="space-y-6">
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center relative">
                            <span className="text-yellow-600 text-xl mr-2">👑</span>
                            <h3 className="font-bold text-gray-800">Owner Controls</h3>

                            <button
                                onClick={() => setShowOwnerControls(!showOwnerControls)}
                                className="absolute right-0 top-0 mt-1 mr-1 text-sm text-purple-600 hover:text-purple-800 font-medium"
                            >
                                {showOwnerControls ? 'Hide Controls' : 'Show Controls'}
                            </button>
                        </div>

                        {showOwnerControls && <>
                            {/* Voting Control */}
                            <div className="mt-4 mb-4">
                                <button
                                    onClick={() => toggleVoting(!votingActive)}
                                    disabled={isLoading}
                                    className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${votingActive
                                        ? 'bg-red-500 hover:bg-red-600 text-white'
                                        : 'bg-green-500 hover:bg-green-600 text-white'
                                        } disabled:bg-gray-400 disabled:cursor-not-allowed`}
                                >
                                    {votingActive ? 'Stop Voting' : 'Start Voting'}
                                </button>
                            </div>

                            {/* Add Candidate Form */}
                            <form onSubmit={handleAddCandidate} className="mb-4 p-3 bg-white rounded border border-gray-200">
                                <h4 className="font-medium text-gray-700 mb-2 text-sm">Add Candidate</h4>
                                <input
                                    type="text"
                                    placeholder="Candidate Name"
                                    value={candidateName}
                                    onChange={(e) => setCandidateName(e.target.value)}
                                    className="w-full p-2 mb-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                                <textarea
                                    placeholder="Description (optional)"
                                    value={candidateDescription}
                                    onChange={(e) => setCandidateDescription(e.target.value)}
                                    rows="2"
                                    className="w-full p-2 mb-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-2 px-4 bg-purple-500 hover:bg-purple-600 text-white rounded-md font-medium transition-colors text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    Add Candidate
                                </button>
                            </form>

                            {/* Register Voter Form */}
                            <form onSubmit={handleRegisterVoter} className="mb-4 p-3 bg-white rounded border border-gray-200">
                                <h4 className="font-medium text-gray-700 mb-2 text-sm">Register Voter</h4>
                                <input
                                    type="text"
                                    placeholder="Voter Address (0x...)"
                                    value={voterAddress}
                                    onChange={(e) => setVoterAddress(e.target.value)}
                                    className="w-full p-2 mb-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-2 px-4 bg-purple-500 hover:bg-purple-600 text-white rounded-md font-medium transition-colors text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    Register Voter
                                </button>
                            </form>

                            {/* Registered Voters Table */}
                            <div className="p-3 bg-white rounded border border-gray-200">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-medium text-gray-700 text-sm">Registered Voters</h4>
                                    <button
                                        onClick={() => setShowVotersTable(!showVotersTable)}
                                        className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                                    >
                                        {showVotersTable ? 'Hide' : 'Show'} ({registeredVoters.length})
                                    </button>
                                </div>

                                {showVotersTable && (
                                    <div className="mt-2">
                                        {registeredVoters.length === 0 ? (
                                            <p className="text-xs text-gray-500 text-center py-4">No voters registered yet</p>
                                        ) : (
                                            <div className="max-h-64 overflow-auto border border-gray-200 rounded">
                                                <table className="w-full text-xs">
                                                    <thead className="bg-gray-50 sticky top-0">
                                                        <tr>
                                                            <th className="px-3 py-2 text-left font-medium text-gray-700">Address</th>
                                                            <th className="px-3 py-2 text-center font-medium text-gray-700">Voted</th>
                                                            <th className="px-3 py-2 text-center font-medium text-gray-700">Status</th>
                                                            <th className="px-3 py-2 text-center font-medium text-gray-700">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-200">
                                                        {registeredVoters.map((voter, index) => (
                                                            <tr key={index} className="hover:bg-gray-50">
                                                                <td className="px-3 py-2">
                                                                    <span className="font-mono" title={voter.address}>
                                                                        {truncateAddress(voter.address)}
                                                                    </span>
                                                                    {voter.address.toLowerCase() === currentAccount.toLowerCase() && (
                                                                        <span className="ml-1 text-xs bg-blue-100 text-blue-800 px-1 rounded">You</span>
                                                                    )}
                                                                </td>
                                                                <td className="px-3 py-2 text-center">
                                                                    {voter.hasVoted ? (
                                                                        <span className="text-green-600">✓</span>
                                                                    ) : (
                                                                        <span className="text-gray-400">✗</span>
                                                                    )}
                                                                </td>
                                                                <td className="px-3 py-2 text-center">
                                                                    {voter.isActive ? (
                                                                        <span className="text-green-600 text-xs">Active</span>
                                                                    ) : (
                                                                        <span className="text-red-600 text-xs">Deleted</span>
                                                                    )}
                                                                </td>
                                                                <td className="px-3 py-2 text-center">
                                                                    {voter.isActive && (
                                                                        <button
                                                                            onClick={() => handleDeleteVoter(voter.address)}
                                                                            disabled={isLoading}
                                                                            className="text-red-600 hover:text-red-800 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                                                                            title="Remove voter"
                                                                        >
                                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                                            </svg>
                                                                        </button>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </>}

                    </div>
                </div>
            )}

            {/* Non-owner message */}
            {!isOwner && (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                        {voterInfo?.isRegistered
                            ? "You are registered to vote. Select a candidate below."
                            : "Please wait for the admin to register you as a voter."}
                    </p>
                </div>
            )}
        </div>
    );
};

export default VotingPanel;
