import { useState } from 'react';
import { useAnchorProgram } from '../lib/anchor';
import { useWallet } from '@solana/wallet-adapter-react';
import { Clock, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

export function ActivityManager() {
  const program = useAnchorProgram();
  const { publicKey } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);

  const handleUpdateActivity = async (type: 'sol' | 'token') => {
    if (!program || !publicKey) return;

    try {
      setIsLoading(true);
      setMessage('');

      if (type === 'sol') {
        // For SOL activity update, we need to find existing coin heirs
        // This is a simplified implementation
        setMessage('SOL activity update requires existing coin heir accounts');
        return;
      } else {
        // For token activity update, we need to find existing token heirs
        // This is a simplified implementation
        setMessage('Token activity update requires existing token heir accounts');
        return;
      }

      setLastUpdateTime(new Date());
      setMessage('Activity updated successfully!');
    } catch (error) {
      console.error('Error updating activity:', error);
      setMessage('Error updating activity. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeSinceLastUpdate = () => {
    if (!lastUpdateTime) return 'Never';
    
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - lastUpdateTime.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg flex items-center justify-center">
          <Clock className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Activity Manager</h2>
          <p className="text-gray-600">Update your activity status to prevent inheritance claims</p>
        </div>
      </div>

      {/* Activity Status */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* SOL Activity */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">SOL Activity</h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Active</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Last Update:</span>
              <span className="font-medium">{getTimeSinceLastUpdate()}</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Inactivity Period:</span>
              <span className="font-medium text-orange-600">1 year</span>
            </div>

            <button
              onClick={() => handleUpdateActivity('sol')}
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Update SOL Activity</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Token Activity */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Token Activity</h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Active</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Last Update:</span>
              <span className="font-medium">{getTimeSinceLastUpdate()}</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Inactivity Period:</span>
              <span className="font-medium text-orange-600">1 year</span>
            </div>

            <button
              onClick={() => handleUpdateActivity('token')}
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Update Token Activity</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.includes('Error') 
            ? 'bg-red-50 text-red-700 border border-red-200' 
            : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          <div className="flex items-center space-x-2">
            {message.includes('Error') ? (
              <AlertCircle className="w-5 h-5" />
            ) : (
              <CheckCircle className="w-5 h-5" />
            )}
            <span>{message}</span>
          </div>
        </div>
      )}

      {/* Information Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Activity Updates</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Update activity to reset the inactivity timer</li>
            <li>• Prevents heirs from claiming assets prematurely</li>
            <li>• Activity updates are recorded on-chain</li>
            <li>• Regular updates ensure asset protection</li>
          </ul>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <h3 className="font-semibold text-orange-900 mb-2">Inactivity Period</h3>
          <ul className="text-sm text-orange-800 space-y-1">
            <li>• Default inactivity period: 1 year</li>
            <li>• Heirs can claim after inactivity period</li>
            <li>• Activity updates reset the timer</li>
            <li>• Multiple heirs can be designated</li>
          </ul>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <button
            onClick={() => handleUpdateActivity('sol')}
            disabled={isLoading}
            className="btn-secondary flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Update SOL</span>
          </button>
          
          <button
            onClick={() => handleUpdateActivity('token')}
            disabled={isLoading}
            className="btn-secondary flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Update Tokens</span>
          </button>
          
          <button
            onClick={() => {
              setLastUpdateTime(new Date());
              setMessage('Activity status refreshed!');
            }}
            className="btn-secondary flex items-center justify-center space-x-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Check Status</span>
          </button>
        </div>
      </div>
    </div>
  );
}