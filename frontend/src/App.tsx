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
                <nav className="mb-6 flex items-center space-x-4 text-sm">
                  <Link to="/" className="text-blue-600 hover:underline">Dashboard</Link>
                </nav>
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
