import React from 'react';

export default function SuspenseFallback() {
  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div className="space-y-2">
          <div className="h-6 w-44 bg-zinc-200 rounded-md"></div>
          <div className="h-3.5 w-64 bg-zinc-100 rounded-md"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-28 bg-zinc-200 rounded-lg"></div>
          <div className="h-8 w-24 bg-zinc-200 rounded-lg"></div>
        </div>
      </div>

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-zinc-200 flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-3 w-20 bg-zinc-200 rounded"></div>
              <div className="h-6 w-16 bg-zinc-300 rounded"></div>
              <div className="h-2.5 w-24 bg-zinc-100 rounded"></div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-zinc-100"></div>
          </div>
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-zinc-200 p-5 space-y-4">
          <div className="h-4 w-32 bg-zinc-200 rounded"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-zinc-50 border border-zinc-100 rounded-lg p-3 flex justify-between items-center">
                <div className="space-y-2">
                  <div className="h-3.5 w-40 bg-zinc-200 rounded"></div>
                  <div className="h-2.5 w-28 bg-zinc-100 rounded"></div>
                </div>
                <div className="h-5 w-16 bg-zinc-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 p-5 space-y-4">
          <div className="h-4 w-28 bg-zinc-200 rounded"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-zinc-50 border border-zinc-100">
                <div className="w-4 h-4 bg-zinc-200 rounded"></div>
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-3/4 bg-zinc-200 rounded"></div>
                  <div className="h-2 w-1/2 bg-zinc-100 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
