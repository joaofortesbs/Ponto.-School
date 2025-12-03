import React, { useState, useRef, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
  style?: React.CSSProperties;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  loading = 'lazy',
  priority = false,
  onLoad,
  onError,
  fallbackSrc,
  style,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    if (fallbackSrc && imgRef.current) {
      imgRef.current.src = fallbackSrc;
    }
    onError?.();
  };

  const webpSrc = src.replace(/\.(png|jpg|jpeg)$/i, '.webp');
  const isWebpAvailable = src !== webpSrc;

  useEffect(() => {
    if (priority && imgRef.current) {
      imgRef.current.loading = 'eager';
    }
  }, [priority]);

  const imgProps = {
    ref: imgRef,
    src: isWebpAvailable ? webpSrc : src,
    alt,
    width,
    height,
    loading: priority ? 'eager' : loading,
    className: `${className} ${!isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`,
    onLoad: handleLoad,
    onError: handleError,
    decoding: 'async' as const,
    style: {
      ...style,
      aspectRatio: width && height ? `${width}/${height}` : undefined,
    },
  };

  if (isWebpAvailable) {
    return (
      <picture>
        <source srcSet={webpSrc} type="image/webp" />
        <source srcSet={src} type={src.endsWith('.png') ? 'image/png' : 'image/jpeg'} />
        <img {...imgProps} src={src} />
      </picture>
    );
  }

  return <img {...imgProps} />;
};

export default OptimizedImage;
