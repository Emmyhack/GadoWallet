import { 
  Shield, 
  Send, 
  Gift, 
  BarChart3, 
  Wallet, 
  Bell, 
  Crown, 
  Users, 
  Clock, 
  CheckCircle2, 
  Star, 
  Zap, 
  Lock, 
  RefreshCw,
  TrendingUp,
  Award,
  ArrowRight,
  Play,
  Eye,
  Settings,
  Building2,
  Headphones
} from 'lucide-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useTranslation } from 'react-i18next';
import Logo from './Logo';

export function Landing() {
  const { t } = useTranslation();
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Animated CSS Grid Network Pattern */}
        <div 
          className="absolute inset-0 opacity-20 animate-[pulse_4s_ease-in-out_infinite]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.4) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.4) 1px, transparent 1px),
              linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: `100px 100px, 100px 100px, 20px 20px, 20px 20px`,
            backgroundPosition: `-2px -2px, -2px -2px, -1px -1px, -1px -1px`,
            animation: 'gridMove 20s linear infinite'
          }}
        />
        
        {/* Floating Geometric Shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-4 h-4 border-2 border-blue-400 rotate-45 animate-[spin_8s_linear_infinite] opacity-40"></div>
          <div className="absolute top-1/3 right-1/4 w-6 h-6 border-2 border-purple-400 animate-[spin_12s_linear_infinite_reverse] opacity-30"></div>
          <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-cyan-400 transform rotate-45 animate-[bounce_3s_ease-in-out_infinite] opacity-50"></div>
          <div className="absolute top-2/3 right-1/3 w-5 h-5 border border-violet-400 rounded-full animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite] opacity-60"></div>
        </div>
        
        {/* Enhanced Animated Network Nodes */}
        <div className="absolute inset-0">
          {/* Larger glowing nodes with enhanced animations */}
          <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-blue-400 rounded-full animate-[glow_3s_ease-in-out_infinite_alternate] opacity-70 shadow-lg shadow-blue-400/50"></div>
          <div className="absolute top-1/3 left-1/2 w-4 h-4 bg-purple-400 rounded-full animate-[glow_3s_ease-in-out_infinite_alternate] opacity-60 shadow-lg shadow-purple-400/50" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute top-1/2 left-3/4 w-3 h-3 bg-cyan-400 rounded-full animate-[glow_3s_ease-in-out_infinite_alternate] opacity-80 shadow-lg shadow-cyan-400/50" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-2/3 left-1/3 w-4 h-4 bg-violet-400 rounded-full animate-[glow_3s_ease-in-out_infinite_alternate] opacity-60 shadow-lg shadow-violet-400/50" style={{ animationDelay: '1.5s' }}></div>
          <div className="absolute top-3/4 left-2/3 w-3 h-3 bg-blue-500 rounded-full animate-[glow_3s_ease-in-out_infinite_alternate] opacity-70 shadow-lg shadow-blue-500/50" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/5 right-1/4 w-3 h-3 bg-purple-500 rounded-full animate-[glow_3s_ease-in-out_infinite_alternate] opacity-60 shadow-lg shadow-purple-500/50" style={{ animationDelay: '2.5s' }}></div>
          <div className="absolute top-2/5 right-1/3 w-4 h-4 bg-cyan-500 rounded-full animate-[glow_3s_ease-in-out_infinite_alternate] opacity-70 shadow-lg shadow-cyan-500/50" style={{ animationDelay: '3s' }}></div>
          <div className="absolute bottom-1/4 left-1/5 w-3 h-3 bg-indigo-400 rounded-full animate-[glow_3s_ease-in-out_infinite_alternate] opacity-80 shadow-lg shadow-indigo-400/50" style={{ animationDelay: '0.8s' }}></div>
          <div className="absolute bottom-1/3 right-1/5 w-3 h-3 bg-blue-300 rounded-full animate-[glow_3s_ease-in-out_infinite_alternate] opacity-60 shadow-lg shadow-blue-300/50" style={{ animationDelay: '1.2s' }}></div>
          
          {/* Animated Connection Lines */}
          <div className="absolute top-1/4 left-1/4 w-48 h-0.5 bg-gradient-to-r from-blue-400 via-blue-300 to-transparent opacity-40 transform rotate-12 animate-[fadeInOut_4s_ease-in-out_infinite]" style={{ animationDelay: '0.3s' }}></div>
          <div className="absolute top-1/3 left-1/2 w-32 h-0.5 bg-gradient-to-r from-purple-400 via-purple-300 to-transparent opacity-35 transform -rotate-45 animate-[fadeInOut_4s_ease-in-out_infinite]" style={{ animationDelay: '0.8s' }}></div>
          <div className="absolute top-2/3 left-1/3 w-40 h-0.5 bg-gradient-to-r from-violet-400 via-violet-300 to-transparent opacity-40 transform rotate-45 animate-[fadeInOut_4s_ease-in-out_infinite]" style={{ animationDelay: '1.3s' }}></div>
          <div className="absolute bottom-1/4 left-1/5 w-56 h-0.5 bg-gradient-to-r from-indigo-400 via-indigo-300 to-transparent opacity-35 transform -rotate-12 animate-[fadeInOut_4s_ease-in-out_infinite]" style={{ animationDelay: '1.8s' }}></div>
          <div className="absolute top-1/5 right-1/4 w-44 h-0.5 bg-gradient-to-r from-cyan-400 via-cyan-300 to-transparent opacity-40 transform rotate-25 animate-[fadeInOut_4s_ease-in-out_infinite]" style={{ animationDelay: '2.3s' }}></div>
        </div>
        
        {/* Enhanced Floating Orbs with Movement */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-gradient-to-br from-violet-600 via-fuchsia-600 to-rose-600 opacity-25 blur-3xl animate-[float_8s_ease-in-out_infinite]" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-600 opacity-25 blur-3xl animate-[float_10s_ease-in-out_infinite_reverse]" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-gradient-to-br from-emerald-600 via-teal-600 to-blue-600 opacity-15 blur-3xl animate-[float_12s_ease-in-out_infinite]" style={{ animationDelay: '2s' }} />
        
        {/* Additional Moving Orbs */}
        <div className="absolute top-1/6 left-3/4 w-64 h-64 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 opacity-20 blur-3xl animate-[float_9s_ease-in-out_infinite]" style={{ animationDelay: '3s' }} />
        <div className="absolute bottom-1/6 right-3/4 w-48 h-48 rounded-full bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 opacity-15 blur-3xl animate-[float_11s_ease-in-out_infinite_reverse]" style={{ animationDelay: '4s' }} />
        
        {/* Subtle Moving Particles */}
        <div className="absolute inset-0">
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-30 animate-[particle_15s_linear_infinite]"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${10 + Math.random() * 10}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Custom CSS Animations */}
      <style>{`
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 10px currentColor; transform: scale(1); }
          50% { box-shadow: 0 0 20px currentColor, 0 0 30px currentColor; transform: scale(1.1); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          25% { transform: translateY(-20px) translateX(10px) rotate(2deg); }
          50% { transform: translateY(0px) translateX(-10px) rotate(-1deg); }
          75% { transform: translateY(10px) translateX(5px) rotate(1deg); }
        }
        
        @keyframes fadeInOut {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.6; }
        }
        
        @keyframes gridMove {
          0% { background-position: 0px 0px, 0px 0px, 0px 0px, 0px 0px; }
          100% { background-position: 100px 100px, 100px 100px, 20px 20px, 20px 20px; }
        }
        
        @keyframes particle {
          0% { opacity: 0; transform: translateY(0px) translateX(0px); }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { opacity: 0; transform: translateY(-100vh) translateX(50px); }
        }
        
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes shimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 1s ease-out forwards;
        }
        
        .animate-shimmer {
          background-size: 200% 200%;
          animation: shimmer 3s ease-in-out infinite;
        }
        
        @keyframes swing {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(5deg); }
          75% { transform: rotate(-5deg); }
        }
        
        .animate-swing {
          animation: swing 1s ease-in-out;
        }
        
        /* Responsive animation adjustments */
        @media (prefers-reduced-motion: reduce) {
          .animate-glow, .animate-float, .animate-fadeInOut, .animate-particle {
            animation: none;
          }
        }
      `}</style>

      {/* Navigation Header */}
      <header className="relative z-50 bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Logo size="md" />
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Gada Wallet
                </h1>
              </div>
            </div>
            <WalletMultiButton className="!bg-gradient-to-r !from-blue-600 !to-purple-600 hover:!from-blue-700 hover:!to-purple-700 !border-none !rounded-xl !px-6 !py-3 !font-semibold !transition-all !duration-300 transform hover:!scale-105" />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative container mx-auto px-4 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-full px-3 py-2 mb-6 text-center hover:scale-105 transition-transform duration-300">
              <Crown className="w-4 h-4 text-yellow-400 animate-spin" />
              <span className="text-xs sm:text-sm font-medium text-purple-200">Next-Gen Smart Wallet with Premium Features</span>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse ml-2"></div>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent mb-6 px-4">
              Your Complete Web3
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                Inheritance Ecosystem
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed px-4">
              Create smart wallets with unique addresses, manage inheritance with premium features, 
              and receive real-time notifications for every transaction. Your legacy, secured on-chain.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 px-4">
              <WalletMultiButton className="w-full sm:w-auto bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:from-purple-700 hover:via-pink-700 hover:to-cyan-700 text-white font-bold py-4 px-6 sm:px-8 rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-200 text-center" />
              <a 
                href="#features" 
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all duration-200 font-semibold"
              >
                <Play className="w-5 h-5" />
                Explore Features
              </a>
            </div>



            {/* Enhanced Feature Preview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              <div className="group bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 hover:border-blue-400/40 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 hover:shadow-xl hover:shadow-blue-400/20">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300 group-hover:rotate-3">
                  <Wallet className="w-6 h-6 group-hover:animate-bounce" />
                </div>
                <h3 className="font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">Smart Wallet</h3>
                <p className="text-sm text-gray-300 group-hover:text-gray-200 transition-colors">Unique address for receiving funds directly</p>
                <div className="mt-3 w-0 group-hover:w-full h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"></div>
              </div>
              
              <div className="group bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 hover:border-purple-400/40 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 hover:shadow-xl hover:shadow-purple-400/20">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300 group-hover:rotate-3">
                  <Bell className="w-6 h-6 group-hover:animate-swing" />
                </div>
                <h3 className="font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">Live Notifications</h3>
                <p className="text-sm text-gray-300 group-hover:text-gray-200 transition-colors">Real-time alerts for every transaction</p>
                <div className="mt-3 w-0 group-hover:w-full h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"></div>
              </div>
              
              <div className="group bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 hover:border-emerald-400/40 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 hover:shadow-xl hover:shadow-emerald-400/20">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300 group-hover:rotate-3">
                  <Users className="w-6 h-6 group-hover:animate-pulse" />
                </div>
                <h3 className="font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">Multi-Heir Support</h3>
                <p className="text-sm text-gray-300 group-hover:text-gray-200 transition-colors">Up to 10 heirs with premium features</p>
                <div className="mt-3 w-0 group-hover:w-full h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"></div>
              </div>
              
              <div className="group bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 hover:border-yellow-400/40 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 hover:shadow-xl hover:shadow-yellow-400/20">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 text-white flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300 group-hover:rotate-3">
                  <Crown className="w-6 h-6 group-hover:animate-spin" />
                </div>
                <h3 className="font-bold text-white mb-2 group-hover:text-yellow-300 transition-colors">Premium Upgrades</h3>
                <p className="text-sm text-gray-300 group-hover:text-gray-200 transition-colors">Modify inheritance settings anytime</p>
                <div className="mt-3 w-0 group-hover:w-full h-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-500"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Features Section */}
      <section id="features" className="relative container mx-auto px-4 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-6">
              Explore Advanced Features
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Discover the powerful capabilities that make Gado Wallet the most comprehensive inheritance solution on Solana
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Smart Wallet with Unique Address */}
            <div className="group bg-gradient-to-br from-blue-900/50 to-cyan-900/50 backdrop-blur-md border border-blue-500/30 rounded-2xl p-8 hover:border-blue-400/50 transition-all duration-300 transform hover:scale-105">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Wallet className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Smart Wallet with Unique Address</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Each Smart Wallet gets its own unique Solana address. Share it with others to receive SOL and SPL tokens directly into your inheritance-protected wallet.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-blue-300">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm">Unique wallet address generation</span>
                </div>
                <div className="flex items-center gap-2 text-blue-300">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm">Direct SOL & SPL token deposits</span>
                </div>
                <div className="flex items-center gap-2 text-blue-300">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm">Send funds from Smart Wallet</span>
                </div>
              </div>
            </div>

            {/* Real-time Notifications */}
            <div className="group bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-md border border-purple-500/30 rounded-2xl p-8 hover:border-purple-400/50 transition-all duration-300 transform hover:scale-105">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Bell className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Comprehensive Notifications</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Stay informed with real-time notifications for every Smart Wallet transaction. Never miss deposits, withdrawals, or inheritance activities.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-purple-300">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm">Real-time transaction alerts</span>
                </div>
                <div className="flex items-center gap-2 text-purple-300">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm">Complete transaction history</span>
                </div>
                <div className="flex items-center gap-2 text-purple-300">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm">Activity monitoring dashboard</span>
                </div>
              </div>
            </div>

            {/* Premium Tier System */}
            <div className="group bg-gradient-to-br from-yellow-900/50 to-orange-900/50 backdrop-blur-md border border-yellow-500/30 rounded-2xl p-8 hover:border-yellow-400/50 transition-all duration-300 transform hover:scale-105">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Crown className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Premium Upgrade System</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Start free and upgrade anytime! Modify inheritance settings, add more heirs, and customize inactivity periods with premium features.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-yellow-300">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm">Free: 1 heir, 365-day period</span>
                </div>
                <div className="flex items-center gap-2 text-yellow-300">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm">Premium: Up to 10 heirs</span>
                </div>
                <div className="flex items-center gap-2 text-yellow-300">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm">Custom inactivity periods</span>
                </div>
              </div>
            </div>

            {/* Multi-Heir Management */}
            <div className="group bg-gradient-to-br from-emerald-900/50 to-teal-900/50 backdrop-blur-md border border-emerald-500/30 rounded-2xl p-8 hover:border-emerald-400/50 transition-all duration-300 transform hover:scale-105">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Advanced Heir Management</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Configure multiple heirs with precise percentage allocations. Premium users can add, remove, and modify heir settings after wallet creation.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-emerald-300">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm">Percentage-based inheritance</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-300">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm">Add/modify heirs anytime</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-300">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm">Secure heir validation</span>
                </div>
              </div>
            </div>

            {/* Activity Monitoring */}
            <div className="group bg-gradient-to-br from-indigo-900/50 to-blue-900/50 backdrop-blur-md border border-indigo-500/30 rounded-2xl p-8 hover:border-indigo-400/50 transition-all duration-300 transform hover:scale-105">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500 text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Smart Activity Tracking</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Automated activity monitoring prevents premature inheritance claims. Stay active to protect your assets with one-click activity updates.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-indigo-300">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm">Automated activity detection</span>
                </div>
                <div className="flex items-center gap-2 text-indigo-300">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm">One-click activity updates</span>
                </div>
                <div className="flex items-center gap-2 text-indigo-300">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm">Customizable time periods</span>
                </div>
              </div>
            </div>

            {/* Batch Operations */}
            <div className="group bg-gradient-to-br from-rose-900/50 to-pink-900/50 backdrop-blur-md border border-rose-500/30 rounded-2xl p-8 hover:border-rose-400/50 transition-all duration-300 transform hover:scale-105">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Batch Transfer Operations</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Efficiently manage multiple transactions with batch transfer capabilities. Send to multiple recipients in a single transaction to save on fees.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-rose-300">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm">Multiple recipient support</span>
                </div>
                <div className="flex items-center gap-2 text-rose-300">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm">Reduced transaction fees</span>
                </div>
                <div className="flex items-center gap-2 text-rose-300">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm">Efficient bulk operations</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Gado Section */}
      <section id="why-gado" className="relative container mx-auto px-4 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-6">
              Why Choose Gado Wallet?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              The most comprehensive Web3 inheritance solution with cutting-edge features and unmatched security
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            {/* Left side - Benefits */}
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center flex-shrink-0">
                  <Star className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Complete Inheritance Ecosystem</h3>
                  <p className="text-gray-300">Unlike simple wallet inheritance, Gado provides a complete ecosystem with unique wallet addresses, premium upgrade capabilities, and comprehensive transaction monitoring.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 text-white flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Start Free, Upgrade Anytime</h3>
                  <p className="text-gray-300">Create your Smart Wallet for free with 1 heir and 365-day period. Upgrade to Premium anytime to unlock advanced features and modify existing settings.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center flex-shrink-0">
                  <Bell className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Real-Time Intelligence</h3>
                  <p className="text-gray-300">Get instant notifications for every transaction, real-time balance monitoring, and comprehensive activity tracking with our intelligent notification system.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 text-white flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Advanced Heir Management</h3>
                  <p className="text-gray-300">Premium users can manage up to 10 heirs with precise percentage allocations, add new heirs, modify existing allocations, and customize inactivity periods.</p>
                </div>
              </div>
            </div>

            {/* Right side - Comparison */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-3xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">Gado vs Traditional Solutions</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-white font-medium">Unique Smart Wallet addresses</span>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-white font-medium">Real-time transaction notifications</span>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-white font-medium">Premium upgrade system</span>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-white font-medium">Modify inheritance post-creation</span>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-white font-medium">Up to 10 heirs (Premium)</span>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-white font-medium">Batch transfer operations</span>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-slate-700">
                <p className="text-center text-gray-300 text-sm">
                  Traditional inheritance solutions lack these advanced features
                </p>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white mb-8">How It Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center text-2xl font-bold mb-4">
                  1
                </div>
                <h4 className="text-xl font-semibold text-white mb-2">Connect & Create</h4>
                <p className="text-gray-300 text-center">Connect your wallet and create a Smart Wallet with unique address for free</p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 text-white flex items-center justify-center text-2xl font-bold mb-4">
                  2
                </div>
                <h4 className="text-xl font-semibold text-white mb-2">Configure & Upgrade</h4>
                <p className="text-gray-300 text-center">Set up heirs and upgrade to Premium anytime for advanced features</p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center text-2xl font-bold mb-4">
                  3
                </div>
                <h4 className="text-xl font-semibold text-white mb-2">Stay Active & Monitor</h4>
                <p className="text-gray-300 text-center">Receive notifications, stay active, and let your heirs inherit when needed</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Wallet Security Section */}
      <section id="security" className="relative container mx-auto px-4 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent mb-6">
              Enterprise-Grade Security
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Your assets are protected by military-grade security protocols and immutable smart contracts on the Solana blockchain
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {/* Security Features */}
            <div className="bg-gradient-to-br from-emerald-900/30 to-teal-900/30 backdrop-blur-md border border-emerald-500/30 rounded-3xl p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center">
                  <Lock className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Unbreakable Security</h3>
                  <p className="text-gray-300">Your keys, your control</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <Shield className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-2">Private Key Protection</h4>
                    <p className="text-gray-300 text-sm">Your private keys never leave your wallet. All transactions require your explicit signature approval.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <RefreshCw className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-2">On-Chain Activity Updates</h4>
                    <p className="text-gray-300 text-sm">All activity updates are recorded immutably on-chain, preventing premature inheritance claims.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <Eye className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-2">Transparent Operations</h4>
                    <p className="text-gray-300 text-sm">All smart contract operations are fully auditable and transparent on the Solana blockchain.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Smart Contract Security */}
            <div className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 backdrop-blur-md border border-blue-500/30 rounded-3xl p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center">
                  <Settings className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Smart Contract Reliability</h3>
                  <p className="text-gray-300">Immutable & audited code</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-2">Immutable Smart Contracts</h4>
                    <p className="text-gray-300 text-sm">Once deployed, inheritance rules cannot be altered by anyone except authorized premium upgrades.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <Award className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-2">Inheritance Status Verification</h4>
                    <p className="text-gray-300 text-sm">Built-in verification system ensures only legitimate heirs can claim assets after inactivity period.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-2">Continuous Monitoring</h4>
                    <p className="text-gray-300 text-sm">Real-time monitoring of wallet activity ensures accurate inheritance timing and prevents false claims.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">100%</div>
              <div className="text-gray-300 text-sm">Private Key Control</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-2">0</div>
              <div className="text-gray-300 text-sm">Security Breaches</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">∞</div>
              <div className="text-gray-300 text-sm">Immutable Records</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">24/7</div>
              <div className="text-gray-300 text-sm">Blockchain Protection</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative container mx-auto px-4 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent mb-6">
              Choose Your Plan
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Start free and upgrade when you need more advanced inheritance features
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Free Plan */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-3xl p-8 relative">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">Free Plan</h3>
                <div className="text-4xl font-bold text-white mb-4">$0<span className="text-lg text-gray-400">/forever</span></div>
                <p className="text-gray-300">Perfect for getting started with Smart Wallet inheritance</p>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-gray-300">1 Heir designation</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-gray-300">365-day inactivity period</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-gray-300">Unique Smart Wallet address</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-gray-300">Send & receive SOL/SPL tokens</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-gray-300">Real-time notifications</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-gray-300">Activity monitoring</span>
                </div>
              </div>
              
              <button className="w-full py-4 bg-gradient-to-r from-slate-600 to-slate-700 text-white font-bold rounded-xl hover:from-slate-700 hover:to-slate-800 transition-all duration-200">
                Get Started Free
              </button>
            </div>

            {/* Premium Plan */}
            <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-md border border-purple-500/50 rounded-3xl p-8 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-bold">
                  POPULAR
                </div>
              </div>
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">Premium Plan</h3>
                <div className="text-4xl font-bold text-white mb-4">$9.99<span className="text-lg text-gray-400">/month</span></div>
                <p className="text-gray-300">Advanced features for comprehensive inheritance management</p>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <span className="text-gray-300">Up to 10 Heirs</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <span className="text-gray-300">Custom inactivity periods</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <span className="text-gray-300">Modify settings after creation</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <span className="text-gray-300">Add/remove heirs anytime</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <span className="text-gray-300">Edit heir allocations</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <span className="text-gray-300">Priority support</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <span className="text-gray-300">All Free features included</span>
                </div>
              </div>
              
              <button className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200">
                Upgrade to Premium
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-gradient-to-br from-amber-900/50 to-orange-900/50 backdrop-blur-md border border-amber-500/50 rounded-3xl p-8 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-4 py-2 rounded-full text-sm font-bold">
                  ENTERPRISE
                </div>
              </div>
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">Enterprise Plan</h3>
                <div className="text-4xl font-bold text-white mb-4">$99<span className="text-lg text-gray-400">/month</span></div>
                <p className="text-gray-300">Complete solution for businesses and organizations</p>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <span className="text-gray-300">Unlimited Heirs & Wallets</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <span className="text-gray-300">Multi-signature requirements</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <span className="text-gray-300">Advanced compliance tools</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <span className="text-gray-300">Custom API integration</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <span className="text-gray-300">Dedicated account manager</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <span className="text-gray-300">White-label solutions</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <span className="text-gray-300">24/7 premium support</span>
                </div>
              </div>
              
              <button className="w-full py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all duration-200">
                Contact Sales
              </button>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <p className="text-gray-400">
              ✨ You can upgrade from Free to Premium or Enterprise anytime and modify your existing Smart Wallet settings
            </p>
            <p className="text-gray-400 mt-2 text-sm">
              Enterprise customers get dedicated support and custom integrations
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="relative container mx-auto px-4 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent mb-6">
              Trusted by the Community
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Join thousands of users who trust Gado Wallet to secure their digital legacy
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="group text-center transform hover:scale-105 transition-all duration-300">
              <div className="relative">
                <div className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2 group-hover:animate-pulse">2,500+</div>
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg blur opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
              </div>
              <div className="text-gray-300 group-hover:text-white transition-colors">Smart Wallets Created</div>
              <div className="w-12 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 mx-auto mt-2 transform scale-0 group-hover:scale-100 transition-transform duration-300"></div>
            </div>
            
            <div className="group text-center transform hover:scale-105 transition-all duration-300">
              <div className="relative">
                <div className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2 group-hover:animate-pulse">12,000+</div>
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-lg blur opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
              </div>
              <div className="text-gray-300 group-hover:text-white transition-colors">Heirs Designated</div>
              <div className="w-12 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-400 mx-auto mt-2 transform scale-0 group-hover:scale-100 transition-transform duration-300"></div>
            </div>
            
            <div className="group text-center transform hover:scale-105 transition-all duration-300">
              <div className="relative">
                <div className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2 group-hover:animate-pulse">$150M+</div>
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-lg blur opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
              </div>
              <div className="text-gray-300 group-hover:text-white transition-colors">Assets Protected</div>
              <div className="w-12 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400 mx-auto mt-2 transform scale-0 group-hover:scale-100 transition-transform duration-300"></div>
            </div>
            
            <div className="group text-center transform hover:scale-105 transition-all duration-300">
              <div className="relative">
                <div className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-2 group-hover:animate-pulse">99.99%</div>
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg blur opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
              </div>
              <div className="text-gray-300 group-hover:text-white transition-colors">Uptime Reliability</div>
              <div className="w-12 h-0.5 bg-gradient-to-r from-yellow-400 to-orange-400 mx-auto mt-2 transform scale-0 group-hover:scale-100 transition-transform duration-300"></div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="relative container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-300">
              Everything you need to know about Gado Wallet
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-3">How does the Smart Wallet address work?</h3>
              <p className="text-gray-300">Each Smart Wallet gets a unique Solana address that you can share with others. People can send SOL and SPL tokens directly to this address, and the funds are automatically protected by your inheritance rules.</p>
            </div>

            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-3">Can I upgrade from Free to Premium anytime?</h3>
              <p className="text-gray-300">Yes! You can upgrade to Premium at any time, even after creating your Smart Wallet. Premium users can modify existing inheritance settings, add more heirs, and customize inactivity periods.</p>
            </div>

            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-3">When can heirs claim assets?</h3>
              <p className="text-gray-300">Heirs can claim assets after the inactivity period expires (365 days for free users, custom for premium). The timer resets every time you update your activity through the wallet interface.</p>
            </div>

            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-3">Which wallets are supported?</h3>
              <p className="text-gray-300">Gado Wallet supports all major Solana wallets including Phantom, Solflare, Backpack, and any wallet that supports the Solana Wallet Adapter standard.</p>
            </div>

            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-3">How secure are the smart contracts?</h3>
              <p className="text-gray-300">Our smart contracts are immutable and deployed on Solana's secure blockchain. Your private keys never leave your wallet, and all inheritance rules are enforced by the blockchain itself.</p>
            </div>

            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-3">Do I get notifications for all transactions?</h3>
              <p className="text-gray-300">Yes! Our comprehensive notification system tracks every Smart Wallet transaction including deposits, withdrawals, inheritance activities, and activity updates in real-time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 backdrop-blur-md border border-purple-500/30 rounded-3xl p-12">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent mb-6">
              Secure Your Digital Legacy Today
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of users who trust Gado Wallet to protect their assets and ensure their loved ones are taken care of.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <WalletMultiButton className="bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:from-purple-700 hover:via-pink-700 hover:to-cyan-700 text-white font-bold py-4 px-8 rounded-xl shadow-2xl transform hover:scale-110 transition-all duration-300 hover:shadow-purple-500/25" />
              <a 
                href="#features" 
                className="group/link inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl hover:bg-white/20 hover:border-white/40 transition-all duration-300 font-semibold hover:scale-105"
              >
                <ArrowRight className="w-5 h-5 group-hover/link:translate-x-1 transition-transform" />
                Learn More
              </a>
            </div>
            <p className="text-sm text-gray-400 mt-4">
              Start free • No credit card required • Upgrade anytime
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4">
                Gado Wallet
              </h3>
              <p className="text-gray-300 mb-4 max-w-md">
                The most comprehensive Web3 inheritance solution with Smart Wallet addresses, premium upgrades, and real-time notifications.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-green-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="solanaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#9945FF" />
                        <stop offset="50%" stopColor="#14F195" />
                        <stop offset="100%" stopColor="#00D4AA" />
                      </linearGradient>
                    </defs>
                    <path d="M64.5 200.8C67.1 198.2 70.7 196.8 74.4 196.8H350.4C356.4 196.8 359.4 204.2 355.1 208.5L335.5 228.1C332.9 230.7 329.3 232.1 325.6 232.1H49.6C43.6 232.1 40.6 224.7 44.9 220.4L64.5 200.8Z" fill="url(#solanaGradient)"/>
                    <path d="M64.5 67.9C67.2 65.3 70.8 63.9 74.4 63.9H350.4C356.4 63.9 359.4 71.3 355.1 75.6L335.5 95.2C332.9 97.8 329.3 99.2 325.6 99.2H49.6C43.6 99.2 40.6 91.8 44.9 87.5L64.5 67.9Z" fill="url(#solanaGradient)"/>
                    <path d="M335.5 132.7C332.9 130.1 329.3 128.7 325.6 128.7H49.6C43.6 128.7 40.6 136.1 44.9 140.4L64.5 160C67.1 162.6 70.7 164 74.4 164H350.4C356.4 164 359.4 156.6 355.1 152.3L335.5 132.7Z" fill="url(#solanaGradient)"/>
                  </svg>
                </div>
                <span className="text-sm text-gray-400">Secured by Solana Blockchain</span>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>Smart Wallet Addresses</li>
                <li>Premium Upgrades</li>
                <li>Real-time Notifications</li>
                <li>Multi-Heir Support</li>
                <li>Batch Transfers</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>Documentation</li>
                <li>FAQ</li>
                <li>Community</li>
                <li>Contact</li>
                <li>Security</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-sm text-gray-400">
                © {new Date().getFullYear()} Gado Wallet. All rights reserved.
              </div>
              <div className="flex items-center gap-6 mt-4 md:mt-0">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Security</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}