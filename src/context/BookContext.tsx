import React, { createContext, useContext, useState, useEffect } from 'react';
import { Book, BookStatus } from '../types';

interface BookContextType {
  books: Book[];
  addBook: (book: Book) => void;
  updateBook: (book: Book) => void;
  deleteBook: (id: string) => void;
  moveBook: (bookId: string, newStatus: BookStatus) => void;
}

const BookContext = createContext<BookContextType | undefined>(undefined);

export const BookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [books, setBooks] = useState<Book[]>(() => {
    const saved = localStorage.getItem('books');
    if (saved) return JSON.parse(saved);
    
    // Mock initial data
    return [
      {
        id: '1',
        title: 'The Secret History',
        author: 'Donna Tartt',
        coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop',
        description: 'A selective group of students at a Vermont college discover a way of thinking and living that is a world away from the humdrum existence of their contemporaries.',
        chapters: 24,
        currentChapter: 12,
        genres: ['Mystery', 'Literary Fiction'],
        tropes: ['Dark Academia', 'Found Family'],
        moods: ['Melancholic', 'Intense'],
        status: 'IN_PROGRESS',
        dateStarted: new Date().toISOString(),
        quotes: [
          { id: 'q1', text: 'Beauty is terror. Whatever we call beautiful, we quiver before it.', page: 42, dateAdded: new Date().toISOString() }
        ]
      },
      {
        id: '2',
        title: 'Circe',
        author: 'Madeline Miller',
        coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800&auto=format&fit=crop',
        description: 'In the house of Helios, god of the sun and mightiest of the Titans, a daughter is born.',
        chapters: 27,
        currentChapter: 0,
        genres: ['Fantasy', 'Mythology'],
        tropes: ['Retelling', 'Loneliness'],
        moods: ['Lyrical', 'Empowering'],
        status: 'TO_READ',
        quotes: []
      },
      {
        id: '3',
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        coverUrl: 'https://images.unsplash.com/photo-1543004471-240ce440076a?q=80&w=800&auto=format&fit=crop',
        description: 'The story of the mysteriously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.',
        chapters: 9,
        currentChapter: 9,
        genres: ['Classic', 'Tragedy'],
        tropes: ['Unrequited Love', 'Class Struggle'],
        moods: ['Nostalgic', 'Glittering'],
        status: 'FINISHED',
        dateStarted: new Date().toISOString(),
        dateFinished: new Date().toISOString(),
        quotes: []
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('books', JSON.stringify(books));
  }, [books]);

  const addBook = (book: Book) => {
    setBooks((prev) => [...prev, book]);
  };

  const updateBook = (updatedBook: Book) => {
    setBooks((prev) => prev.map((b) => (b.id === updatedBook.id ? updatedBook : b)));
  };

  const deleteBook = (id: string) => {
    setBooks((prev) => prev.filter((b) => b.id !== id));
  };

  const moveBook = (bookId: string, newStatus: BookStatus) => {
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id === bookId) {
          const updates: Partial<Book> = { status: newStatus };
          if (newStatus === 'FINISHED' && b.status !== 'FINISHED') {
            updates.dateFinished = new Date().toISOString();
          }
          if (newStatus === 'IN_PROGRESS' && b.status === 'TO_READ') {
            updates.dateStarted = new Date().toISOString();
          }
          return { ...b, ...updates };
        }
        return b;
      })
    );
  };

  return (
    <BookContext.Provider value={{ books, addBook, updateBook, deleteBook, moveBook }}>
      {children}
    </BookContext.Provider>
  );
};

export const useBooks = () => {
  const context = useContext(BookContext);
  if (!context) {
    throw new Error('useBooks must be used within a BookProvider');
  }
  return context;
};
