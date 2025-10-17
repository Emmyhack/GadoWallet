import React from 'react';
import { Shield } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showFallback?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8', 
  lg: 'w-12 h-12',
  xl: 'w-16 h-16'
};

const containerSizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12', 
  xl: 'w-16 h-16'
};

export function Logo({ size = 'md', showFallback = true, className = '' }: LogoProps) {
  const [logoError, setLogoError] = React.useState(false);

  const handleImageError = () => {
    setLogoError(true);
  };

  return (
    <div className={`relative ${className}`}>
      <div className={`flex items-center justify-center ${containerSizeClasses[size]} bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600 rounded-2xl shadow-2xl overflow-hidden`}>
        {!logoError ? (
          <img 
            src="/logo.png" 
            alt="Gado Wallet Logo" 
            className={`${sizeClasses[size]} object-contain`}
            onError={handleImageError}
          />
        ) : showFallback ? (
          <Shield className={`${sizeClasses[size === 'sm' ? 'sm' : size === 'xl' ? 'lg' : 'md']} text-white`} />
        ) : null}
      </div>
      {size !== 'sm' && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
      )}
    </div>
  );
}

export default Logo;