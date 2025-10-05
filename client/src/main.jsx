import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { EthereumProvider } from './context/EthereumContext.jsx';
import { TransactionProvider } from './context/TransactionContext.jsx';

createRoot(document.getElementById('root'))
    .render(
        <EthereumProvider>
            <TransactionProvider>
                <App />
            </TransactionProvider>
        </EthereumProvider>
    );
