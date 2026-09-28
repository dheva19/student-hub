import React from 'react';
import { Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onMenuClick }) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 md:px-6 bg-white border-b border-zinc-200">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-1.5 text-zinc-500 rounded-md lg:hidden hover:bg-zinc-100"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 border border-zinc-200">
            {user?.semester ? `Semester ${user.semester}` : 'Semester Aktif'}
          </span>
          {user?.major && (
            <span className="hidden sm:inline-block text-xs text-zinc-500">
              {user.major}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-xs font-medium text-zinc-800">{user?.name}</p>
          <p className="text-[11px] text-zinc-400">{user?.university || 'Mahasiswa'}</p>
        </div>

        {user?.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="w-7 h-7 rounded-full border border-zinc-200 object-cover"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs font-semibold">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
        )}
      </div>
    </header>
  );
}
