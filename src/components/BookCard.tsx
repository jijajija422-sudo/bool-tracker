import React from 'react';
import { Book } from '../types';
import { MoreHorizontal } from 'lucide-react';

interface BookCardProps {
  book: Book;
}

const BookCard: React.FC<BookCardProps> = ({ book }) => {
  return (
    <div className="group relative flex flex-col gap-3">
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl bg-sage-100 shadow-md transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-xl">
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={book.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center p-4 text-center">
            <span className="text-sage-400 font-serif italic text-sm">{book.title}</span>
          </div>
        )}
        
        {/* Progress Overlay (if in progress) */}
        {book.status === 'IN_PROGRESS' && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-sage-200 bg-opacity-30">
            <div 
              className="h-full bg-sage-400" 
              style={{ width: `${(book.currentChapter / book.chapters) * 100}%` }} 
            />
          </div>
        )}
      </div>
      
      <div className="px-1">
        <h4 className="font-serif font-semibold text-sage-900 line-clamp-1 text-sm md:text-base">{book.title}</h4>
        <p className="text-[10px] md:text-sm text-sage-500 line-clamp-1">{book.author}</p>
      </div>

      <button className="absolute top-2 right-2 p-1.5 bg-white bg-opacity-20 md:bg-opacity-0 rounded-full text-white opacity-100 md:opacity-0 group-hover:opacity-100 md:group-hover:bg-opacity-20 transition-all backdrop-blur-sm md:backdrop-blur-none">
        <MoreHorizontal size={16} className="md:w-[18px] md:h-[18px]" />
      </button>
    </div>
  );
};

export default BookCard;
