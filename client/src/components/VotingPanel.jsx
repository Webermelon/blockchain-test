import { useState } from "react";
import { useEthereum } from "../context/EthereumContext";
import { useVoting } from "../context/VotingContext";

const VotingPanel = () => {
    const { currentAccount } = useEthereum();
    const { isOwner, votingActive, totalVotes, voterInfo, toggleVoting, addCandidate, registerVoter, isLoading } = useVoting();

    const [candidateName, setCandidateName] = useState("");
    const [candidateDescription, setCandidateDescription] = useState("");
    const [voterAddress, setVoterAddress] = useState("");

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

    if (!currentAccount) {
        return (
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Voting Panel</h2>
                <div className="text-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="text-gray-400 text-4xl mb-4">🗳️</div>
                    <p className="text-gray-600">Connect your wallet to access voting features</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Voting Panel</h2>

            {/* Voting Status */}
            <div className="mb-6 p-4 bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-lg border border-purple-200">
                <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-700">Voting Status:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${votingActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {votingActive ? '✅ Active' : '❌ Inactive'}
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
                        <div className="flex items-center mb-3">
                            <span className="text-yellow-600 text-xl mr-2">👑</span>
                            <h3 className="font-bold text-gray-800">Owner Controls</h3>
                        </div>

                        {/* Voting Control */}
                        <div className="mb-4">
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
                        <form onSubmit={handleRegisterVoter} className="p-3 bg-white rounded border border-gray-200">
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
