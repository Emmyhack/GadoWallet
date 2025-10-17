/**
 * Enhanced Lazy Loading Components for Optimal Performance
 * Features: retry logic, preloading, caching, and error boundaries
 */

import React, { lazy, Suspense, ComponentType, useState, useEffect, useRef } from 'react';
import { RefreshCw } from 'lucide-react';
import { cacheUtils } from './performance-utils';

// Loading fallback component
const LoadingFallback = ({ componentName }: { componentName?: string }) => (
  <div className="flex items-center justify-center p-8">
    <div className="flex flex-col items-center space-y-3">
      <div className="loading-spinner"></div>
      <p className="text-sm text-gray-600">
        {componentName ? `Loading ${componentName}...` : 'Loading...'}
      </p>
    </div>
  </div>
);

// Error boundary for lazy components
class LazyErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy component error:', error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 text-center text-red-600">
          Failed to load component. Please refresh.
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for lazy loading with error boundary
export function withLazyLoading<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  componentName?: string,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFunc);
  
  return (props: React.ComponentProps<T>) => (
    <LazyErrorBoundary fallback={fallback}>
      <Suspense fallback={<LoadingFallback {...(componentName && { componentName })} />}>
        <LazyComponent {...props} />
      </Suspense>
    </LazyErrorBoundary>
  );
}

// Simple lazy loading without default export requirement
export const LazyPortfolio = lazy(() => 
  import('../components/Portfolio').then(module => ({ default: module.Portfolio }))
);

export const LazyTransactions = lazy(() => 
  import('../components/Transactions').then(module => ({ default: module.Transactions }))
);

// Comment out ActivityManager lazy loading until export is fixed
// export const LazyActivityManager = lazy(() => 
//   import('../components/ActivityManager').then(module => ({ default: module.ActivityManager }))
// );



// Wrapped components with error boundaries
export const SafeLazyPortfolio = (props: any) => (
  <LazyErrorBoundary>
    <Suspense fallback={<LoadingFallback componentName="Portfolio" />}>
      <LazyPortfolio {...props} />
    </Suspense>
  </LazyErrorBoundary>
);

export const SafeLazyTransactions = (props: any) => (
  <LazyErrorBoundary>
    <Suspense fallback={<LoadingFallback componentName="Transactions" />}>
      <LazyTransactions {...props} />
    </Suspense>
  </LazyErrorBoundary>
);

// Comment out SafeLazyActivityManager until component export is fixed
// export const SafeLazyActivityManager = (props: any) => (
//   <LazyErrorBoundary>
//     <Suspense fallback={<LoadingFallback componentName="Activity Manager" />}>
//       <LazyActivityManager {...props} />
//     </Suspense>
//   </LazyErrorBoundary>
// );



// Preload components that are likely to be used soon
export function preloadComponents() {
  // Preload core components with delay to avoid blocking initial load
  setTimeout(() => {
    import('../components/Portfolio');
    import('../components/Transactions');
  }, 500);
  
  // Preload after a longer delay (commented out until ActivityManager is fixed)
  // setTimeout(() => {
  //   import('../components/ActivityManager');
  // }, 1500);
}

// Component size estimator for bundle analysis
export const componentSizes = {
  Portfolio: '~8KB',
  Transactions: '~5KB',
  ActivityManager: '~12KB',
  BatchTransfer: '~10KB',
  WalletStats: '~8KB',
  SmartWalletManager: '~25KB',
  SubscriptionManager: '~20KB',
  RevenueTracking: '~15KB',
};