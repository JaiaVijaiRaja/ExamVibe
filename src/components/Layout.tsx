
import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { ViewType, User, AppProgress } from '../types';
import { Menu, X } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  user: User;
  progress: AppProgress;
  onUpdateProgress: (newProgress: Partial<AppProgress>) => void;
  isDataLoaded: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentView, 
  onViewChange, 
  isDarkMode, 
  onToggleTheme,
  user,
  progress,
  onUpdateProgress,
  isDataLoaded
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-20 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transform transition-transform duration-300 md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="md:hidden absolute top-4 right-4 z-40">
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300 min-h-[44px] min-w-[44px] flex items-center justify-center shadow-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <Sidebar 
          currentView={currentView} 
          onViewChange={(v) => {
            onViewChange(v);
            setIsSidebarOpen(false);
          }} 
          progress={progress}
          onUpdateProgress={onUpdateProgress}
          userEmail={user.email}
          isDataLoaded={isDataLoaded}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 shrink-0 z-10">
          <div className="flex items-center gap-3">
            <button 
              className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="md:hidden text-xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tighter">
              EXAMVIBE
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-black text-slate-900 dark:text-white leading-none tracking-tight">{user.name}</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-0.5">{user.major}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-black shadow-lg shadow-blue-500/20">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
