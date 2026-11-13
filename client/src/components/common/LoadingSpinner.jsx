import React from 'react';

export const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 space-y-3">
      <div
        className={`${sizeClasses[size] || sizeClasses.md} rounded-full border-emerald-500/20 border-t-emerald-400 animate-spin`}
      />
      {text && <p className="text-xs font-medium text-slate-400 tracking-wide uppercase">{text}</p>}
    </div>
  );
};
