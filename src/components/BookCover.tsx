import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { cn } from '../utils/cn';

interface BookCoverProps {
  src: string;
  alt: string;
  className?: string;
}

const BookCover: React.FC<BookCoverProps> = ({ src, alt, className }) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className={cn('flex items-center justify-center bg-sage-100 text-sage-300', className)}>
        <BookOpen size={32} />
        <span className="sr-only">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={className}
      onError={() => setFailed(true)}
    />
  );
};

export default BookCover;
