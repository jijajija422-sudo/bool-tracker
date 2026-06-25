import { useState } from 'react';
import { Settings } from 'lucide-react';
import { BookProvider } from './context/BookContext';
import Sidebar from './components/Sidebar';
import Board from './components/Board';
import Dashboard from './components/Dashboard';
import BookFormModal from './components/BookFormModal';
import SettingsModal from './components/SettingsModal';

function App() {
  const [activeTab, setActiveTab] = useState<'board' | 'dashboard'>('board');
  const [showAddBook, setShowAddBook] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <BookProvider>
      <div className="flex flex-col md:flex-row h-screen bg-warm-cream font-sans text-sage-900 overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onAddBook={() => setShowAddBook(true)}
          onOpenSettings={() => setShowSettings(true)}
        />
        <main className="flex-1 flex flex-col p-4 md:p-8 pb-24 md:pb-8 overflow-hidden">
          <header className="mb-8 md:mb-12 shrink-0 flex justify-between items-start">
            <div>
              <h1 className="text-3xl md:text-4xl font-serif text-sage-800 tracking-tight">
                {activeTab === 'board' ? 'Your Library' : 'Reading Insights'}
              </h1>
              <p className="text-sage-600 mt-2 italic text-sm md:text-base">
                {activeTab === 'board'
                  ? 'Curate your collection, one page at a time.'
                  : 'Visualize your journey through the world of books.'}
              </p>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="md:hidden p-2 text-sage-400 hover:text-sage-600"
              aria-label="Open settings"
            >
              <Settings size={22} />
            </button>
          </header>

          <div className="flex-1 overflow-hidden">
            {activeTab === 'board' ? (
              <Board />
            ) : (
              <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
                <Dashboard />
              </div>
            )}
          </div>
        </main>
      </div>

      <BookFormModal isOpen={showAddBook} onClose={() => setShowAddBook(false)} mode="add" />
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </BookProvider>
  );
}

export default App;
