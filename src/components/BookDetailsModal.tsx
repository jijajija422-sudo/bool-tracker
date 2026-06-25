import React, { useState, lazy, Suspense } from 'react';
import { User, Tag, Layers, Quote, PlusCircle, Camera, Pencil, Trash2, Star, X, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Book } from '../types';
import { useBooks } from '../context/BookContext';
import { useModalAccessibility } from '../hooks/useModalAccessibility';
import { generateId } from '../utils/id';
import ConfirmDialog from './ConfirmDialog';
import BookFormModal from './BookFormModal';
import BookCover from './BookCover';

const OCRScanner = lazy(() => import('./OCRScanner'));

interface BookDetailsModalProps {
  book: Book;
  onClose: () => void;
}

const BookDetailsModal: React.FC<BookDetailsModalProps> = ({ book, onClose }) => {
  const { updateBook, deleteBook, logProgress } = useBooks();
  const [showScanner, setShowScanner] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddQuote, setShowAddQuote] = useState(false);
  const [quoteText, setQuoteText] = useState('');
  const [quotePage, setQuotePage] = useState('');
  const [chaptersRead, setChaptersRead] = useState(1);
  const [pagesRead, setPagesRead] = useState(20);
  const dialogRef = useModalAccessibility(true, onClose);

  const progressPercent =
    book.chapters > 0 ? Math.round((book.currentChapter / book.chapters) * 100) : 0;

  const handleQuoteExtracted = (text: string) => {
    const newQuote = {
      id: generateId(),
      text: text.trim(),
      dateAdded: new Date().toISOString(),
    };

    updateBook({
      ...book,
      quotes: [...book.quotes, newQuote],
    });

    setShowScanner(false);
  };

  const handleAddQuote = () => {
    if (!quoteText.trim()) return;
    updateBook({
      ...book,
      quotes: [
        ...book.quotes,
        {
          id: generateId(),
          text: quoteText.trim(),
          page: quotePage ? Number(quotePage) : undefined,
          dateAdded: new Date().toISOString(),
        },
      ],
    });
    setQuoteText('');
    setQuotePage('');
    setShowAddQuote(false);
  };

  const handleDeleteQuote = (quoteId: string) => {
    updateBook({
      ...book,
      quotes: book.quotes.filter((q) => q.id !== quoteId),
    });
  };

  const handleLogProgress = () => {
    logProgress(book.id, chaptersRead, pagesRead);
    onClose();
  };

  const handleDelete = () => {
    deleteBook(book.id);
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-sage-900 bg-opacity-40 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && onClose()}
        role="presentation"
      >
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="book-details-title"
          className="bg-white w-full max-w-4xl h-[95vh] md:h-auto md:max-h-[90vh] rounded-t-3xl md:rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
        >
          <div className="md:w-1/3 bg-sage-50 p-6 md:p-8 flex items-center justify-center border-b md:border-b-0 md:border-r border-sage-100 shrink-0">
            <div className="relative aspect-[2/3] w-32 md:w-full max-w-[240px] shadow-2xl rounded-xl overflow-hidden">
              <BookCover src={book.coverUrl} alt={book.title} className="h-full w-full object-cover" />
            </div>
          </div>

          <div className="flex-1 p-6 md:p-12 overflow-y-auto">
            <div className="flex justify-between items-start mb-6 md:mb-8">
              <div>
                <h2 id="book-details-title" className="text-2xl md:text-3xl font-serif font-bold text-sage-900 mb-2 leading-tight">
                  {book.title}
                </h2>
                <div className="flex items-center gap-2 text-sage-500">
                  <User size={16} />
                  <span className="font-medium text-sm md:text-base">{book.author}</span>
                </div>
                {book.rating !== undefined && book.rating > 0 && (
                  <div className="flex items-center gap-1 mt-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < Math.round(book.rating!) ? 'text-amber-400 fill-amber-400' : 'text-sage-200'}
                      />
                    ))}
                    <span className="text-xs text-sage-400 ml-1">{book.rating}/5</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowEdit(true)}
                  className="p-2 hover:bg-sage-50 rounded-full transition-colors"
                  aria-label="Edit book"
                >
                  <Pencil size={20} className="text-sage-400" />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-2 hover:bg-red-50 rounded-full transition-colors"
                  aria-label="Delete book"
                >
                  <Trash2 size={20} className="text-red-400" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-sage-50 rounded-full transition-colors"
                  aria-label="Close"
                >
                  <X size={20} className="text-sage-400" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 md:gap-8 mb-6 md:mb-8">
              <div className="space-y-1">
                <span className="text-[10px] md:text-xs uppercase tracking-wider text-sage-400 font-bold">Progress</span>
                <div className="flex items-center gap-2 md:gap-3">
                  <Layers size={16} className="text-sage-600" />
                  <span className="text-base md:text-lg font-medium text-sage-800 leading-none">
                    {book.currentChapter} / {book.chapters}{' '}
                    <span className="hidden md:inline">Chapters</span>
                    {book.chapters > 0 && (
                      <span className="text-sage-400 text-sm ml-1">({progressPercent}%)</span>
                    )}
                  </span>
                </div>
                {book.chapters > 0 && (
                  <div className="mt-2 h-2 bg-sage-100 rounded-full overflow-hidden">
                    <div className="h-full bg-sage transition-all" style={{ width: `${progressPercent}%` }} />
                  </div>
                )}
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

            {book.status !== 'FINISHED' && book.chapters > 0 && (
              <div className="mb-8 p-4 bg-sage-50 rounded-2xl border border-sage-100">
                <h3 className="text-xs uppercase tracking-wider text-sage-400 font-bold mb-3">Log Reading</h3>
                <div className="flex flex-wrap gap-3 items-end">
                  <div>
                    <label className="text-[10px] text-sage-400 font-bold uppercase">Chapters</label>
                    <input
                      type="number"
                      min={1}
                      max={book.chapters - book.currentChapter}
                      value={chaptersRead}
                      onChange={(e) => setChaptersRead(Number(e.target.value))}
                      className="block w-20 px-3 py-2 rounded-lg border border-sage-100 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-sage-400 font-bold uppercase">Pages</label>
                    <input
                      type="number"
                      min={0}
                      value={pagesRead}
                      onChange={(e) => setPagesRead(Number(e.target.value))}
                      className="block w-20 px-3 py-2 rounded-lg border border-sage-100 text-sm mt-1"
                    />
                  </div>
                  <button
                    onClick={handleLogProgress}
                    className="px-4 py-2 bg-sage text-white rounded-xl text-sm font-bold hover:bg-sage-600 transition-colors"
                  >
                    Log Progress
                  </button>
                </div>
              </div>
            )}

            <div className="mb-8 md:mb-10">
              <h3 className="text-[10px] md:text-xs uppercase tracking-wider text-sage-400 font-bold mb-3 md:mb-4">
                Description
              </h3>
              <p className="text-sage-700 leading-relaxed font-serif italic text-base md:text-lg">
                {book.description || 'No description provided.'}
              </p>
            </div>

            <div className="space-y-8 pb-20 md:pb-0">
              <div className="flex flex-wrap gap-2">
                {book.genres.map((genre) => (
                  <span
                    key={genre}
                    className="px-2 py-1 bg-off-white border border-sage-100 rounded-lg text-sage-600 text-[10px] md:text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <Tag size={12} /> {genre}
                  </span>
                ))}
                {book.tropes.map((trope) => (
                  <span
                    key={trope}
                    className="px-2 py-1 bg-sage-50 border border-sage-200 rounded-lg text-sage-500 text-[10px] md:text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <span className="text-sage-300">#</span> {trope}
                  </span>
                ))}
                {book.moods.map((mood) => (
                  <span
                    key={mood}
                    className="px-2 py-1 bg-warm-cream border border-sage-100 rounded-lg text-sage-500 text-[10px] md:text-xs font-bold uppercase tracking-wider"
                  >
                    {mood}
                  </span>
                ))}
              </div>

              <div>
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <h3 className="text-[10px] md:text-xs uppercase tracking-wider text-sage-400 font-bold">
                    Saved Quotes
                  </h3>
                  <div className="flex gap-2 md:gap-4">
                    <button
                      onClick={() => setShowScanner(true)}
                      className="p-2 md:px-3 md:py-1.5 text-sage-500 hover:text-white hover:bg-sage border border-sage rounded-full md:rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
                      title="Scan Quote"
                    >
                      <Camera size={16} /> <span className="hidden md:inline">Scan Quote</span>
                    </button>
                    <button
                      onClick={() => setShowAddQuote(!showAddQuote)}
                      className="p-2 md:px-3 md:py-1.5 text-sage-500 hover:text-white hover:bg-sage border border-sage rounded-full md:rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
                      title="Add Quote"
                    >
                      <PlusCircle size={16} /> <span className="hidden md:inline">Add Quote</span>
                    </button>
                  </div>
                </div>

                {showAddQuote && (
                  <div className="mb-4 p-4 bg-sage-50 rounded-2xl space-y-3">
                    <textarea
                      value={quoteText}
                      onChange={(e) => setQuoteText(e.target.value)}
                      placeholder="Enter your favorite quote..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-sage-100 text-sm focus:outline-none focus:border-sage"
                    />
                    <div className="flex gap-3">
                      <input
                        type="number"
                        placeholder="Page (optional)"
                        value={quotePage}
                        onChange={(e) => setQuotePage(e.target.value)}
                        className="w-32 px-3 py-2 rounded-lg border border-sage-100 text-sm"
                      />
                      <button
                        onClick={handleAddQuote}
                        className="px-4 py-2 bg-sage text-white rounded-xl text-sm font-bold hover:bg-sage-600"
                      >
                        Save Quote
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {book.quotes.length > 0 ? (
                    book.quotes.map((quote) => (
                      <div
                        key={quote.id}
                        className="p-4 bg-off-white rounded-2xl border-l-4 border-sage-200 group relative shadow-sm"
                      >
                        <button
                          onClick={() => handleDeleteQuote(quote.id)}
                          className="absolute top-3 right-3 p-1 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity"
                          aria-label="Delete quote"
                        >
                          <Trash2 size={14} />
                        </button>
                        <p className="text-sage-800 font-serif italic mb-2 leading-relaxed text-sm md:text-base pr-6">
                          "{quote.text}"
                        </p>
                        <span className="text-[10px] md:text-xs text-sage-400 font-medium tracking-wide">
                          {quote.page ? `PAGE ${quote.page} • ` : ''}
                          {format(parseISO(quote.dateAdded), 'MMM d, yyyy').toUpperCase()}
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
      </div>

      {showScanner && (
        <Suspense
          fallback={
            <div className="fixed inset-0 z-[80] flex items-center justify-center bg-sage-900/60">
              <Loader2 className="animate-spin text-white" size={32} />
            </div>
          }
        >
          <OCRScanner
            onTextExtracted={handleQuoteExtracted}
            onClose={() => setShowScanner(false)}
            title="Scan Quote"
            hint="Upload a photo of the page"
          />
        </Suspense>
      )}

      {showEdit && (
        <BookFormModal isOpen={showEdit} onClose={() => setShowEdit(false)} book={book} mode="edit" />
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Book"
        message={`Are you sure you want to remove "${book.title}" from your library? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </>
  );
};

export default BookDetailsModal;
