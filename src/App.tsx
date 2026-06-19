import { useState } from 'react'
import { BookProvider } from './context/BookContext'
import Sidebar from './components/Sidebar'
import Board from './components/Board'
import Dashboard from './components/Dashboard'
import AddBookModal from './components/AddBookModal'

function App() {
  const [activeTab, setActiveTab] = useState<'board' | 'dashboard'>('board')
  const [showAddBook, setShowAddBook] = useState(false)

  return (
    <BookProvider>
      <div className="flex flex-col md:flex-row h-screen bg-warm-cream font-sans text-sage-900 overflow-hidden">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onAddBook={() => setShowAddBook(true)}
        />
        <main className="flex-1 flex flex-col p-4 md:p-8 pb-24 md:pb-8 overflow-hidden">
          <header className="mb-8 md:mb-12 shrink-0">
            <h1 className="text-3xl md:text-4xl font-serif text-sage-800 tracking-tight">
              {activeTab === 'board' ? 'Your Library' : 'Reading Insights'}
            </h1>
            <p className="text-sage-600 mt-2 italic text-sm md:text-base">
              {activeTab === 'board' 
                ? 'Curate your collection, one page at a time.' 
                : 'Visualize your journey through the world of books.'}
            </p>
          </header>
          
          <div className="flex-1 overflow-hidden">
            {activeTab === 'board' ? <Board /> : (
              <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
                <Dashboard />
              </div>
            )}
          </div>
        </main>
      </div>

      {showAddBook && <AddBookModal onClose={() => setShowAddBook(false)} />}
    </BookProvider>
  )
}

export default App
