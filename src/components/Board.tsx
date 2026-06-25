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
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { BookOpen } from 'lucide-react';
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

const Board: React.FC = () => {
  const { books, moveBook, reorderBooks, deleteBook } = useBooks();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [editBookId, setEditBookId] = useState<string | null>(null);
  const [deleteBookId, setDeleteBookId] = useState<string | null>(null);
  const [activeMobileTab, setActiveMobileTab] = useState<BookStatus>('IN_PROGRESS');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
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
    books.filter((b) => b.status === status).sort((a, b) => a.order - b.order);

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

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="md:hidden flex bg-sage-50 bg-opacity-50 p-1.5 rounded-2xl mb-8 border border-sage-100">
        {COLUMNS.map((column) => (
          <button
            key={column.id}
            onClick={() => setActiveMobileTab(column.id)}
            className={cn(
              'flex-1 py-2.5 px-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 flex flex-col items-center gap-1',
              activeMobileTab === column.id
                ? 'bg-white text-sage shadow-sm scale-[1.02]'
                : 'text-sage-300'
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

      <div className="flex-1 flex gap-4 md:gap-8 overflow-x-hidden md:overflow-x-visible">
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
                          <BookOpen className="text-sage-200 mb-3" size={32} />
                          <p className="text-sage-400 text-sm italic font-serif">No books here yet</p>
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
