import React from 'react';

interface SkeletonProps {
  className?: string;
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-white/10 rounded ${className}`}
        />
      ))}
    </>
  );
};

export const BlogSkeleton: React.FC = () => (
  <div className="card">
    <Skeleton className="h-48 mb-4" />
    <Skeleton className="h-4 mb-2" />
    <Skeleton className="h-4 mb-2 w-3/4" />
    <Skeleton className="h-3 w-1/2" />
  </div>
);

export const ProjectSkeleton: React.FC = () => (
  <div className="card">
    <Skeleton className="h-6 mb-4 w-3/4" />
    <Skeleton className="h-3 mb-2" count={3} />
    <div className="flex gap-2 mt-4">
      <Skeleton className="h-6 w-16" count={3} />
    </div>
  </div>
);