import { WalletProvider } from './components/WalletProvider';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { ErrorBoundary } from './components/ErrorBoundary';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useWallet } from '@solana/wallet-adapter-react';
import { useGeoLanguage } from './hooks/useGeoLanguage';

// Import test utilities in development
if (import.meta.env.DEV) {
  import('./lib/geo-language-test');
}

function AppContent() {
  const { connected } = useWallet();
  const { suggestion, showModal, hideModal } = useGeoLanguage();

  return (
    <Router>
      <div className="min-h-screen">
        {connected && <Header />}
        <main className={connected ? "container mx-auto px-4 py-8" : ""}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
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
