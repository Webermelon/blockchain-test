# Blockchain Transaction & Voting App

A full-stack decentralized application (dApp) built with React and Ethereum smart contracts, enabling users to send cryptocurrency transactions and participate in a transparent voting system on the blockchain.

[Explore Live Now](https://webermelon-test-blockchain.netlify.app/)

<img width="1487" height="1281" alt="screencapture-webermelon-test-blockchain-netlify-app-2025-10-05-17_12_04" src="https://github.com/user-attachments/assets/6bbe79ea-2761-4761-9f42-c568258887a7" />
<img width="1486" height="1932" alt="screencapture-webermelon-test-blockchain-netlify-app-2025-10-05-17_11_45" src="https://github.com/user-attachments/assets/e0ba3c44-c07b-4edb-a839-9d076ea83b9e" />


---

## 📋 Table of Contents

- [Overview](#overview)
- [Understanding Blockchain](#understanding-blockchain)
- [Smart Contracts](#smart-contracts)
- [Frontend Application](#frontend-application)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Deployment](#deployment)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [License](#license)

---

## 🌟 Overview

This project demonstrates a real-world blockchain application with two main features:

1. **Transaction System** - Send Ethereum (ETH) to other addresses with custom messages and transaction types
2. **Voting System** - Participate in decentralized voting with complete CRUD operations for candidates and voters

The application connects to MetaMask wallet and interacts with smart contracts deployed on the Ethereum Sepolia test network.

---

## 🔗 Understanding Blockchain

### What is Blockchain?

Blockchain is a distributed, immutable ledger technology that records transactions across multiple computers. In this application:

- **Decentralization**: No single authority controls the data; it's distributed across the network
- **Transparency**: All transactions are publicly visible and verifiable on the blockchain
- **Immutability**: Once recorded, transaction data cannot be altered or deleted
- **Security**: Cryptographic techniques ensure data integrity and user authentication

### How This App Uses Blockchain

#### 1. **Ethereum Transactions**
- Users can send ETH (Ethereum's cryptocurrency) to other wallet addresses
- Each transaction is recorded permanently on the blockchain with:
  - Sender and receiver addresses
  - Amount transferred
  - Timestamp
  - Custom message and transaction type
  - Unique transaction hash

#### 2. **Data Storage**
- Transaction data is stored on-chain in smart contracts
- Voting data (candidates, votes, voter registration) is immutably recorded
- All data is retrievable and verifiable by anyone

#### 3. **Cryptocurrency Transfer**
- Real ETH is transferred between wallets
- Gas fees are paid to miners/validators for processing transactions
- Transactions are final once confirmed on the blockchain

---

## 📜 Smart Contracts

Smart contracts are self-executing programs deployed on the blockchain. This project includes two Solidity smart contracts.

### Development Environment

#### Hardhat
[Hardhat](https://hardhat.org/) is a professional Ethereum development environment that provides:

- **Compilation**: Converts Solidity code into bytecode for deployment
- **Testing**: Built-in testing framework for smart contracts
- **Deployment**: Scripts to deploy contracts to various networks
- **Debugging**: Console logging and error tracing for development

#### Key Dependencies

```json
{
  "@nomicfoundation/hardhat-toolbox": "^5.0.0",
  "hardhat": "^2.22.0",
  "dotenv": "^16.3.1"
}
```

- **@nomicfoundation/hardhat-toolbox**: All-in-one plugin bundle including:
  - Ethers.js integration for blockchain interaction
  - Hardhat Network for local blockchain testing
  - Gas reporting and contract verification tools
  - TypeScript support and testing utilities

- **dotenv**: Securely manages environment variables for API keys and private keys

### Network Configuration

#### Alchemy
[Alchemy](https://www.alchemy.com/) is a blockchain infrastructure provider that offers:
- Reliable RPC endpoints for connecting to Ethereum networks
- Enhanced APIs for faster blockchain queries
- WebSocket support for real-time updates
- Request monitoring and debugging tools

#### Sepolia Test Network
Sepolia is an Ethereum test network used for development:
- **Purpose**: Test smart contracts without spending real money
- **Test ETH**: Free test currency obtained from faucets
- **Production-like**: Behaves identically to Ethereum mainnet
- **Safe Testing**: Experiment without financial risk

The app can be configured for other networks:
- **Test Networks**: Goerli, Rinkeby, Mumbai (Polygon)
- **Mainnets**: Ethereum Mainnet, Polygon, Binance Smart Chain
- **Local**: Hardhat Network for development

### Contract Configuration

The `hardhat.config.js` configures the development environment:

```javascript
{
  solidity: "0.8.27",
  networks: {
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [PRIVATE_KEY]
    }
  }
}
```

### Smart Contract Details

#### 1. Transactions Contract (`Transactions.sol`)
Manages Ethereum transfers with metadata:

**Features:**
- Transfer ETH with custom messages
- Store transaction history on-chain
- Retrieve all transactions
- Track total transaction count
- Emit events for transaction tracking

**Key Functions:**
- `addToBlockchain()`: Send ETH with message and keyword
- `getAllTransactions()`: Retrieve complete transaction history
- `getTransactionCount()`: Get total number of transactions

#### 2. Voting System Contract (`VotingSystem.sol`)
Complete decentralized voting platform:

**Features:**
- Owner-controlled candidate management (add, update, delete)
- Voter registration system
- Active/inactive status for candidates and voters
- Real-time vote counting
- Winner determination
- Voting session control (start/stop)

**Key Functions:**
- **Candidate Management**: `addCandidate()`, `updateCandidate()`, `deleteCandidate()`, `getAllCandidates()`
- **Voter Management**: `registerVoter()`, `deleteVoter()`, `getVoter()`
- **Voting**: `vote()`, `startVoting()`, `stopVoting()`, `getWinner()`

### Compilation & Deployment

#### Compile Contracts
```bash
cd smart_contract
npm run compile
```
Hardhat compiles Solidity contracts and generates:
- Bytecode for blockchain deployment
- ABI (Application Binary Interface) for frontend interaction
- Artifacts in `artifacts/` directory

#### Deploy to Sepolia
```bash
npm run deploy
```
The deployment script (`scripts/deploy.js`):
1. Connects to Sepolia network via Alchemy
2. Uses your wallet's private key for authentication
3. Deploys contracts and waits for confirmation
4. Returns deployed contract addresses for frontend configuration

**Environment Variables Required:**
```env
ALCHEMY_API_KEY=your_alchemy_api_key
PRIVATE_KEY=your_wallet_private_key
```

---

## ⚛️ Frontend Application

A modern React application that connects to MetaMask and interacts with deployed smart contracts.

### Architecture

#### Context-Based State Management
The app uses React Context API for centralized state management across three contexts:

1. **EthereumContext**: Wallet connection and account management
2. **TransactionContext**: Transaction operations and history
3. **VotingContext**: Voting operations and candidate management

### MetaMask Integration

#### What is MetaMask?
[MetaMask](https://metamask.io/) is a browser extension wallet that:
- Manages Ethereum accounts and private keys securely
- Signs transactions without exposing private keys
- Connects websites to the Ethereum blockchain
- Switches between different networks

#### Connection Flow
```javascript
// Request account access
const accounts = await ethereum.request({ 
  method: "eth_requestAccounts" 
});

// User approves in MetaMask popup
// App receives wallet address
setCurrentAccount(accounts[0]);
```

### Ethers.js - Blockchain Interaction

[Ethers.js](https://docs.ethers.org/) is a complete Ethereum library that enables:

#### 1. **Provider Setup**
```javascript
const provider = new ethers.BrowserProvider(window.ethereum);
```
- Connects to Ethereum network through MetaMask
- Reads blockchain data (balances, transactions, contract state)

#### 2. **Signer for Transactions**
```javascript
const signer = await provider.getSigner();
```
- Represents the user's wallet
- Signs transactions with private key (secured by MetaMask)
- Required for write operations

#### 3. **Contract Interaction**
```javascript
const contract = new ethers.Contract(
  contractAddress,  // Deployed contract address
  contractABI,      // Contract interface
  signer            // User's wallet for signing
);

// Call contract functions
await contract.vote(candidateId);
```

### Key Operations

#### Sending Transactions
1. User fills transaction form (recipient, amount, message)
2. Frontend validates input data
3. Ethers.js formats transaction data
4. MetaMask prompts user to confirm and sign
5. Transaction is broadcast to blockchain
6. App waits for confirmation
7. Transaction hash is stored locally for reference
8. UI updates with new transaction

#### Voting Process
1. Owner registers voters via smart contract
2. Owner starts voting session
3. Registered voters cast votes through UI
4. MetaMask signs the vote transaction
5. Smart contract validates voter eligibility
6. Vote is recorded immutably on blockchain
7. Vote counts update in real-time

#### Real-time Updates
```javascript
// Fetch balance
const balance = await provider.getBalance(address);

// Load all transactions
const txns = await contract.getAllTransactions();

// Listen for events
contract.on("VoteCast", (voter, candidateId) => {
  // Update UI when votes are cast
});
```

### Component Overview

- **Wallet.jsx**: Displays wallet info, connection status, and app mode switcher
- **TransactionForm.jsx**: Form to send ETH transactions with validation
- **TransactionList.jsx**: Displays transaction history from blockchain
- **VotingPanel.jsx**: Admin panel for managing voting (owner-only features)
- **CandidateList.jsx**: Shows candidates and vote counts with voting interface

### Data Flow

```
User Action → React Component → Context Provider 
  → Ethers.js → MetaMask (Sign Transaction) 
  → Ethereum Network → Smart Contract 
  → Blockchain → Event Emission 
  → Frontend Update
```

---

## 🔧 Prerequisites

Before running this project, ensure you have:

1. **Node.js** (v18 or higher)
2. **MetaMask** browser extension installed
3. **Sepolia Test ETH** - Get free test ETH from [Sepolia Faucet](https://sepoliafaucet.com/)
4. **Alchemy Account** - Sign up at [Alchemy](https://www.alchemy.com/) for API access

---

## 📦 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/shahinmoyshan/blockchain.git
cd blockchain
```

### 2. Install Smart Contract Dependencies
```bash
cd smart_contract
npm install
```

### 3. Configure Environment Variables
Create `.env` file in `smart_contract/`:
```env
ALCHEMY_API_KEY=your_alchemy_api_key_here
PRIVATE_KEY=your_wallet_private_key_here
```

> ⚠️ **Security Warning**: Never commit your `.env` file or share your private key!

### 4. Install Frontend Dependencies
```bash
cd ../client
npm install
```

---

## 🚀 Deployment

### Deploy Smart Contracts

1. **Compile contracts:**
   ```bash
   cd smart_contract
   npm run compile
   ```

2. **Deploy to Sepolia:**
   ```bash
   npm run deploy
   ```

3. **Copy contract addresses** from deployment output

4. **Move Compiled ABI to frontend** move the compiled ABI json file <br />
    from `/smart_contract/artifacts/contracts/VotingSystem.sol/VotingSystem.json` <br />
    to: `/client/src/utils/`.

5. **Update frontend configuration:**
   Edit `client/src/utils/constants.js`:
   ```javascript
   export const TransactionsContractAddress = "YOUR_DEPLOYED_ADDRESS";
   export const VotingSystemContractAddress = "YOUR_DEPLOYED_ADDRESS";
   ```

### Run Frontend Application

```bash
cd client
npm run dev
```

Visit `http://localhost:5173` to use the app.

---

## 📖 Usage

### First-Time Setup

1. **Connect MetaMask**
   - Click "Connect MetaMask" button
   - Approve connection in MetaMask popup
   - Ensure you're on Sepolia test network

2. **Get Test ETH**
   - Visit [Sepolia Faucet](https://www.alchemy.com/faucets/ethereum-sepolia)
   - Enter your wallet address
   - Wait for test ETH to arrive

### Sending Transactions

1. Switch to "Transactions" mode
2. Enter recipient address (or use provided test address)
3. Specify amount in ETH
4. Select transaction type
5. Add optional message
6. Click "Send Transaction"
7. Confirm in MetaMask
8. Wait for confirmation

### Using Voting System

**For Voters:**
1. Wait for owner to register your address
2. Switch to "Votes" mode
3. View active candidates
4. Cast your vote when voting is active
5. View real-time results

**For Contract Owner:**
1. Add candidates with name and description
2. Register voter addresses
3. Start voting session
4. Monitor votes in real-time
5. Stop voting when complete
6. View winner

---

## 📁 Project Structure

```
blockchain/
├── smart_contract/          # Solidity smart contracts
│   ├── contracts/
│   │   ├── Transactions.sol
│   │   └── VotingSystem.sol
│   ├── scripts/
│   │   └── deploy.js
│   ├── hardhat.config.js
│   └── package.json
│
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── context/         # State management
│   │   ├── utils/           # Contract ABIs and addresses
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## 🛠️ Technologies Used

### Smart Contract Development
- **Solidity** (^0.8.27) - Smart contract programming language
- **Hardhat** (^2.22.0) - Development environment
- **@nomicfoundation/hardhat-toolbox** (^5.0.0) - Hardhat plugin bundle

### Frontend
- **React** (^19.1.1) - UI library
- **Ethers.js** (^6.13.0) - Ethereum library
- **Vite** (^7.1.7) - Build tool and dev server
- **TailwindCSS** (^4.0.17) - Styling

### Infrastructure
- **Alchemy** - Blockchain infrastructure provider
- **Sepolia** - Ethereum test network
- **MetaMask** - Wallet and transaction signing

---

## 📝 License

This project is open source and available for educational purposes.
