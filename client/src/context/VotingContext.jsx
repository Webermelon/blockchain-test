import { createContext, useState, useEffect, useContext } from "react";
import { ethers } from "ethers";
import { VotingSystemContractABI, VotingSystemContractAddress } from "../utils/constants";
import { useEthereum } from "./EthereumContext";

export const VotingContext = createContext();

export const useVoting = () => {
    const context = useContext(VotingContext);
    if (!context) {
        throw new Error('useVoting must be used within a VotingProvider');
    }
    return context;
};

export const VotingProvider = ({ children }) => {
    const { ethereum } = window;
    const { currentAccount } = useEthereum();

    const [candidates, setCandidates] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [votingActive, setVotingActive] = useState(false);
    const [totalVotes, setTotalVotes] = useState(0);
    const [voterInfo, setVoterInfo] = useState(null);
    const [isOwner, setIsOwner] = useState(false);
    const [registeredVoters, setRegisteredVoters] = useState([]);

    const getVotingContract = async () => {
        const provider = new ethers.BrowserProvider(ethereum);
        const signer = await provider.getSigner();
        const votingContract = new ethers.Contract(VotingSystemContractAddress, VotingSystemContractABI, signer);
        return votingContract;
    };

    const loadCandidates = async () => {
        try {
            if (!ethereum) return;
            setIsLoading(true);

            const votingContract = await getVotingContract();
            const allCandidates = await votingContract.getActiveCandidates();

            const formattedCandidates = allCandidates.map(candidate => ({
                id: Number(candidate.id),
                name: candidate.name,
                description: candidate.description,
                voteCount: Number(candidate.voteCount),
                isActive: candidate.isActive
            }));

            setCandidates(formattedCandidates);
        } catch (error) {
            console.error("Error loading candidates:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadVotingStatus = async () => {
        try {
            if (!ethereum) return;

            const votingContract = await getVotingContract();
            const active = await votingContract.votingActive();
            const votes = await votingContract.totalVotes();

            setVotingActive(active);
            setTotalVotes(Number(votes));
        } catch (error) {
            console.error("Error loading voting status:", error);
        }
    };

    const loadVoterInfo = async () => {
        try {
            if (!ethereum || !currentAccount) return;

            const votingContract = await getVotingContract();
            const voter = await votingContract.getVoter(currentAccount);

            setVoterInfo({
                isRegistered: voter.isRegistered,
                hasVoted: voter.hasVoted,
                votedCandidateId: Number(voter.votedCandidateId),
                isActive: voter.isActive
            });
        } catch (error) {
            console.error("Error loading voter info:", error);
        }
    };

    const checkIsOwner = async () => {
        try {
            if (!ethereum || !currentAccount) return;

            const votingContract = await getVotingContract();
            const owner = await votingContract.owner();

            setIsOwner(owner.toLowerCase() === currentAccount.toLowerCase());
        } catch (error) {
            console.error("Error checking owner:", error);
        }
    };

    const loadRegisteredVoters = async () => {
        try {
            if (!ethereum) return;

            const votingContract = await getVotingContract();

            // Get VoterRegistered events
            const filter = votingContract.filters.VoterRegistered();
            const events = await votingContract.queryFilter(filter);

            // Extract unique voter addresses from events
            const voterAddresses = [...new Set(events.map(event => event.args.voter))];

            // Fetch voter info for each address
            const votersData = await Promise.all(
                voterAddresses.map(async (address) => {
                    const voter = await votingContract.getVoter(address);
                    return {
                        address: address,
                        isRegistered: voter.isRegistered,
                        hasVoted: voter.hasVoted,
                        votedCandidateId: Number(voter.votedCandidateId),
                        isActive: voter.isActive
                    };
                })
            );

            setRegisteredVoters(votersData);
        } catch (error) {
            console.error("Error loading registered voters:", error);
        }
    };

    const vote = async (candidateId) => {
        try {
            if (!ethereum) return alert("Please install MetaMask.");

            setIsLoading(true);
            const votingContract = await getVotingContract();

            const tx = await votingContract.vote(candidateId);
            await tx.wait();

            alert("Vote cast successfully!");
            await loadCandidates();
            await loadVoterInfo();
            await loadVotingStatus();
        } catch (error) {
            alert(`Voting failed: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const addCandidate = async (name, description) => {
        try {
            if (!ethereum) return alert("Please install MetaMask.");

            setIsLoading(true);
            const votingContract = await getVotingContract();

            const tx = await votingContract.addCandidate(name, description);
            await tx.wait();

            alert("Candidate added successfully!");
            await loadCandidates();
        } catch (error) {
            alert(`Failed to add candidate: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const registerVoter = async (voterAddress) => {
        try {
            if (!ethereum) return alert("Please install MetaMask.");

            setIsLoading(true);
            const votingContract = await getVotingContract();

            const tx = await votingContract.registerVoter(voterAddress);
            await tx.wait();

            alert("Voter registered successfully!");
            await loadVoterInfo();
            await loadRegisteredVoters();
        } catch (error) {
            alert(`Failed to register voter: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const deleteVoter = async (voterAddress) => {
        try {
            if (!ethereum) return alert("Please install MetaMask.");

            setIsLoading(true);
            const votingContract = await getVotingContract();

            const tx = await votingContract.deleteVoter(voterAddress);
            await tx.wait();

            alert("Voter removed successfully!");
            await loadRegisteredVoters();
        } catch (error) {
            alert(`Failed to remove voter: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleVoting = async (start) => {
        try {
            if (!ethereum) return alert("Please install MetaMask.");

            setIsLoading(true);
            const votingContract = await getVotingContract();

            const tx = start ? await votingContract.startVoting() : await votingContract.stopVoting();
            await tx.wait();

            alert(`Voting ${start ? 'started' : 'stopped'} successfully!`);
            await loadVotingStatus();
        } catch (error) {
            alert(`Failed to ${start ? 'start' : 'stop'} voting: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const getWinner = async () => {
        try {
            if (!ethereum) return;

            const votingContract = await getVotingContract();
            const winner = await votingContract.getWinner();

            return {
                winnerId: Number(winner.winnerId),
                winnerName: winner.winnerName,
                winnerVoteCount: Number(winner.winnerVoteCount)
            };
        } catch (error) {
            console.error("Error getting winner:", error);
            return null;
        }
    };

    useEffect(() => {
        if (currentAccount) {
            loadCandidates();
            loadVotingStatus();
            loadVoterInfo();
            checkIsOwner();
            loadRegisteredVoters();
        }
    }, [currentAccount]);

    return (
        <VotingContext.Provider value={{
            candidates,
            isLoading,
            votingActive,
            totalVotes,
            voterInfo,
            isOwner,
            registeredVoters,
            vote,
            addCandidate,
            registerVoter,
            deleteVoter,
            toggleVoting,
            getWinner,
            loadCandidates,
            loadVotingStatus,
            loadVoterInfo,
            loadRegisteredVoters,
        }}>
            {children}
        </VotingContext.Provider>
    );
};
