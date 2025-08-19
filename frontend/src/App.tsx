import { WalletProvider } from './components/WalletProvider';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { ErrorBoundary } from './components/ErrorBoundary';

console.log('📱 App component loaded');

function App() {
  console.log('🏗️ App component rendering');
  
  return (
    <ErrorBoundary>
      <WalletProvider>
        <div className="min-h-screen">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <Dashboard />
          </main>
        </div>
      </WalletProvider>
    </ErrorBoundary>
  );
}

export default App;
