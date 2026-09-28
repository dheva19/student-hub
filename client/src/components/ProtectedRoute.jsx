import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-sm bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm animate-pulse space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-200"></div>
            <div className="space-y-1.5 flex-1">
              <div className="h-3.5 w-3/4 bg-zinc-200 rounded"></div>
              <div className="h-2.5 w-1/2 bg-zinc-100 rounded"></div>
            </div>
          </div>
          <div className="space-y-2 pt-2">
            <div className="h-3 bg-zinc-100 rounded w-full"></div>
            <div className="h-3 bg-zinc-100 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
