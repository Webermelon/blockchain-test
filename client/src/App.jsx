
import Wallet from "./components/Wallet";
import TransactionForm from "./components/TransactionForm";
import TransactionList from "./components/TransactionList";
import { useEthereum } from "./context/EthereumContext";

const App = () => {

    const { appMode } = useEthereum();

    return <>
        <div className="w-full h-full min-h-screen bg-gray-100 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
                        Blockchain Transaction & Voting App
                    </h1>
                    <p className="text-center text-gray-600">Send and track Ethereum transactions and votes</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 mb-8">
                    <Wallet />
                    {appMode === 'transactions' && <TransactionForm />}
                </div>

                {appMode === 'transactions' && <TransactionList />}
            </div>
        </div>
    </>;
};

export default App;