import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useBooks } from '../context/BookContext';
import { BookStatus } from '../types';
import { cn } from '../utils/cn';
import DroppableColumn from './DroppableColumn';
import SortableBook from './SortableBook';
import BookCard from './BookCard';
import BookDetailsModal from './BookDetailsModal';

const COLUMNS: { id: BookStatus; title: string }[] = [
  { id: 'TO_READ', title: 'To Read' },
  { id: 'IN_PROGRESS', title: 'Reading' },
  { id: 'FINISHED', title: 'Finished' },
];

const Board: React.FC = () => {
  const { books, moveBook } = useBooks();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [activeMobileTab, setActiveMobileTab] = useState<BookStatus>('IN_PROGRESS');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const activeBook = activeId ? books.find((b) => b.id === activeId) : null;
  const selectedBook = selectedBookId ? books.find((b) => b.id === selectedBookId) : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const activeBook = books.find(b => b.id === active.id);
      if (activeBook) {
        if (COLUMNS.find(col => col.id === over.id)) {
          moveBook(activeBook.id, over.id as BookStatus);
        } else {
          const overBook = books.find(b => b.id === over.id);
          if (overBook && overBook.status !== activeBook.status) {
            moveBook(activeBook.id, overBook.status);
          }
        }
      }
    }
    
    setActiveId(null);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Mobile Tab Bar */}
      <div className="md:hidden flex bg-sage-50 bg-opacity-50 p-1.5 rounded-2xl mb-8 border border-sage-100">
        {COLUMNS.map((column) => (
          <button
            key={column.id}
            onClick={() => setActiveMobileTab(column.id)}
            className={cn(
              "flex-1 py-2.5 px-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 flex flex-col items-center gap-1",
              activeMobileTab === column.id 
                ? "bg-white text-sage shadow-sm scale-[1.02]" 
                : "text-sage-300"
            )}
          >
            <span>{column.title.split(' ')[0]}</span>
            <span className={cn(
              "w-1 h-1 rounded-full transition-all",
              activeMobileTab === column.id ? "bg-sage scale-100" : "bg-transparent scale-0"
            )} />
          </button>
        ))}
      </div>

      <div className="flex-1 flex gap-4 md:gap-8 overflow-x-hidden md:overflow-x-visible">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {COLUMNS.map((column) => {
            const columnBooks = books.filter((b) => b.status === column.id);
            return (
              <div 
                key={column.id} 
                className={cn(
                  "flex-1 h-full min-h-0 transition-all duration-500",
                  "md:block", // Always visible on desktop
                  activeMobileTab === column.id ? "block" : "hidden md:block" // Toggle on mobile
                )}
              >
                <DroppableColumn
                  id={column.id}
                  title={column.title}
                  count={columnBooks.length}
                >
                  <SortableContext
                    items={columnBooks.map((b) => b.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-4">
                      {columnBooks.map((book) => (
                        <SortableBook 
                          key={book.id} 
                          book={book} 
                          onClick={() => setSelectedBookId(book.id)}
                        />
                      ))}
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
        <BookDetailsModal 
          book={selectedBook} 
          onClose={() => setSelectedBookId(null)} 
        />
      )}
    </div>
  );
};

export default Board;
