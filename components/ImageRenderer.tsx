
import React, { useState, useEffect, useRef } from 'react';

interface ImageRendererProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  priority?: boolean;
}

const ImageRenderer: React.FC<ImageRendererProps> = ({ className, src, alt, priority = false, ...props }) => {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Reset status when src changes
    setStatus('loading');
    
    const img = imgRef.current;
    if (img && img.complete) {
      if (img.naturalWidth === 0) {
        setStatus('error');
      } else {
        setStatus('loaded');
      }
    }
  }, [src]);

  const handleLoad = () => setStatus('loaded');
  const handleError = () => setStatus('error');

  return (
    <div className={`relative overflow-hidden bg-[var(--card-bg)] ${className}`}>
      {/* Shimmer Skeleton - Visible while loading */}
      <div 
        className={`absolute inset-0 z-10 bg-gradient-to-r from-[var(--card-bg)] via-[#c7a87b]/20 to-[var(--card-bg)] animate-shimmer transition-opacity duration-500 ${status === 'loading' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        style={{ backgroundSize: '200% 100%' }}
      />

      {/* Error State */}
      {status === 'error' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-2 text-[var(--muted)] bg-[var(--card-bg)] border border-red-900/30">
            <svg className="w-8 h-8 opacity-50 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span className="text-xs text-center">Failed to load</span>
        </div>
      )}

      {/* Image with Progressive Transition */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-all duration-700 ease-out transform will-change-transform ${
            status === 'loaded' ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-xl scale-105'
        }`}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        draggable={false}
        {...props}
      />
    </div>
  );
};

export default ImageRenderer;