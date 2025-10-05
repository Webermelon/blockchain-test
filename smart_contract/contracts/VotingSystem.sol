// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VotingSystem {
    address public owner;
    
    struct Candidate {
        uint256 id;
        string name;
        string description;
        uint256 voteCount;
        bool isActive;
    }
    
    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint256 votedCandidateId;
        bool isActive;
    }
    
    mapping(uint256 => Candidate) public candidates;
    mapping(address => Voter) public voters;
    
    uint256 public candidatesCount;
    uint256 public totalVotes;
    bool public votingActive;
    
    event CandidateAdded(uint256 indexed candidateId, string name);
    event CandidateUpdated(uint256 indexed candidateId, string name);
    event CandidateDeleted(uint256 indexed candidateId);
    event VoterRegistered(address indexed voter);
    event VoterDeleted(address indexed voter);
    event VoteCast(address indexed voter, uint256 indexed candidateId);
    event VotingStatusChanged(bool status);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }
    
    modifier votingIsActive() {
        require(votingActive, "Voting is not active");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        votingActive = false;
    }
    
    // CRUD Operations for Candidates
    
    function addCandidate(string memory _name, string memory _description) public onlyOwner {
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, _description, 0, true);
        emit CandidateAdded(candidatesCount, _name);
    }
    
    function updateCandidate(uint256 _candidateId, string memory _name, string memory _description) public onlyOwner {
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate ID");
        require(candidates[_candidateId].isActive, "Candidate is deleted");
        
        candidates[_candidateId].name = _name;
        candidates[_candidateId].description = _description;
        emit CandidateUpdated(_candidateId, _name);
    }
    
    function deleteCandidate(uint256 _candidateId) public onlyOwner {
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate ID");
        require(candidates[_candidateId].isActive, "Candidate already deleted");
        
        candidates[_candidateId].isActive = false;
        emit CandidateDeleted(_candidateId);
    }
    
    function getCandidate(uint256 _candidateId) public view returns (
        uint256 id,
        string memory name,
        string memory description,
        uint256 voteCount,
        bool isActive
    ) {
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate ID");
        Candidate memory c = candidates[_candidateId];
        return (c.id, c.name, c.description, c.voteCount, c.isActive);
    }
    
    function getAllCandidates() public view returns (Candidate[] memory) {
        Candidate[] memory allCandidates = new Candidate[](candidatesCount);
        for (uint256 i = 1; i <= candidatesCount; i++) {
            allCandidates[i - 1] = candidates[i];
        }
        return allCandidates;
    }
    
    function getActiveCandidates() public view returns (Candidate[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 1; i <= candidatesCount; i++) {
            if (candidates[i].isActive) {
                activeCount++;
            }
        }
        
        Candidate[] memory activeCandidates = new Candidate[](activeCount);
        uint256 index = 0;
        for (uint256 i = 1; i <= candidatesCount; i++) {
            if (candidates[i].isActive) {
                activeCandidates[index] = candidates[i];
                index++;
            }
        }
        return activeCandidates;
    }
    
    // CRUD Operations for Voters
    
    function registerVoter(address _voter) public onlyOwner {
        require(!voters[_voter].isRegistered, "Voter already registered");
        voters[_voter] = Voter(true, false, 0, true);
        emit VoterRegistered(_voter);
    }
    
    function deleteVoter(address _voter) public onlyOwner {
        require(voters[_voter].isRegistered, "Voter not registered");
        require(voters[_voter].isActive, "Voter already deleted");
        voters[_voter].isActive = false;
        emit VoterDeleted(_voter);
    }
    
    function getVoter(address _voter) public view returns (
        bool isRegistered,
        bool hasVoted,
        uint256 votedCandidateId,
        bool isActive
    ) {
        Voter memory v = voters[_voter];
        return (v.isRegistered, v.hasVoted, v.votedCandidateId, v.isActive);
    }
    
    // Voting Functions
    
    function vote(uint256 _candidateId) public votingIsActive {
        require(voters[msg.sender].isRegistered, "You are not registered to vote");
        require(voters[msg.sender].isActive, "Your voter registration is inactive");
        require(!voters[msg.sender].hasVoted, "You have already voted");
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate ID");
        require(candidates[_candidateId].isActive, "Candidate is not active");
        
        voters[msg.sender].hasVoted = true;
        voters[msg.sender].votedCandidateId = _candidateId;
        candidates[_candidateId].voteCount++;
        totalVotes++;
        
        emit VoteCast(msg.sender, _candidateId);
    }
    
    function startVoting() public onlyOwner {
        votingActive = true;
        emit VotingStatusChanged(true);
    }
    
    function stopVoting() public onlyOwner {
        votingActive = false;
        emit VotingStatusChanged(false);
    }
    
    function getWinner() public view returns (uint256 winnerId, string memory winnerName, uint256 winnerVoteCount) {
        require(candidatesCount > 0, "No candidates available");
        
        uint256 maxVotes = 0;
        uint256 winningCandidateId = 0;
        
        for (uint256 i = 1; i <= candidatesCount; i++) {
            if (candidates[i].isActive && candidates[i].voteCount > maxVotes) {
                maxVotes = candidates[i].voteCount;
                winningCandidateId = i;
            }
        }
        
        require(winningCandidateId > 0, "No winner found");
        return (winningCandidateId, candidates[winningCandidateId].name, maxVotes);
    }
}