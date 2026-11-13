import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Activity } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="p-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-6">
        <Activity className="w-12 h-12" />
      </div>
      <h1 className="text-4xl font-black text-white font-mono tracking-tight mb-2">404</h1>
      <h2 className="text-xl font-bold text-slate-200 mb-2">Page Not Found</h2>
      <p className="text-sm text-slate-400 max-w-sm mb-6">
        The page you are looking for doesn't exist or has been moved. Keep your streak going on the dashboard!
      </p>
      <Link
        to="/"
        className="inline-flex items-center space-x-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm rounded-xl transition-all shadow-md shadow-emerald-950/40"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </Link>
    </div>
  );
};
