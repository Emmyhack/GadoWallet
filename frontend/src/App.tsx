import { WalletProvider } from './components/WalletProvider';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { ErrorBoundary } from './components/ErrorBoundary';
import SmartWalletManager from './components/SmartWalletManager';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <ErrorBoundary>
        <WalletProvider>
          <Router>
            <div className="min-h-screen">
              <Header />
              <main className="container mx-auto px-4 py-8">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/smart-wallet" element={<SmartWalletManager />} />
                </Routes>
                <Toaster position="top-right" />
              </main>
            </div>
          </Router>
        </WalletProvider>
    </ErrorBoundary>
  );
}

export default App;
