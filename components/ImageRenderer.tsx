import React, { useState } from 'react';

interface ImageRendererProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

const ImageRenderer: React.FC<ImageRendererProps> = ({ className, src, alt, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`relative bg-purple-900/30 overflow-hidden ${className}`}>
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        {...props}
      />
    </div>
  );
};

export default ImageRenderer;