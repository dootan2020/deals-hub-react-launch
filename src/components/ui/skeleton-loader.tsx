
import React from 'react';

interface SkeletonLoaderProps {
  className?: string;
  count?: number;
  type?: 'card' | 'text' | 'circle' | 'rectangle';
  width?: string;
  height?: string;
}

const SkeletonLoader = ({
  className = '',
  count = 1,
  type = 'rectangle',
  width,
  height,
}: SkeletonLoaderProps) => {
  const renderSkeleton = () => {
    let baseClasses = 'bg-gray-200 animate-pulse rounded-md';
    let specificClasses = '';

    switch (type) {
      case 'card':
        specificClasses = 'w-full h-64';
        break;
      case 'text':
        specificClasses = 'h-4 w-full';
        break;
      case 'circle':
        specificClasses = 'rounded-full';
        width = width || '48px';
        height = height || '48px';
        break;
      case 'rectangle':
      default:
        specificClasses = width ? `w-${width}` : 'w-full';
        specificClasses += height ? ` h-${height}` : ' h-6';
    }

    const customStyle = {
      width: width && !width.includes('w-') ? width : undefined,
      height: height && !height.includes('h-') ? height : undefined,
    };

    return (
      <div
        className={`${baseClasses} ${specificClasses} ${className}`}
        style={customStyle}
      />
    );
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="mb-2">
          {renderSkeleton()}
        </div>
      ))}
    </>
  );
};

export default SkeletonLoader;
