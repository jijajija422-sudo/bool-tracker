import React, { useState, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { BookOpen, Search, Filter, X } from 'lucide-react';
import { useBooks } from '../context/BookContext';
import { BookStatus } from '../types';
import { cn } from '../utils/cn';
import DroppableColumn from './DroppableColumn';
import SortableBook from './SortableBook';
import BookCard from './BookCard';
import BookDetailsModal from './BookDetailsModal';
import BookFormModal from './BookFormModal';
import ConfirmDialog from './ConfirmDialog';

const COLUMNS: { id: BookStatus; title: string }[] = [
  { id: 'TO_READ', title: 'To Read' },
  { id: 'IN_PROGRESS', title: 'Reading' },
  { id: 'FINISHED', title: 'Finished' },
];

const FilterChip: React.FC<{ label: string; onClear: () => void }> = ({ label, onClear }) => (
  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sage-100 dark:bg-sage-900/60 text-sage-700 dark:text-sage-300 text-xs font-semibold shadow-sm transition-all border border-sage-200/30">
    {label}
    <button onClick={onClear} className="hover:text-sage-900 dark:hover:text-white focus:outline-none transition-colors" aria-label="Clear filter">
      <X size={12} />
    </button>
  </span>
);

const Board: React.FC = () => {
  const { books, moveBook, reorderBooks, deleteBook } = useBooks();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [editBookId, setEditBookId] = useState<string | null>(null);
  const [deleteBookId, setDeleteBookId] = useState<string | null>(null);
  const [activeMobileTab, setActiveMobileTab] = useState<BookStatus>('IN_PROGRESS');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedTrope, setSelectedTrope] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  // Extract unique tags for filtering options
  const allGenres = useMemo(() => {
    const set = new Set<string>();
    books.forEach((b) => b.genres.forEach((g) => set.add(g)));
    return Array.from(set).sort();
  }, [books]);

  const allTropes = useMemo(() => {
    const set = new Set<string>();
    books.forEach((b) => b.tropes.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [books]);

  const allMoods = useMemo(() => {
    const set = new Set<string>();
    books.forEach((b) => b.moods.forEach((m) => set.add(m)));
    return Array.from(set).sort();
  }, [books]);

  // Dynamically filter books
  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchesSearch =
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesGenre = !selectedGenre || book.genres.includes(selectedGenre);
      const matchesTrope = !selectedTrope || book.tropes.includes(selectedTrope);
      const matchesMood = !selectedMood || book.moods.includes(selectedMood);
      const matchesRating =
        selectedRating === null ||
        (book.rating !== undefined && Math.round(book.rating) === selectedRating);

      return matchesSearch && matchesGenre && matchesTrope && matchesMood && matchesRating;
    });
  }, [books, searchQuery, selectedGenre, selectedTrope, selectedMood, selectedRating]);

  // Configure separate Mouse and Touch sensors with activation constraints
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const activeBook = activeId ? books.find((b) => b.id === activeId) : null;
  const selectedBook = selectedBookId ? books.find((b) => b.id === selectedBookId) : null;
  const editBook = editBookId ? books.find((b) => b.id === editBookId) : null;
  const deleteTarget = deleteBookId ? books.find((b) => b.id === deleteBookId) : null;

  const getColumnBooks = (status: BookStatus) =>
    filteredBooks.filter((b) => b.status === status).sort((a, b) => a.order - b.order);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeBookItem = books.find((b) => b.id === active.id);
    if (!activeBookItem) return;

    const overColumn = COLUMNS.find((col) => col.id === over.id);
    if (overColumn) {
      if (activeBookItem.status !== overColumn.id) {
        moveBook(activeBookItem.id, overColumn.id);
      }
      return;
    }

    const overBook = books.find((b) => b.id === over.id);
    if (!overBook) return;

    if (activeBookItem.status !== overBook.status) {
      moveBook(activeBookItem.id, overBook.status, overBook.order);
    } else if (active.id !== over.id) {
      reorderBooks(activeBookItem.status, activeBookItem.id, overBook.id);
    }
  };

  const hasActiveFilters = searchQuery || selectedGenre || selectedTrope || selectedMood || selectedRating !== null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Search and Filters Bar */}
      <div className="mb-6 space-y-4 shrink-0">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search books by title or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-3 rounded-2xl border border-sage-100 bg-white dark:bg-sage-900/60 dark:border-sage-800/80 text-sage-900 dark:text-sage-100 focus:outline-none focus:border-sage dark:focus:border-sage-400 text-sm transition-all shadow-sm"
            />
            <Search className="absolute left-3.5 top-3.5 text-sage-400 dark:text-sage-500" size={16} />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3.5 text-sage-400 hover:text-sage-600 dark:hover:text-sage-300"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Select Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 text-sage-400 text-xs font-semibold mr-1">
              <Filter size={14} />
              <span>Filter:</span>
            </div>

            {/* Genre Filter */}
            <select
              value={selectedGenre || ''}
              onChange={(e) => setSelectedGenre(e.target.value || null)}
              className="px-3 py-2.5 rounded-xl border border-sage-100 dark:border-sage-800/80 bg-white dark:bg-sage-900/80 text-sage-700 dark:text-sage-300 text-xs font-bold focus:outline-none focus:border-sage shadow-sm cursor-pointer"
            >
              <option value="">All Genres</option>
              {allGenres.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>

            {/* Trope Filter */}
            <select
              value={selectedTrope || ''}
              onChange={(e) => setSelectedTrope(e.target.value || null)}
              className="px-3 py-2.5 rounded-xl border border-sage-100 dark:border-sage-800/80 bg-white dark:bg-sage-900/80 text-sage-700 dark:text-sage-300 text-xs font-bold focus:outline-none focus:border-sage shadow-sm cursor-pointer"
            >
              <option value="">All Tropes</option>
              {allTropes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            {/* Mood Filter */}
            <select
              value={selectedMood || ''}
              onChange={(e) => setSelectedMood(e.target.value || null)}
              className="px-3 py-2.5 rounded-xl border border-sage-100 dark:border-sage-800/80 bg-white dark:bg-sage-900/80 text-sage-700 dark:text-sage-300 text-xs font-bold focus:outline-none focus:border-sage shadow-sm cursor-pointer"
            >
              <option value="">All Moods</option>
              {allMoods.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            {/* Rating Filter */}
            <select
              value={selectedRating !== null ? String(selectedRating) : ''}
              onChange={(e) => setSelectedRating(e.target.value ? Number(e.target.value) : null)}
              className="px-3 py-2.5 rounded-xl border border-sage-100 dark:border-sage-800/80 bg-white dark:bg-sage-900/80 text-sage-700 dark:text-sage-300 text-xs font-bold focus:outline-none focus:border-sage shadow-sm cursor-pointer"
            >
              <option value="">All Ratings</option>
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={String(r)}>{'★'.repeat(r)}{'☆'.repeat(5 - r)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Chips Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-[10px] md:text-xs text-sage-400 dark:text-sage-500 font-bold uppercase tracking-wider">Active:</span>
            {searchQuery && (
              <FilterChip label={`Search: "${searchQuery}"`} onClear={() => setSearchQuery('')} />
            )}
            {selectedGenre && (
              <FilterChip label={`Genre: ${selectedGenre}`} onClear={() => setSelectedGenre(null)} />
            )}
            {selectedTrope && (
              <FilterChip label={`Trope: ${selectedTrope}`} onClear={() => setSelectedTrope(null)} />
            )}
            {selectedMood && (
              <FilterChip label={`Mood: ${selectedMood}`} onClear={() => setSelectedMood(null)} />
            )}
            {selectedRating !== null && (
              <FilterChip label={`Rating: ${selectedRating} Stars`} onClear={() => setSelectedRating(null)} />
            )}
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedGenre(null);
                setSelectedTrope(null);
                setSelectedMood(null);
                setSelectedRating(null);
              }}
              className="text-xs text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-bold ml-1 transition-colors"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      <div className="md:hidden flex bg-sage-50 bg-opacity-50 dark:bg-sage-900/30 p-1.5 rounded-2xl mb-8 border border-sage-100 dark:border-sage-800/80 shrink-0">
        {COLUMNS.map((column) => (
          <button
            key={column.id}
            onClick={() => setActiveMobileTab(column.id)}
            className={cn(
              'flex-1 py-2.5 px-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 flex flex-col items-center gap-1',
              activeMobileTab === column.id
                ? 'bg-white dark:bg-sage-850 text-sage dark:text-sage-300 shadow-sm scale-[1.02]'
                : 'text-sage-300 dark:text-sage-600'
            )}
          >
            <span>{column.title.split(' ')[0]}</span>
            <span
              className={cn(
                'w-1 h-1 rounded-full transition-all',
                activeMobileTab === column.id ? 'bg-sage scale-100' : 'bg-transparent scale-0'
              )}
            />
          </button>
        ))}
      </div>

      {/* Horizontal overflow container for desktop/tablet layout */}
      <div className="flex-1 flex gap-4 md:gap-8 overflow-x-auto min-h-0 pb-6 pr-2 custom-scrollbar">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {COLUMNS.map((column) => {
            const columnBooks = getColumnBooks(column.id);
            return (
              <div
                key={column.id}
                className={cn(
                  'flex-1 h-full min-h-0 transition-all duration-500',
                  'md:block',
                  activeMobileTab === column.id ? 'block' : 'hidden md:block'
                )}
              >
                <DroppableColumn id={column.id} title={column.title} count={columnBooks.length}>
                  <SortableContext
                    items={columnBooks.map((b) => b.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-4">
                      {columnBooks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <BookOpen className="text-sage-200 dark:text-sage-800 mb-3" size={32} />
                          <p className="text-sage-400 dark:text-sage-500 text-sm italic font-serif">
                            {hasActiveFilters ? 'No matching books' : 'No books here yet'}
                          </p>
                        </div>
                      ) : (
                        columnBooks.map((book) => (
                          <SortableBook
                            key={book.id}
                            book={book}
                            onClick={() => setSelectedBookId(book.id)}
                            onEdit={() => setEditBookId(book.id)}
                            onDelete={() => setDeleteBookId(book.id)}
                          />
                        ))
                      )}
                    </div>
                  </SortableContext>
                </DroppableColumn>
              </div>
            );
          })}

          <DragOverlay>
            {activeBook ? (
              <div className="rotate-3 opacity-90 scale-95 md:scale-100">
                <BookCard book={activeBook} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {selectedBook && (
        <BookDetailsModal book={selectedBook} onClose={() => setSelectedBookId(null)} />
      )}

      {editBook && (
        <BookFormModal
          isOpen={!!editBook}
          onClose={() => setEditBookId(null)}
          book={editBook}
          mode="edit"
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          isOpen={!!deleteTarget}
          onClose={() => setDeleteBookId(null)}
          onConfirm={() => deleteBook(deleteTarget.id)}
          title="Delete Book"
          message={`Remove "${deleteTarget.title}" from your library?`}
          confirmLabel="Delete"
          variant="danger"
        />
      )}
    </div>
  );
};

export default Board;

