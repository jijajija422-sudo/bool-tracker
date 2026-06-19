import React, { useState } from 'react';
import { X, BookOpen, User, Tag, Layers, Quote, PlusCircle, Camera } from 'lucide-react';
import { Book } from '../types';
import OCRScanner from './OCRScanner';
import { useBooks } from '../context/BookContext';

interface BookDetailsModalProps {
  book: Book;
  onClose: () => void;
}

const BookDetailsModal: React.FC<BookDetailsModalProps> = ({ book, onClose }) => {
  const { updateBook } = useBooks();
  const [showScanner, setShowScanner] = useState(false);

  const handleQuoteExtracted = (text: string) => {
    const newQuote = {
      id: Math.random().toString(36).substr(2, 9),
      text: text.trim(),
      dateAdded: new Date().toISOString(),
    };
    
    updateBook({
      ...book,
      quotes: [...book.quotes, newQuote],
    });
    
    setShowScanner(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-sage-900 bg-opacity-40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl h-[95vh] md:h-auto md:max-h-[90vh] rounded-t-3xl md:rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
        {/* Cover Section */}
        <div className="md:w-1/3 bg-sage-50 p-6 md:p-8 flex items-center justify-center border-b md:border-b-0 md:border-r border-sage-100 shrink-0">
          <div className="relative aspect-[2/3] w-32 md:w-full max-w-[240px] shadow-2xl rounded-xl overflow-hidden">
            {book.coverUrl ? (
              <img src={book.coverUrl} alt={book.title} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-sage-100 text-sage-300">
                <BookOpen size={48} />
              </div>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 p-6 md:p-12 overflow-y-auto">
          <div className="flex justify-between items-start mb-6 md:mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-sage-900 mb-2 leading-tight">{book.title}</h2>
              <div className="flex items-center gap-2 text-sage-500">
                <User size={16} />
                <span className="font-medium text-sm md:text-base">{book.author}</span>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-sage-50 rounded-full transition-colors"
            >
              <X size={24} className="text-sage-400" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 md:gap-8 mb-6 md:mb-8">
            <div className="space-y-1">
              <span className="text-[10px] md:text-xs uppercase tracking-wider text-sage-400 font-bold">Progress</span>
              <div className="flex items-center gap-2 md:gap-3">
                <Layers size={16} className="text-sage-600" />
                <span className="text-base md:text-lg font-medium text-sage-800 leading-none">
                  {book.currentChapter} / {book.chapters} <span className="hidden md:inline">Chapters</span>
                </span>
              </div>
            </div>
            <div className="space-y-1 text-right md:text-left">
              <span className="text-[10px] md:text-xs uppercase tracking-wider text-sage-400 font-bold">Status</span>
              <div>
                <div className="inline-flex px-3 py-1 rounded-full bg-sage-100 text-sage-700 text-xs md:text-sm font-semibold whitespace-nowrap">
                  {book.status.replace('_', ' ')}
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8 md:mb-10">
            <h3 className="text-[10px] md:text-xs uppercase tracking-wider text-sage-400 font-bold mb-3 md:mb-4">Description</h3>
            <p className="text-sage-700 leading-relaxed font-serif italic text-base md:text-lg">
              {book.description || "No description provided."}
            </p>
          </div>

          <div className="space-y-8 pb-20 md:pb-0">
            {/* Genres & Tropes */}
            <div className="flex flex-wrap gap-2">
              {book.genres.map(genre => (
                <span key={genre} className="px-2 py-1 bg-off-white border border-sage-100 rounded-lg text-sage-600 text-[10px] md:text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Tag size={12} /> {genre}
                </span>
              ))}
              {book.tropes.map(trope => (
                <span key={trope} className="px-2 py-1 bg-sage-50 border border-sage-200 rounded-lg text-sage-500 text-[10px] md:text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="text-sage-300">#</span> {trope}
                </span>
              ))}
            </div>

            {/* Quotes Section */}
            <div>
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h3 className="text-[10px] md:text-xs uppercase tracking-wider text-sage-400 font-bold">Saved Quotes</h3>
                <div className="flex gap-2 md:gap-4">
                  <button 
                    onClick={() => setShowScanner(true)}
                    className="p-2 md:px-3 md:py-1.5 text-sage-500 hover:text-white hover:bg-sage border border-sage rounded-full md:rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
                    title="Scan Quote"
                  >
                    <Camera size={16} /> <span className="hidden md:inline">Scan Quote</span>
                  </button>
                  <button 
                    className="p-2 md:px-3 md:py-1.5 text-sage-500 hover:text-white hover:bg-sage border border-sage rounded-full md:rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
                    title="Add Quote"
                  >
                    <PlusCircle size={16} /> <span className="hidden md:inline">Add Quote</span>
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                {book.quotes.length > 0 ? (
                  book.quotes.map(quote => (
                    <div key={quote.id} className="p-4 bg-off-white rounded-2xl border-l-4 border-sage-200 group relative shadow-sm">
                      <p className="text-sage-800 font-serif italic mb-2 leading-relaxed text-sm md:text-base">"{quote.text}"</p>
                      <span className="text-[10px] md:text-xs text-sage-400 font-medium tracking-wide">
                        {quote.page ? `PAGE ${quote.page} • ` : ''}
                        {new Date(quote.dateAdded).toLocaleDateString().toUpperCase()}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-8 md:p-12 border-2 border-dashed border-sage-100 rounded-3xl bg-sage-50 bg-opacity-30">
                    <Quote className="mx-auto text-sage-200 mb-3" size={32} />
                    <p className="text-sage-400 text-sm italic font-serif">Capture the words that move you.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {showScanner && (
        <OCRScanner 
          onQuoteExtracted={handleQuoteExtracted} 
          onClose={() => setShowScanner(false)} 
        />
      )}
    </div>
  );
};

export default BookDetailsModal;
