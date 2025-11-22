
import React, { useState } from 'react';

interface ImageRendererProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

const ImageRenderer: React.FC<ImageRendererProps> = ({ className, src, alt, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-[#1a1a24] ${className}`}>
      {/* Placeholder / Skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 animate-pulse">
        </div>
      )}

      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-500 ease-in-out ${
            isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setIsLoaded(true)}
        draggable={false}
        {...props}
      />
    </div>
  );
};

export default ImageRenderer;
