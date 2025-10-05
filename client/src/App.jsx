
import Wallet from "./components/Wallet";
import TransactionForm from "./components/TransactionForm";
import TransactionList from "./components/TransactionList";
import VotingPanel from "./components/VotingPanel";
import CandidateList from "./components/CandidateList";
import { useEthereum } from "./context/EthereumContext";

const App = () => {

    const { appMode } = useEthereum();

    return <>
        <div className="w-full h-full min-h-screen bg-gray-100 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <div className="text-center mb-6">
                        <a href="https://webermelon.com/" className="inline-block m-auto max-w-52">
                            <img width="313" height="57" src="https://webermelon.com/wp-content/uploads/2022/09/Group-171.png"
                                className="attachment-large size-large wp-image-1147" alt=""
                                srcSet="https://webermelon.com/wp-content/uploads/2022/09/Group-171.png 313w, https://webermelon.com/wp-content/uploads/2022/09/Group-171-300x55.png 300w"
                                sizes="(max-width: 313px) 100vw, 313px" />
                        </a>
                    </div>
                    <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
                        Blockchain Transaction & Voting App
                    </h1>
                    <p className="text-center text-gray-600">Send and track Ethereum transactions and votes</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 mb-8">
                    <Wallet />
                    {appMode === 'transactions' && <TransactionForm />}
                    {appMode === 'votes' && <VotingPanel />}
                </div>

                {appMode === 'transactions' && <TransactionList />}
                {appMode === 'votes' && <CandidateList />}
            </div>
            <div className="mt-8 text-center text-gray-500 text-sm">
                <p>&copy; 2025 <a href="https://webermelon.com/" className="underline hover:text-green-600 transition-colors">Webermelon</a>. All rights reserved.</p>
            </div>
        </div>
    </>;
};

export default App;