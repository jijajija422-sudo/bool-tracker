import React, { useState, useRef, useEffect } from 'react';
import { Book } from '../types';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import BookCover from './BookCover';

interface BookCardProps {
  book: Book;
  onEdit?: () => void;
  onDelete?: () => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, onEdit, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const progressPercent =
    book.chapters > 0 ? Math.min(100, (book.currentChapter / book.chapters) * 100) : 0;

  return (
    <div className="group relative flex flex-col gap-3">
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl bg-sage-100 shadow-md transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-xl">
        <BookCover src={book.coverUrl} alt={book.title} className="h-full w-full object-cover" />

        {book.status === 'IN_PROGRESS' && book.chapters > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-sage-200 bg-opacity-30">
            <div className="h-full bg-sage-400" style={{ width: `${progressPercent}%` }} />
          </div>
        )}
      </div>

      <div className="px-1">
        <h4 className="font-serif font-semibold text-sage-900 line-clamp-1 text-sm md:text-base">{book.title}</h4>
        <p className="text-[10px] md:text-sm text-sage-500 line-clamp-1">{book.author}</p>
      </div>

      {(onEdit || onDelete) && (
        <div ref={menuRef} className="absolute top-2 right-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="p-1.5 bg-white bg-opacity-80 md:bg-opacity-0 rounded-full text-sage-700 md:text-white opacity-100 md:opacity-0 group-hover:opacity-100 md:group-hover:bg-opacity-80 transition-all backdrop-blur-sm"
            aria-label="Book actions"
            aria-expanded={menuOpen}
          >
            <MoreHorizontal size={16} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 bg-white rounded-xl shadow-lg border border-sage-100 py-1 min-w-[120px] z-10">
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    onEdit();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-sage-700 hover:bg-sage-50"
                >
                  <Pencil size={14} /> Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    onDelete();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={14} /> Delete
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BookCard;
