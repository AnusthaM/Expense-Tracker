import React from "react";

export const ListSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="p-4 space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 animate-pulse">
        <div className="w-10 h-10 bg-primary-100 rounded-xl" />
        <div className="flex-1 space-y-1.5">
          <div className="w-3/4 h-4 rounded bg-primary-100" />
          <div className="w-1/2 h-3 rounded bg-primary-50" />
        </div>
        <div className="w-16 h-4 rounded bg-primary-100" />
      </div>
    ))}
  </div>
);

export const CardSkeleton: React.FC = () => (
  <div className="p-5 border bg-surface rounded-xl border-surface-border animate-pulse">
    <div className="flex items-center justify-between mb-3">
      <div className="w-16 h-3 rounded bg-primary-100" />
      <div className="w-8 h-8 bg-primary-100 rounded-xl" />
    </div>
    <div className="w-24 h-8 rounded bg-primary-100" />
  </div>
);
