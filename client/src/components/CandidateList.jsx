import { useState, useEffect } from "react";
import { useEthereum } from "../context/EthereumContext";
import { useVoting } from "../context/VotingContext";

const CandidateList = () => {
    const { currentAccount } = useEthereum();
    const { candidates, vote, voterInfo, votingActive, isLoading, loadCandidates, getWinner } = useVoting();
    const [winner, setWinner] = useState(null);
    const [isLoadingWinner, setIsLoadingWinner] = useState(false);

    // Filter to show only active candidates
    const activeCandidates = candidates.filter(candidate => candidate.isActive);

    const handleVote = async (candidateId) => {
        if (!voterInfo?.isRegistered) {
            alert("You are not registered to vote");
            return;
        }
        if (voterInfo?.hasVoted) {
            alert("You have already voted");
            return;
        }
        if (!votingActive) {
            alert("Voting is not active");
            return;
        }

        const confirmed = window.confirm(`Are you sure you want to vote for this candidate?`);
        if (confirmed) {
            await vote(candidateId);
        }
    };

    const handleRefresh = async () => {
        await loadCandidates();
    };

    const handleGetWinner = async () => {
        setIsLoadingWinner(true);
        try {
            const winnerData = await getWinner();
            if (winnerData) {
                setWinner(winnerData);
            } else {
                console.log("No winner found yet");
            }
        } catch (error) {
            console.error("Error getting winner:", error);
        } finally {
            setIsLoadingWinner(false);
        }
    };

    useEffect(() => {
        if (candidates.length > 0) {
            handleGetWinner();
        }
    }, [candidates]);

    if (!currentAccount) {
        return (
            <div className="mt-8 p-8 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <h3 className="text-xl font-bold text-gray-600 mb-2">Candidates</h3>
                <p className="text-gray-500">Please connect your wallet to view candidates</p>
            </div>
        );
    }

    return (
        <div className="mt-8">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Candidates</h3>
                <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">
                        Active: {activeCandidates.length} candidate{activeCandidates.length !== 1 ? 's' : ''}
                    </span>
                    <button
                        onClick={handleRefresh}
                        disabled={isLoading}
                        className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:bg-gray-400 transition-colors text-sm"
                    >
                        {isLoading ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>
            </div>

            {/* Winner Display */}
            {winner && winner.winnerVoteCount > 0 && (
                <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <span className="text-3xl mr-3">🏆</span>
                            <div>
                                <h4 className="font-bold text-gray-800 text-lg">Current Leader</h4>
                                <p className="text-gray-700">
                                    <span className="font-semibold">{winner.winnerName}</span>
                                    <span className="text-gray-500 ml-2">({winner.winnerVoteCount} vote{winner.winnerVoteCount !== 1 ? 's' : ''})</span>
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleGetWinner}
                            disabled={isLoadingWinner}
                            className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-sm font-medium transition-colors disabled:bg-gray-400"
                        >
                            {isLoadingWinner ? '...' : 'Refresh'}
                        </button>
                    </div>
                </div>
            )}

            {isLoading ? (
                <div className="flex justify-center items-center p-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                    <span className="ml-4 text-gray-600">Loading candidates...</span>
                </div>
            ) : activeCandidates.length === 0 ? (
                <div className="text-center p-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="text-gray-400 text-6xl mb-4">🗳️</div>
                    <h4 className="text-lg font-medium text-gray-600 mb-2">No active candidates</h4>
                    <p className="text-gray-500">Active candidates will appear here once they are added by the admin</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeCandidates.map((candidate) => {
                        const hasVotedForThis = voterInfo?.hasVoted && voterInfo?.votedCandidateId === candidate.id;
                        const canVote = voterInfo?.isRegistered && !voterInfo?.hasVoted && votingActive;

                        return (
                            <div
                                key={candidate.id}
                                className={`bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-200 ${hasVotedForThis ? 'ring-4 ring-green-400' : 'hover:shadow-xl'
                                    }`}
                            >
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h4 className="text-lg font-bold text-gray-800 mb-1">{candidate.name}</h4>
                                            <span className="text-sm text-gray-500">Candidate #{candidate.id}</span>
                                        </div>
                                        {hasVotedForThis && (
                                            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full">
                                                ✓ Your Vote
                                            </span>
                                        )}
                                    </div>

                                    {candidate.description && (
                                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                            {candidate.description}
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg mb-4">
                                        <span className="text-sm font-medium text-gray-700">Vote Count</span>
                                        <span className="text-2xl font-bold text-purple-600">{candidate.voteCount}</span>
                                    </div>

                                    <button
                                        onClick={() => handleVote(candidate.id)}
                                        disabled={!canVote || isLoading}
                                        className={`w-full py-2.5 px-4 rounded-md font-medium transition-colors ${canVote
                                            ? 'bg-purple-500 hover:bg-purple-600 text-white'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            } disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed`}
                                    >
                                        {hasVotedForThis
                                            ? '✓ You Voted for This'
                                            : voterInfo?.hasVoted
                                                ? 'Already Voted'
                                                : !voterInfo?.isRegistered
                                                    ? 'Not Registered'
                                                    : !votingActive
                                                        ? 'Voting Inactive'
                                                        : 'Vote for This Candidate'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default CandidateList;
