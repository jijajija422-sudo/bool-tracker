import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Book } from '../types';
import BookCard from './BookCard';

interface SortableBookProps {
  book: Book;
  onClick: () => void;
}

const SortableBook: React.FC<SortableBookProps> = ({ book, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: book.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        // Only trigger onClick if not dragging
        if (!isDragging) {
          onClick();
        }
      }}
      className="cursor-grab active:cursor-grabbing"
    >
      <BookCard book={book} />
    </div>
  );
};

export default SortableBook;
