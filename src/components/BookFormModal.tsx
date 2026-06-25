import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { Check, Camera, Loader2 } from 'lucide-react';
import { Book, BookStatus } from '../types';
import { useBooks } from '../context/BookContext';
import Modal from './Modal';

const OCRScanner = lazy(() => import('./OCRScanner'));

const DEFAULT_COVER =
  'https://images.unsplash.com/photo-1543004471-240ce440076a?q=80&w=800&auto=format&fit=crop';

interface BookFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  book?: Book;
  mode: 'add' | 'edit';
}

function parseList(value: string): string[] {
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

const BookFormModal: React.FC<BookFormModalProps> = ({ isOpen, onClose, book, mode }) => {
  const { addBook, updateBook, books } = useBooks();

  // Extract unique tags for autocomplete suggestions
  const existingGenres = useMemo(() => {
    const set = new Set<string>();
    books.forEach((b) => b.genres.forEach((g) => set.add(g)));
    return Array.from(set).sort();
  }, [books]);

  const existingTropes = useMemo(() => {
    const set = new Set<string>();
    books.forEach((b) => b.tropes.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [books]);

  const existingMoods = useMemo(() => {
    const set = new Set<string>();
    books.forEach((b) => b.moods.forEach((m) => set.add(m)));
    return Array.from(set).sort();
  }, [books]);

  const handleAddTag = (field: 'genres' | 'tropes' | 'moods', tag: string) => {
    const currentVal = formData[field];
    const tags = currentVal
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (!tags.some((t) => t.toLowerCase() === tag.toLowerCase())) {
      tags.push(tag);
      setFormData((prev) => ({
        ...prev,
        [field]: tags.join(', '),
      }));
    }
  };
  const [showScanner, setShowScanner] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    chapters: 0,
    genres: '',
    tropes: '',
    moods: '',
    coverUrl: '',
    status: 'TO_READ' as BookStatus,
    rating: 0,
  });

  useEffect(() => {
    if (!isOpen) return;
    setFormData({
      title: book?.title ?? '',
      author: book?.author ?? '',
      description: book?.description ?? '',
      chapters: book?.chapters ?? 0,
      genres: book?.genres.join(', ') ?? '',
      tropes: book?.tropes.join(', ') ?? '',
      moods: book?.moods.join(', ') ?? '',
      coverUrl: book?.coverUrl ?? '',
      status: book?.status ?? 'TO_READ',
      rating: book?.rating ?? 0,
    });
    setErrors({});
  }, [isOpen, book, mode]);

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!formData.title.trim()) next.title = 'Title is required';
    if (!formData.author.trim()) next.author = 'Author is required';
    if (formData.chapters < 0) next.chapters = 'Chapters cannot be negative';
    if (formData.coverUrl && !/^https?:\/\/.+/.test(formData.coverUrl)) {
      next.coverUrl = 'Cover URL must start with http:// or https://';
    }
    if (formData.rating < 0 || formData.rating > 5) next.rating = 'Rating must be between 0 and 5';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const shared = {
      title: formData.title.trim(),
      author: formData.author.trim(),
      description: formData.description.trim(),
      chapters: Number(formData.chapters),
      genres: parseList(formData.genres),
      tropes: parseList(formData.tropes),
      moods: parseList(formData.moods),
      coverUrl: formData.coverUrl.trim() || DEFAULT_COVER,
      status: formData.status,
      rating: formData.rating > 0 ? formData.rating : undefined,
    };

    if (mode === 'edit' && book) {
      updateBook({
        ...book,
        ...shared,
        currentChapter: Math.min(book.currentChapter, Number(formData.chapters)),
      });
    } else {
      addBook({
        ...shared,
        currentChapter: 0,
        quotes: [],
      });
    }
    onClose();
  };

  const handleOCRResult = (text: string) => {
    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 2);

    const title = lines[0] ?? '';
    const author = lines.find((l) => l.toLowerCase().includes('by '))?.replace(/^by\s+/i, '') ?? lines[1] ?? '';

    setFormData((prev) => ({
      ...prev,
      title: title || prev.title,
      author: author || prev.author,
    }));
    setShowScanner(false);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={mode === 'add' ? 'Add New Book' : 'Edit Book'}
        size="lg"
      >
        {mode === 'add' && (
          <button
            type="button"
            onClick={() => setShowScanner(true)}
            className="w-full mb-6 py-3 px-4 rounded-xl border-2 border-dashed border-sage-200 text-sage-600 font-medium hover:bg-sage-50 transition-colors flex items-center justify-center gap-2"
          >
            <Camera size={18} />
            Scan book cover to auto-fill
          </button>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6 -mt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-1">
              <label htmlFor="title" className="text-[10px] md:text-xs uppercase tracking-wider text-sage-400 font-bold">
                Title
              </label>
              <input
                id="title"
                required
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-sage-100 focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage text-sm md:text-base"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              {errors.title && <p className="text-red-500 text-xs">{errors.title}</p>}
            </div>
            <div className="space-y-1">
              <label htmlFor="author" className="text-[10px] md:text-xs uppercase tracking-wider text-sage-400 font-bold">
                Author
              </label>
              <input
                id="author"
                required
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-sage-100 focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage text-sm md:text-base"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              />
              {errors.author && <p className="text-red-500 text-xs">{errors.author}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="description" className="text-[10px] md:text-xs uppercase tracking-wider text-sage-400 font-bold">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-sage-100 focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage text-sm md:text-base"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="space-y-1">
              <label htmlFor="chapters" className="text-[10px] md:text-xs uppercase tracking-wider text-sage-400 font-bold">
                Chapters
              </label>
              <input
                id="chapters"
                type="number"
                min={0}
                className="w-full px-4 py-3 rounded-xl border border-sage-100 focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage text-sm md:text-base"
                value={formData.chapters}
                onChange={(e) => setFormData({ ...formData, chapters: Number(e.target.value) })}
              />
              {errors.chapters && <p className="text-red-500 text-xs">{errors.chapters}</p>}
            </div>
            <div className="space-y-1">
              <label htmlFor="status" className="text-[10px] md:text-xs uppercase tracking-wider text-sage-400 font-bold">
                Status
              </label>
              <select
                id="status"
                className="w-full px-4 py-3 rounded-xl border border-sage-100 focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage text-sm md:text-base bg-white"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as BookStatus })}
              >
                <option value="TO_READ">To Read</option>
                <option value="IN_PROGRESS">Reading</option>
                <option value="FINISHED">Finished</option>
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="rating" className="text-[10px] md:text-xs uppercase tracking-wider text-sage-400 font-bold">
                Rating (0–5)
              </label>
              <input
                id="rating"
                type="number"
                min={0}
                max={5}
                step={0.5}
                className="w-full px-4 py-3 rounded-xl border border-sage-100 focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage text-sm md:text-base"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="coverUrl" className="text-[10px] md:text-xs uppercase tracking-wider text-sage-400 font-bold">
              Cover URL
            </label>
            <input
              id="coverUrl"
              type="url"
              placeholder="https://..."
              className="w-full px-4 py-3 rounded-xl border border-sage-100 focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage text-sm md:text-base"
              value={formData.coverUrl}
              onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
            />
            {errors.coverUrl && <p className="text-red-500 text-xs">{errors.coverUrl}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="space-y-1">
              <label htmlFor="genres" className="text-[10px] md:text-xs uppercase tracking-wider text-sage-400 font-bold">
                Genres
              </label>
              <input
                id="genres"
                type="text"
                placeholder="Fantasy, Mystery"
                className="w-full px-4 py-3 rounded-xl border border-sage-100 focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage text-sm md:text-base dark:bg-sage-950 dark:border-sage-800 text-sage-900 dark:text-sage-100"
                value={formData.genres}
                onChange={(e) => setFormData({ ...formData, genres: e.target.value })}
              />
              {existingGenres.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5 max-h-20 overflow-y-auto pr-1 custom-scrollbar">
                  {existingGenres
                    .filter((g) => {
                      const current = formData.genres.split(',').map((s) => s.trim().toLowerCase());
                      return !current.includes(g.toLowerCase());
                    })
                    .slice(0, 6)
                    .map((genre) => (
                      <button
                        key={genre}
                        type="button"
                        onClick={() => handleAddTag('genres', genre)}
                        className="px-2 py-0.5 rounded bg-sage-50 dark:bg-sage-900/40 text-sage-600 dark:text-sage-400 border border-sage-100 dark:border-sage-800/80 hover:bg-sage-100 dark:hover:bg-sage-900 text-[10px] font-semibold transition-colors"
                      >
                        + {genre}
                      </button>
                    ))}
                </div>
              )}
            </div>
            <div className="space-y-1">
              <label htmlFor="tropes" className="text-[10px] md:text-xs uppercase tracking-wider text-sage-400 font-bold">
                Tropes
              </label>
              <input
                id="tropes"
                type="text"
                placeholder="Dark Academia, Found Family"
                className="w-full px-4 py-3 rounded-xl border border-sage-100 focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage text-sm md:text-base dark:bg-sage-950 dark:border-sage-800 text-sage-900 dark:text-sage-100"
                value={formData.tropes}
                onChange={(e) => setFormData({ ...formData, tropes: e.target.value })}
              />
              {existingTropes.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5 max-h-20 overflow-y-auto pr-1 custom-scrollbar">
                  {existingTropes
                    .filter((t) => {
                      const current = formData.tropes.split(',').map((s) => s.trim().toLowerCase());
                      return !current.includes(t.toLowerCase());
                    })
                    .slice(0, 6)
                    .map((trope) => (
                      <button
                        key={trope}
                        type="button"
                        onClick={() => handleAddTag('tropes', trope)}
                        className="px-2 py-0.5 rounded bg-sage-50 dark:bg-sage-900/40 text-sage-600 dark:text-sage-400 border border-sage-100 dark:border-sage-800/80 hover:bg-sage-100 dark:hover:bg-sage-900 text-[10px] font-semibold transition-colors"
                      >
                        + {trope}
                      </button>
                    ))}
                </div>
              )}
            </div>
            <div className="space-y-1">
              <label htmlFor="moods" className="text-[10px] md:text-xs uppercase tracking-wider text-sage-400 font-bold">
                Moods
              </label>
              <input
                id="moods"
                type="text"
                placeholder="Melancholic, Lyrical"
                className="w-full px-4 py-3 rounded-xl border border-sage-100 focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage text-sm md:text-base dark:bg-sage-950 dark:border-sage-800 text-sage-900 dark:text-sage-100"
                value={formData.moods}
                onChange={(e) => setFormData({ ...formData, moods: e.target.value })}
              />
              {existingMoods.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5 max-h-20 overflow-y-auto pr-1 custom-scrollbar">
                  {existingMoods
                    .filter((m) => {
                      const current = formData.moods.split(',').map((s) => s.trim().toLowerCase());
                      return !current.includes(m.toLowerCase());
                    })
                    .slice(0, 6)
                    .map((mood) => (
                      <button
                        key={mood}
                        type="button"
                        onClick={() => handleAddTag('moods', mood)}
                        className="px-2 py-0.5 rounded bg-sage-50 dark:bg-sage-900/40 text-sage-600 dark:text-sage-400 border border-sage-100 dark:border-sage-800/80 hover:bg-sage-100 dark:hover:bg-sage-900 text-[10px] font-semibold transition-colors"
                      >
                        + {mood}
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 px-4 rounded-2xl bg-sage text-white font-bold hover:bg-sage-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-sage/20 mt-4 text-sm md:text-base"
          >
            <Check size={20} />
            {mode === 'add' ? 'Add to My Shelf' : 'Save Changes'}
          </button>
        </form>
      </Modal>

      {showScanner && (
        <Suspense
          fallback={
            <div className="fixed inset-0 z-[80] flex items-center justify-center bg-sage-900/60">
              <Loader2 className="animate-spin text-white" size={32} />
            </div>
          }
        >
          <OCRScanner
            onTextExtracted={handleOCRResult}
            onClose={() => setShowScanner(false)}
            title="Scan Book Cover"
            hint="Point at the book cover — title and author will be auto-filled."
          />
        </Suspense>
      )}
    </>
  );
};

export default BookFormModal;
