import { WalletProvider } from './components/WalletProvider';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { ErrorBoundary } from './components/ErrorBoundary';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

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
                </Routes>
              </main>
            </div>
          </Router>
        </WalletProvider>
    </ErrorBoundary>
  );
}

export default App;
