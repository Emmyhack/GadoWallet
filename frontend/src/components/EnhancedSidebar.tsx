import React, { useState } from 'react';
import { 
  Shield, Send, Clock, Gift, BarChart3, Wallet, Activity as ActivityIcon, 
  Sparkles, TrendingUp, Zap, Crown, Bot, CreditCard, Settings, 
  ChevronDown, Search, Bell, User, Menu, X
} from 'lucide-react';

interface TabGroup {
  name: string;
  tabs: Tab[];
  icon: React.ReactNode;
  color: string;
}

interface Tab {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  badge?: string;
  premium?: boolean;
}

interface EnhancedSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const EnhancedSidebar: React.FC<EnhancedSidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  isCollapsed, 
  setIsCollapsed 
}) => {
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['core', 'premium']);
  const [searchQuery, setSearchQuery] = useState('');

  const tabGroups: TabGroup[] = [
    {
      name: 'Core Features',
      icon: <Wallet className="w-5 h-5" />,
      color: 'from-blue-500 to-cyan-400',
      tabs: [
        {
          id: 'portfolio',
          name: 'Portfolio',
          icon: <Wallet className="w-5 h-5" />,
          description: 'View your assets and balances',
          color: 'from-blue-500 to-cyan-400'
        },
        {
          id: 'inheritance',
          name: 'Inheritance',
          icon: <Shield className="w-5 h-5" />,
          description: 'Manage inheritance settings',
          color: 'from-violet-500 to-purple-400'
        },
        {
          id: 'transfer',
          name: 'Batch Transfer',
          icon: <Send className="w-5 h-5" />,
          description: 'Send to multiple recipients',
          color: 'from-emerald-500 to-teal-400'
        },
        {
          id: 'send',
          name: 'Send & Receive',
          icon: <Send className="w-5 h-5" />,
          description: 'Transfer assets',
          color: 'from-green-500 to-emerald-400'
        },
        {
          id: 'receive',
          name: 'Receive',
          icon: <Wallet className="w-5 h-5" />,
          description: 'Receive payments',
          color: 'from-cyan-500 to-blue-400'
        }
      ]
    },
    {
      name: 'Premium Services',
      icon: <Crown className="w-5 h-5" />,
      color: 'from-purple-500 to-pink-400',
      tabs: [
        {
          id: 'subscription',
          name: 'Subscription',
          icon: <Crown className="w-5 h-5" />,
          description: 'Manage premium features',
          color: 'from-purple-500 to-pink-400',
          premium: true
        },
        {
          id: 'keeper-bot',
          name: 'Keeper Bot',
          icon: <Bot className="w-5 h-5" />,
          description: 'Automated monitoring',
          color: 'from-blue-500 to-indigo-400',
          badge: 'Premium',
          premium: true
        },
        {
          id: 'insurance',
          name: 'Insurance',
          icon: <Shield className="w-5 h-5" />,
          description: 'Smart contract protection',
          color: 'from-green-500 to-emerald-400',
          badge: 'Enterprise',
          premium: true
        }
      ]
    },
    {
      name: 'Activity & Analytics',
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'from-orange-500 to-red-400',
      tabs: [
        {
          id: 'activity',
          name: 'Activity',
          icon: <ActivityIcon className="w-5 h-5" />,
          description: 'Track your activities',
          color: 'from-amber-500 to-orange-400'
        },
        {
          id: 'txs',
          name: 'Transactions',
          icon: <Clock className="w-5 h-5" />,
          description: 'Transaction history',
          color: 'from-teal-500 to-cyan-400'
        },
        {
          id: 'stats',
          name: 'Wallet Stats',
          icon: <BarChart3 className="w-5 h-5" />,
          description: 'Portfolio analytics',
          color: 'from-indigo-500 to-blue-400'
        },
        {
          id: 'analytics',
          name: 'Analytics',
          icon: <TrendingUp className="w-5 h-5" />,
          description: 'Business intelligence',
          color: 'from-red-500 to-pink-400',
          badge: 'Admin'
        }
      ]
    },
    {
      name: 'Advanced Tools',
      icon: <Sparkles className="w-5 h-5" />,
      color: 'from-yellow-500 to-orange-400',
      tabs: [
        {
          id: 'claim',
          name: 'Claim Assets',
          icon: <Gift className="w-5 h-5" />,
          description: 'Claim inherited assets',
          color: 'from-pink-500 to-rose-400'
        },
        {
          id: 'sign',
          name: 'Sign Message',
          icon: <Shield className="w-5 h-5" />,
          description: 'Digital signatures',
          color: 'from-purple-500 to-violet-400'
        },
        {
          id: 'smart-wallet',
          name: 'Smart Wallet',
          icon: <Sparkles className="w-5 h-5" />,
          description: 'Advanced wallet features',
          color: 'from-yellow-500 to-amber-400'
        },
        {
          id: 'emergency',
          name: 'Emergency',
          icon: <Zap className="w-5 h-5" />,
          description: 'Emergency controls',
          color: 'from-orange-500 to-red-400'
        },
        {
          id: 'platform-status',
          name: 'Platform Status',
          icon: <Shield className="w-5 h-5" />,
          description: 'System monitoring',
          color: 'from-green-500 to-teal-400'
        }
      ]
    }
  ];

  const allTabs = tabGroups.flatMap(group => group.tabs);
  const filteredTabs = searchQuery 
    ? allTabs.filter(tab => 
        tab.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tab.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupName) 
        ? prev.filter(g => g !== groupName)
        : [...prev, groupName]
    );
  };

  const TabItem = ({ tab, isActive }: { tab: Tab; isActive: boolean }) => (
    <button
      onClick={() => setActiveTab(tab.id)}
      className={`w-full group flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-300 text-left relative overflow-hidden ${
        isActive
          ? 'bg-gradient-to-r from-blue-600/30 via-purple-600/30 to-cyan-600/30 border border-blue-400/30 text-white shadow-lg'
          : 'text-gray-300 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10'
      }`}
    >
      {isActive && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 via-purple-400 to-cyan-400 rounded-r-full"></div>
      )}
      
      <div className={`relative p-2.5 rounded-lg transition-all duration-300 ${
        isActive 
          ? `bg-gradient-to-br ${tab.color} text-white shadow-lg` 
          : 'bg-white/5 text-gray-300 group-hover:bg-white/10'
      }`}>
        {tab.icon}
        {isActive && (
          <div className="absolute inset-0 bg-white/20 rounded-lg animate-pulse"></div>
        )}
      </div>
      
      {!isCollapsed && (
        <div className="flex-1 min-w-0">
          <div className={`font-medium truncate flex items-center space-x-2 ${
            isActive ? 'text-white' : 'text-gray-200'
          }`}>
            <span>{tab.name}</span>
            {tab.badge && (
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold">
                {tab.badge}
              </span>
            )}
            {tab.premium && (
              <Crown className="w-3 h-3 text-yellow-400" />
            )}
          </div>
          <div className={`text-xs truncate transition-all duration-300 ${
            isActive ? 'text-blue-200' : 'text-gray-400 group-hover:text-gray-300'
          }`}>
            {tab.description}
          </div>
        </div>
      )}
      
      {isActive && !isCollapsed && (
        <div className="flex items-center space-x-1">
          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
          <div className="w-1 h-1 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-0.5 h-0.5 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      )}
    </button>
  );

  return (
    <div className={`bg-white/3 backdrop-blur-xl border-r border-white/10 transition-all duration-300 ${
      isCollapsed ? 'w-20' : 'w-80'
    } flex flex-col h-full overflow-hidden`}>
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-white text-lg">GadaWallet</h2>
                <p className="text-xs text-gray-400">Digital Inheritance</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
          >
            {isCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </button>
        </div>

        {/* Search Bar */}
        {!isCollapsed && (
          <div className="mt-4 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search features..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400/50 focus:bg-white/10 transition-all"
            />
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {searchQuery ? (
          /* Search Results */
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">
              Search Results ({filteredTabs.length})
            </h3>
            {filteredTabs.map((tab) => (
              <TabItem key={tab.id} tab={tab} isActive={activeTab === tab.id} />
            ))}
            {filteredTabs.length === 0 && (
              <div className="text-center py-8">
                <Search className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No features found</p>
              </div>
            )}
          </div>
        ) : (
          /* Grouped Navigation */
          tabGroups.map((group) => {
            const isExpanded = expandedGroups.includes(group.name.toLowerCase().replace(' ', ''));
            
            return (
              <div key={group.name}>
                {/* Group Header */}
                <button
                  onClick={() => toggleGroup(group.name.toLowerCase().replace(' ', ''))}
                  className="w-full flex items-center justify-between mb-3 group"
                  disabled={isCollapsed}
                >
                  <div className="flex items-center space-x-2">
                    <div className={`p-1.5 rounded-lg bg-gradient-to-br ${group.color}`}>
                      {group.icon}
                    </div>
                    {!isCollapsed && (
                      <span className="font-semibold text-white text-sm group-hover:text-blue-300 transition-colors">
                        {group.name}
                      </span>
                    )}
                  </div>
                  {!isCollapsed && (
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                      isExpanded ? 'rotate-180' : ''
                    }`} />
                  )}
                </button>

                {/* Group Tabs */}
                {(isExpanded || isCollapsed) && (
                  <div className="space-y-1 mb-4">
                    {group.tabs.map((tab) => (
                      <TabItem key={tab.id} tab={tab} isActive={activeTab === tab.id} />
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        {!isCollapsed ? (
          <div className="space-y-2">
            <div className="flex items-center space-x-3 px-3 py-2 bg-white/5 rounded-lg border border-white/10">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <Shield className="w-3 h-3 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-white">Secure</div>
                <div className="text-xs text-gray-400">Blockchain Protected</div>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="flex-1 p-2 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-colors">
                <Settings className="w-4 h-4 mx-auto" />
              </button>
              <button className="flex-1 p-2 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-colors">
                <Bell className="w-4 h-4 mx-auto" />
              </button>
              <button className="flex-1 p-2 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-colors">
                <User className="w-4 h-4 mx-auto" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <button className="w-full p-2 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-colors">
              <Settings className="w-5 h-5 mx-auto" />
            </button>
            <button className="w-full p-2 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-colors">
              <Bell className="w-5 h-5 mx-auto" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedSidebar;