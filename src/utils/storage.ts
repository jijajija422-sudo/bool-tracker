import { Book, BookStatus, LibraryData, LibraryExport, ReadingSession } from '../types';

const STORAGE_KEY = 'book-tracker-library';
const CURRENT_VERSION = 2;

const VALID_STATUSES: BookStatus[] = ['TO_READ', 'IN_PROGRESS', 'FINISHED'];

function isValidStatus(value: unknown): value is BookStatus {
  return typeof value === 'string' && VALID_STATUSES.includes(value as BookStatus);
}

function normalizeBook(raw: unknown, index: number): Book | null {
  if (!raw || typeof raw !== 'object') return null;
  const b = raw as Record<string, unknown>;

  if (typeof b.id !== 'string' || typeof b.title !== 'string' || typeof b.author !== 'string') {
    return null;
  }

  const status = isValidStatus(b.status) ? b.status : 'TO_READ';

  return {
    id: b.id,
    title: b.title,
    author: b.author,
    coverUrl: typeof b.coverUrl === 'string' ? b.coverUrl : '',
    description: typeof b.description === 'string' ? b.description : '',
    chapters: typeof b.chapters === 'number' && b.chapters >= 0 ? b.chapters : 0,
    currentChapter: typeof b.currentChapter === 'number' && b.currentChapter >= 0 ? b.currentChapter : 0,
    genres: Array.isArray(b.genres) ? b.genres.filter((g): g is string => typeof g === 'string') : [],
    tropes: Array.isArray(b.tropes) ? b.tropes.filter((t): t is string => typeof t === 'string') : [],
    moods: Array.isArray(b.moods) ? b.moods.filter((m): m is string => typeof m === 'string') : [],
    status,
    order: typeof b.order === 'number' ? b.order : index,
    dateStarted: typeof b.dateStarted === 'string' ? b.dateStarted : undefined,
    dateFinished: typeof b.dateFinished === 'string' ? b.dateFinished : undefined,
    quotes: Array.isArray(b.quotes)
      ? b.quotes
          .filter((q): q is Record<string, unknown> => q && typeof q === 'object')
          .map((q) => ({
            id: typeof q.id === 'string' ? q.id : crypto.randomUUID?.() ?? String(Date.now()),
            text: typeof q.text === 'string' ? q.text : '',
            page: typeof q.page === 'number' ? q.page : undefined,
            dateAdded: typeof q.dateAdded === 'string' ? q.dateAdded : new Date().toISOString(),
          }))
          .filter((q) => q.text.length > 0)
      : [],
    rating: typeof b.rating === 'number' && b.rating >= 1 && b.rating <= 5 ? b.rating : undefined,
  };
}

function normalizeSession(raw: unknown): ReadingSession | null {
  if (!raw || typeof raw !== 'object') return null;
  const s = raw as Record<string, unknown>;

  if (typeof s.id !== 'string' || typeof s.bookId !== 'string' || typeof s.date !== 'string') {
    return null;
  }

  return {
    id: s.id,
    bookId: s.bookId,
    date: s.date,
    pagesRead: typeof s.pagesRead === 'number' && s.pagesRead >= 0 ? s.pagesRead : 0,
    durationMinutes: typeof s.durationMinutes === 'number' && s.durationMinutes >= 0 ? s.durationMinutes : 0,
  };
}

function assignOrders(books: Book[]): Book[] {
  const byStatus: Record<BookStatus, Book[]> = {
    TO_READ: [],
    IN_PROGRESS: [],
    FINISHED: [],
  };

  books.forEach((book) => byStatus[book.status].push(book));

  return VALID_STATUSES.flatMap((status) =>
    byStatus[status]
      .sort((a, b) => a.order - b.order)
      .map((book, index) => ({ ...book, order: index }))
  );
}

function migrateFromLegacyBooks(raw: unknown[]): LibraryData {
  const books = raw
    .map((item, index) => normalizeBook(item, index))
    .filter((b): b is Book => b !== null);

  return {
    version: CURRENT_VERSION,
    books: assignOrders(books),
    readingSessions: [],
  };
}

export function getSampleBooks(): Book[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'sample-1',
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
      order: 0,
      dateStarted: now,
      quotes: [
        { id: 'q1', text: 'Beauty is terror. Whatever we call beautiful, we quiver before it.', page: 42, dateAdded: now },
      ],
    },
    {
      id: 'sample-2',
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
      order: 0,
      quotes: [],
    },
    {
      id: 'sample-3',
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
      order: 0,
      dateStarted: now,
      dateFinished: now,
      rating: 5,
      quotes: [],
    },
  ];
}

export function loadLibrary(): LibraryData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<LibraryData>;
      if (parsed.version === CURRENT_VERSION && Array.isArray(parsed.books)) {
        const books = parsed.books
          .map((b, i) => normalizeBook(b, i))
          .filter((b): b is Book => b !== null);
        const readingSessions = Array.isArray(parsed.readingSessions)
          ? parsed.readingSessions.map(normalizeSession).filter((s): s is ReadingSession => s !== null)
          : [];
        return { version: CURRENT_VERSION, books: assignOrders(books), readingSessions };
      }
    }

    const legacy = localStorage.getItem('books');
    if (legacy) {
      const parsed = JSON.parse(legacy);
      if (Array.isArray(parsed)) {
        const migrated = migrateFromLegacyBooks(parsed);
        saveLibrary(migrated);
        localStorage.removeItem('books');
        return migrated;
      }
    }
  } catch {
    // fall through to empty library
  }

  return { version: CURRENT_VERSION, books: [], readingSessions: [] };
}

export function saveLibrary(data: LibraryData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save library:', err);
  }
}

export function exportLibrary(data: LibraryData): LibraryExport {
  return {
    version: CURRENT_VERSION,
    exportedAt: new Date().toISOString(),
    books: data.books,
    readingSessions: data.readingSessions,
  };
}

export function importLibrary(raw: unknown): LibraryData | null {
  if (!raw || typeof raw !== 'object') return null;
  const data = raw as Record<string, unknown>;

  if (!Array.isArray(data.books)) return null;

  const books = data.books
    .map((b, i) => normalizeBook(b, i))
    .filter((b): b is Book => b !== null);

  const readingSessions = Array.isArray(data.readingSessions)
    ? data.readingSessions.map(normalizeSession).filter((s): s is ReadingSession => s !== null)
    : [];

  return {
    version: CURRENT_VERSION,
    books: assignOrders(books),
    readingSessions,
  };
}

export function getNextOrder(books: Book[], status: BookStatus): number {
  const inColumn = books.filter((b) => b.status === status);
  if (inColumn.length === 0) return 0;
  return Math.max(...inColumn.map((b) => b.order)) + 1;
}
