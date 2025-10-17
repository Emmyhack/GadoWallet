import React from 'react';
import { Zap, Gauge, Shield, AlertTriangle } from 'lucide-react';
import { useGatewayService, TransactionContext } from '../lib/gateway-service';
import { SubscriptionTier } from './SubscriptionManager';

interface GatewayIndicatorProps {
  context: Omit<TransactionContext, 'userTier'>;
  userTier?: SubscriptionTier;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

export function GatewayIndicator({ 
  context, 
  userTier = SubscriptionTier.FREE, 
  size = 'md',
  showDetails = false 
}: GatewayIndicatorProps) {
  const { shouldUseGateway } = useGatewayService();
  
  const willUseGateway = shouldUseGateway(context, userTier);
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };
  
  const iconSize = sizeClasses[size];
  
  if (willUseGateway) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Zap className={`${iconSize} text-yellow-400`} />
          {showDetails && (
            <span className="text-xs text-yellow-300 font-medium">Gateway</span>
          )}
        </div>
        {showDetails && (
          <div className="px-2 py-1 bg-yellow-500/10 border border-yellow-400/20 rounded text-xs text-yellow-300">
            Enhanced
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <Gauge className={`${iconSize} text-gray-400`} />
        {showDetails && (
          <span className="text-xs text-gray-400 font-medium">Standard</span>
        )}
      </div>
      {showDetails && (
        <div className="px-2 py-1 bg-gray-500/10 border border-gray-400/20 rounded text-xs text-gray-400">
          RPC
        </div>
      )}
    </div>
  );
}

interface GatewayBenefitsBadgeProps {
  userTier: SubscriptionTier;
  className?: string;
}

export function GatewayBenefitsBadge({ userTier, className = '' }: GatewayBenefitsBadgeProps) {
  const getBenefits = () => {
    switch (userTier) {
      case SubscriptionTier.ENTERPRISE:
        return {
          icon: Shield,
          text: 'All transactions via Gateway',
          color: 'text-purple-400',
          bg: 'bg-purple-500/10 border-purple-400/20'
        };
      case SubscriptionTier.PREMIUM:
        return {
          icon: Zap,
          text: 'High-value transactions via Gateway',
          color: 'text-yellow-400',
          bg: 'bg-yellow-500/10 border-yellow-400/20'
        };
      default:
        return {
          icon: AlertTriangle,
          text: 'Critical transactions only',
          color: 'text-blue-400',
          bg: 'bg-blue-500/10 border-blue-400/20'
        };
    }
  };
  
  const { icon: Icon, text, color, bg } = getBenefits();
  
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-2 border rounded-lg ${bg} ${className}`}>
      <Icon className={`w-4 h-4 ${color}`} />
      <span className={`text-sm font-medium ${color}`}>{text}</span>
    </div>
  );
}

export default GatewayIndicator;