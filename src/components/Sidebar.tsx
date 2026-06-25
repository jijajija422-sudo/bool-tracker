import React from 'react';
import { Library, LayoutDashboard, Settings, PlusCircle } from 'lucide-react';
import { cn } from '../utils/cn';

interface SidebarProps {
  activeTab: 'board' | 'dashboard';
  setActiveTab: (tab: 'board' | 'dashboard') => void;
  onAddBook: () => void;
  onOpenSettings: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onAddBook, onOpenSettings }) => {
  return (
    <>
      <aside className="hidden md:flex w-64 bg-off-white border-r border-sage-100 flex-col p-6">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-8 h-8 bg-sage rounded-lg flex items-center justify-center text-white">
            <Library size={20} />
          </div>
          <span className="text-xl font-serif font-bold text-sage-800">Sylvan.</span>
        </div>

        <nav className="flex-1 space-y-2">
          <button
            onClick={() => setActiveTab('board')}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
              activeTab === 'board'
                ? 'bg-sage-100 text-sage-800 font-medium'
                : 'text-sage-500 hover:bg-sage-50 hover:text-sage-700'
            )}
          >
            <Library size={20} />
            <span>My Shelf</span>
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
              activeTab === 'dashboard'
                ? 'bg-sage-100 text-sage-800 font-medium'
                : 'text-sage-500 hover:bg-sage-50 hover:text-sage-700'
            )}
          >
            <LayoutDashboard size={20} />
            <span>Analytics</span>
          </button>
        </nav>

        <div className="pt-6 border-t border-sage-100">
          <button
            onClick={onAddBook}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sage-500 hover:bg-sage-50 hover:text-sage-700 transition-all duration-200"
          >
            <PlusCircle size={20} />
            <span>Add Book</span>
          </button>
          <button
            onClick={onOpenSettings}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sage-500 hover:bg-sage-50 hover:text-sage-700 transition-all duration-200"
          >
            <Settings size={20} />
            <span>Settings</span>
          </button>
        </div>
      </aside>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white bg-opacity-80 backdrop-blur-lg border-t border-sage-100 px-6 py-3 z-50 flex items-center justify-around">
        <button
          onClick={() => setActiveTab('board')}
          className={cn(
            'flex flex-col items-center gap-1 transition-colors duration-200',
            activeTab === 'board' ? 'text-sage' : 'text-sage-300'
          )}
        >
          <Library size={24} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Shelf</span>
        </button>

        <button
          onClick={onAddBook}
          className="w-12 h-12 bg-sage rounded-full flex items-center justify-center text-white shadow-lg shadow-sage/30 -mt-8 border-4 border-warm-cream"
          aria-label="Add book"
        >
          <PlusCircle size={28} />
        </button>

        <button
          onClick={() => setActiveTab('dashboard')}
          className={cn(
            'flex flex-col items-center gap-1 transition-colors duration-200',
            activeTab === 'dashboard' ? 'text-sage' : 'text-sage-300'
          )}
        >
          <LayoutDashboard size={24} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Stats</span>
        </button>
      </nav>
    </>
  );
};

export default Sidebar;
