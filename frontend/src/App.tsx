import { WalletProvider } from './components/WalletProvider';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { ErrorBoundary } from './components/ErrorBoundary';
import SmartWalletManager from './components/SmartWalletManager';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useWallet } from '@solana/wallet-adapter-react';

function AppContent() {
  const { connected } = useWallet();

  return (
    <Router>
      <div className="min-h-screen">
        {connected && <Header />}
        <main className={connected ? "container mx-auto px-4 py-8" : ""}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/smart-wallet" element={<SmartWalletManager />} />
          </Routes>
          <Toaster position="top-right" />
        </main>
      </div>
    </Router>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <WalletProvider>
        <AppContent />
      </WalletProvider>
    </ErrorBoundary>
  );
}

export default App;
