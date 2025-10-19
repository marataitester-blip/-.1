
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'medium' }) => {
  const sizeClasses = {
    small: 'h-6 w-6 border-b-2',
    medium: 'h-12 w-12 border-b-2',
  };

  return (
    <div className="flex justify-center items-center">
      <div className={`animate-spin rounded-full border-yellow-400 ${sizeClasses[size]}`}></div>
    </div>
  );
};

export default LoadingSpinner;