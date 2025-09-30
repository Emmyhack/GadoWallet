import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WalletContextProvider } from './contexts/WalletContext';
import Navbar from './components/Navbar';
import LandingPageStitch from './pages/LandingPageStitch';
import Dashboard from './pages/Dashboard';
import AddHeir from './pages/AddHeir';
import ClaimAssets from './pages/ClaimAssets';
import UpdateActivity from './pages/UpdateActivity';
import BatchTransfer from './pages/BatchTransfer';

function App() {
  return (
    <WalletContextProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <Navbar />
            <main className="pt-16 lg:pt-20">
              <Routes>
                <Route path="/" element={<LandingPageStitch />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/add-heir" element={<AddHeir />} />
                <Route path="/claim-assets" element={<ClaimAssets />} />
                <Route path="/update-activity" element={<UpdateActivity />} />
                <Route path="/batch-transfer" element={<BatchTransfer />} />
              </Routes>
            </main>
          </div>
        </Router>
    </WalletContextProvider>
  );
}

export default App;
