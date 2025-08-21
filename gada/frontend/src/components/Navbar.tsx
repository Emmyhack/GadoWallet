import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Shield, Zap, Users, Coins, Wallet } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { connected, publicKey } = useWallet();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', path: '/', icon: Shield },
    { name: 'Dashboard', path: '/dashboard', icon: Zap },
    { name: 'Add Heir', path: '/add-heir', icon: Users },
    { name: 'Claim Assets', path: '/claim-assets', icon: Coins },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/10 backdrop-blur-md border-b border-white/20 shadow-lg' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-300">
                GadaWallet
              </span>
              <span className="text-xs text-white/60 font-medium">Secure Digital Legacy</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`nav-link flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                    isActive 
                      ? 'text-white bg-white/10 backdrop-blur-sm' 
                      : 'text-white/80 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{item.name}</span>
                  {isActive && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Wallet Connection */}
          <div className="hidden lg:flex items-center space-x-4">
            {connected ? (
              <div className="flex items-center space-x-3">
                <div className="text-white/80 text-sm">
                  {publicKey?.toString().slice(0, 4)}...{publicKey?.toString().slice(-4)}
                </div>
                <WalletMultiButton className="!bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 !text-white !border-none !rounded-lg !px-4 !py-2 !text-sm !font-medium transition-all duration-300" />
              </div>
            ) : (
              <WalletMultiButton className="btn-primary group relative overflow-hidden">
                <span className="relative z-10 flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  Connect Wallet
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </WalletMultiButton>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors duration-200"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 mt-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive 
                        ? 'text-white bg-white/20' 
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
              <div className="pt-2">
                {connected ? (
                  <div className="space-y-2">
                    <div className="text-white/80 text-sm text-center">
                      {publicKey?.toString().slice(0, 4)}...{publicKey?.toString().slice(-4)}
                    </div>
                    <WalletMultiButton className="!w-full !justify-center !bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 !text-white !border-none !rounded-lg !px-4 !py-2 !text-sm !font-medium" />
                  </div>
                ) : (
                  <WalletMultiButton className="btn-primary w-full justify-center">
                    <span className="flex items-center gap-2">
                      <Wallet className="w-4 h-4" />
                      Connect Wallet
                    </span>
                  </WalletMultiButton>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 