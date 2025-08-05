import { WalletProvider } from './components/WalletProvider';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';

function App() {
  return (
    <WalletProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Dashboard />
        </main>
      </div>
    </WalletProvider>
  );
}

export default App;
