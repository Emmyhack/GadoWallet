import { CivicAuthProvider } from "@civic/auth/react";
import { WalletProvider } from './components/WalletProvider';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { ErrorBoundary } from './components/ErrorBoundary';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { CivicTestPage } from './components/CivicTestPage';

function App() {
  return (
    <ErrorBoundary>
      <CivicAuthProvider 
        clientId="f2fc33e0-3b6b-4ea7-bb5e-a5f60b45e808"
        displayMode="iframe"
        iframeMode="modal"
        onSignIn={(error) => {
          if (error) {
            console.error('Civic sign-in error:', error);
          } else {
            console.log('Civic sign-in successful');
          }
        }}
        onSignOut={() => {
          console.log('Civic sign-out');
        }}
      >
        <WalletProvider>
          <Router>
            <div className="min-h-screen">
              <Header />
              <main className="container mx-auto px-4 py-8">
                <nav className="mb-6 flex items-center space-x-4 text-sm">
                  <Link to="/" className="text-blue-600 hover:underline">Dashboard</Link>
                  <Link to="/civic-test" className="text-blue-600 hover:underline">Civic Test</Link>
                </nav>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/civic-test" element={<CivicTestPage />} />
                </Routes>
              </main>
            </div>
          </Router>
        </WalletProvider>
      </CivicAuthProvider>
    </ErrorBoundary>
  );
}

export default App;
