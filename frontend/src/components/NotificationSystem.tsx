import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { getProgramId } from '../lib/config';
import { Bell, X, Check, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationSystemProps {}

const NotificationSystem: React.FC<NotificationSystemProps> = () => {
  const { publicKey } = useWallet();
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (publicKey && anchorWallet) {
      loadNotifications();
    }
  }, [publicKey, anchorWallet]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      
      if (!publicKey) {
        setNotifications([]);
        return;
      }

      // Fetch real notification accounts from the blockchain
      try {
        const notificationAccounts = await connection.getProgramAccounts(
          getProgramId(),
          {
            filters: [
              // Filter for notification accounts belonging to this user
              {
                memcmp: {
                  offset: 8, // Skip discriminator
                  bytes: publicKey.toBase58()
                }
              }
            ]
          }
        );

        const realNotifications: Notification[] = [];

        for (const account of notificationAccounts) {
          try {
            // Parse notification account data
            const data = account.account.data;
            
            // Skip discriminator (8 bytes) + user pubkey (32 bytes) + notification_type (1 byte)
            const messageStart = 8 + 32 + 1;
            const messageLength = new DataView(data.buffer).getUint32(messageStart, true);
            const messageBytes = data.slice(messageStart + 4, messageStart + 4 + messageLength);
            const message = new TextDecoder().decode(messageBytes);
            
            // Parse timestamp (i64)
            const timestampOffset = messageStart + 4 + messageLength;
            const timestamp = new DataView(data.buffer).getBigInt64(timestampOffset, true);
            
            // Parse is_read (bool)
            const isRead = data[timestampOffset + 8] === 1;
            
            // Parse notification type
            const notificationType = data[8 + 32];
            const typeMap = ['info', 'success', 'warning', 'error'];
            
            realNotifications.push({
              id: account.pubkey.toString(),
              type: typeMap[notificationType] as 'info' | 'success' | 'warning' | 'error' || 'info',
              message,
              timestamp: new Date(Number(timestamp) * 1000),
              read: isRead
            });
          } catch (parseError) {
            console.error('Error parsing notification account:', parseError);
          }
        }

        // Sort by timestamp (newest first)
        realNotifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setNotifications(realNotifications);

      } catch (fetchError) {
        console.error("Error fetching notifications from blockchain:", fetchError);
        // Set empty array if no notifications found
        setNotifications([]);
      }
      
    } catch (error) {
      console.error("Error loading notifications:", error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({
        ...notification,
        read: true
      }))
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'border-green-500/30 bg-green-500/10';
      case 'error':
        return 'border-red-500/30 bg-red-500/10';
      case 'warning':
        return 'border-yellow-500/30 bg-yellow-500/10';
      case 'info':
      default:
        return 'border-blue-500/30 bg-blue-500/10';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!publicKey) {
    return null;
  }

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 text-purple-200 hover:text-white hover:bg-white/10 rounded-lg transition-all"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {showPanel && (
        <div className="absolute right-0 top-12 w-96 max-h-96 bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/20">
            <h3 className="text-lg font-semibold text-white">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-purple-300 hover:text-purple-200 transition-colors"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setShowPanel(false)}
                className="p-1 text-purple-300 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400 mx-auto"></div>
                <p className="text-purple-300 text-sm mt-2">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-purple-400 mx-auto mb-3 opacity-50" />
                <p className="text-purple-300">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 transition-all hover:bg-white/5 ${
                      !notification.read ? 'bg-white/5' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-relaxed ${
                          !notification.read ? 'text-white' : 'text-purple-200'
                        }`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-purple-400 mt-1">
                          {formatTimestamp(notification.timestamp)}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-1 text-purple-400 hover:text-purple-300 rounded transition-colors"
                            title="Mark as read"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-1 text-purple-400 hover:text-red-400 rounded transition-colors"
                          title="Delete notification"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-white/20 bg-white/5">
              <button
                onClick={clearAllNotifications}
                className="w-full text-xs text-purple-300 hover:text-red-400 transition-colors"
              >
                Clear all notifications
              </button>
            </div>
          )}
        </div>
      )}

      {/* Backdrop */}
      {showPanel && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowPanel(false)}
        />
      )}
    </div>
  );
};

export default NotificationSystem;