export type BookStatus = 'TO_READ' | 'IN_PROGRESS' | 'FINISHED' | string;

export interface Quote {
  id: string;
  text: string;
  page?: number;
  dateAdded: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  description: string;
  chapters: number;
  currentChapter: number;
  genres: string[];
  tropes: string[];
  moods: string[];
  status: BookStatus;
  dateStarted?: string;
  dateFinished?: string;
  quotes: Quote[];
  rating?: number;
}

export interface ReadingSession {
  id: string;
  bookId: string;
  date: string;
  pagesRead: number;
  durationMinutes: number;
}
