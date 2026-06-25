import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { Book, BookStatus, ReadingSession, LibraryExport } from '../types';
import {
  loadLibrary,
  saveLibrary,
  exportLibrary,
  importLibrary,
  getSampleBooks,
  getNextOrder,
} from '../utils/storage';
import { generateId } from '../utils/id';

interface BookContextType {
  books: Book[];
  readingSessions: ReadingSession[];
  addBook: (book: Omit<Book, 'id' | 'order'> & { id?: string }) => void;
  updateBook: (book: Book) => void;
  deleteBook: (id: string) => void;
  moveBook: (bookId: string, newStatus: BookStatus, newOrder?: number) => void;
  reorderBooks: (status: BookStatus, activeId: string, overId: string) => void;
  addReadingSession: (session: Omit<ReadingSession, 'id'>) => void;
  logProgress: (bookId: string, chaptersRead: number, pagesRead?: number, durationMinutes?: number) => void;
  exportData: () => LibraryExport;
  importData: (raw: unknown) => boolean;
  loadSampleData: () => void;
  clearLibrary: () => void;
}

const BookContext = createContext<BookContextType | undefined>(undefined);

export const BookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initial = loadLibrary();
  const [books, setBooks] = useState<Book[]>(initial.books);
  const [readingSessions, setReadingSessions] = useState<ReadingSession[]>(initial.readingSessions);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveLibrary({ version: 2, books, readingSessions });
    }, 300);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [books, readingSessions]);

  const addBook = useCallback((book: Omit<Book, 'id' | 'order'> & { id?: string }) => {
    setBooks((prev) => {
      const newBook: Book = {
        ...book,
        id: book.id ?? generateId(),
        order: getNextOrder(prev, book.status),
      };
      return [...prev, newBook];
    });
  }, []);

  const updateBook = useCallback((updatedBook: Book) => {
    setBooks((prev) => prev.map((b) => (b.id === updatedBook.id ? updatedBook : b)));
  }, []);

  const deleteBook = useCallback((id: string) => {
    setBooks((prev) => prev.filter((b) => b.id !== id));
    setReadingSessions((prev) => prev.filter((s) => s.bookId !== id));
  }, []);

  const moveBook = useCallback((bookId: string, newStatus: BookStatus, newOrder?: number) => {
    setBooks((prev) => {
      const book = prev.find((b) => b.id === bookId);
      if (!book) return prev;

      const updates: Partial<Book> = { status: newStatus };
      if (newStatus === 'FINISHED' && book.status !== 'FINISHED') {
        updates.dateFinished = new Date().toISOString();
        if (book.chapters > 0) updates.currentChapter = book.chapters;
      }
      if (newStatus === 'IN_PROGRESS' && book.status === 'TO_READ') {
        updates.dateStarted = new Date().toISOString();
      }

      const targetOrder = newOrder ?? getNextOrder(prev.filter((b) => b.id !== bookId), newStatus);

      const updated = prev.map((b) => {
        if (b.id === bookId) return { ...b, ...updates, status: newStatus, order: targetOrder };
        if (b.status === newStatus && b.order >= targetOrder) {
          return { ...b, order: b.order + 1 };
        }
        return b;
      });

      return updated;
    });
  }, []);

  const reorderBooks = useCallback((status: BookStatus, activeId: string, overId: string) => {
    setBooks((prev) => {
      const columnBooks = prev
        .filter((b) => b.status === status)
        .sort((a, b) => a.order - b.order);

      const oldIndex = columnBooks.findIndex((b) => b.id === activeId);
      const newIndex = columnBooks.findIndex((b) => b.id === overId);
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return prev;

      const reordered = [...columnBooks];
      const [removed] = reordered.splice(oldIndex, 1);
      reordered.splice(newIndex, 0, removed);

      const orderMap = new Map(reordered.map((b, i) => [b.id, i]));

      return prev.map((b) =>
        b.status === status && orderMap.has(b.id) ? { ...b, order: orderMap.get(b.id)! } : b
      );
    });
  }, []);

  const addReadingSession = useCallback((session: Omit<ReadingSession, 'id'>) => {
    setReadingSessions((prev) => [...prev, { ...session, id: generateId() }]);
  }, []);

  const logProgress = useCallback(
    (bookId: string, chaptersRead: number, pagesRead = 0, durationMinutes = 15) => {
      setBooks((prev) =>
        prev.map((b) => {
          if (b.id !== bookId) return b;
          const newChapter = Math.min(b.chapters, b.currentChapter + chaptersRead);
          const updates: Partial<Book> = { currentChapter: newChapter };
          if (newChapter > 0 && b.status === 'TO_READ') {
            updates.status = 'IN_PROGRESS';
            updates.dateStarted = b.dateStarted ?? new Date().toISOString();
          }
          if (b.chapters > 0 && newChapter >= b.chapters) {
            updates.status = 'FINISHED';
            updates.dateFinished = new Date().toISOString();
          }
          return { ...b, ...updates };
        })
      );

      if (pagesRead > 0 || durationMinutes > 0) {
        addReadingSession({
          bookId,
          date: new Date().toISOString(),
          pagesRead,
          durationMinutes,
        });
      }
    },
    [addReadingSession]
  );

  const exportData = useCallback(() => {
    return exportLibrary({ version: 2, books, readingSessions });
  }, [books, readingSessions]);

  const importData = useCallback((raw: unknown) => {
    const data = importLibrary(raw);
    if (!data) return false;
    setBooks(data.books);
    setReadingSessions(data.readingSessions);
    return true;
  }, []);

  const loadSampleData = useCallback(() => {
    setBooks(getSampleBooks());
    setReadingSessions([]);
  }, []);

  const clearLibrary = useCallback(() => {
    setBooks([]);
    setReadingSessions([]);
  }, []);

  const value = useMemo(
    () => ({
      books,
      readingSessions,
      addBook,
      updateBook,
      deleteBook,
      moveBook,
      reorderBooks,
      addReadingSession,
      logProgress,
      exportData,
      importData,
      loadSampleData,
      clearLibrary,
    }),
    [
      books,
      readingSessions,
      addBook,
      updateBook,
      deleteBook,
      moveBook,
      reorderBooks,
      addReadingSession,
      logProgress,
      exportData,
      importData,
      loadSampleData,
      clearLibrary,
    ]
  );

  return <BookContext.Provider value={value}>{children}</BookContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useBooks = () => {
  const context = useContext(BookContext);
  if (!context) {
    throw new Error('useBooks must be used within a BookProvider');
  }
  return context;
};
