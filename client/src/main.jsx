import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { TransactionProvider } from './context/TransactionContext.jsx';

createRoot(document.getElementById('root'))
    .render(
        <TransactionProvider>
            <App />
        </TransactionProvider>
    );
