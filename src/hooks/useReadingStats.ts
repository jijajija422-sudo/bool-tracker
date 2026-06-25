import { useMemo } from 'react';
import {
  format,
  subDays,
  startOfDay,
  eachDayOfInterval,
  isSameDay,
  parseISO,
  startOfMonth,
  endOfMonth,
} from 'date-fns';
import { Book, ReadingSession } from '../types';

export interface WeeklyPageData {
  day: string;
  pages: number;
  date: string;
}

export interface ReadingStats {
  totalBooks: number;
  finishedBooks: Book[];
  inProgressBooks: Book[];
  toReadBooks: Book[];
  genreData: { name: string; value: number }[];
  weeklyPages: WeeklyPageData[];
  readingStreak: number;
  estimatedHoursLeft: number;
  calendarDays: { date: Date; hasActivity: boolean; pages: number }[];
  totalPagesThisMonth: number;
  averageRating: number | null;
  booksFinishedThisMonth: number;
  yearlyReadingGoal: number;
  finishedBooksThisYear: number;
  recentSessions: (ReadingSession & { bookTitle: string })[];
  randomQuote: { text: string; author: string; page?: number } | null;
}

export function useReadingStats(
  books: Book[],
  sessions: ReadingSession[],
  yearlyGoal: number = 12
): ReadingStats {
  return useMemo(() => {
    const finishedBooks = books.filter((b) => b.status === 'FINISHED');
    const inProgressBooks = books.filter((b) => b.status === 'IN_PROGRESS');
    const toReadBooks = books.filter((b) => b.status === 'TO_READ');

    const genreCounts: Record<string, number> = {};
    books.forEach((b) => {
      b.genres.forEach((g) => {
        genreCounts[g] = (genreCounts[g] || 0) + 1;
      });
    });
    const genreData = Object.entries(genreCounts).map(([name, value]) => ({ name, value }));

    const today = startOfDay(new Date());
    const weekStart = subDays(today, 6);
    const weekDays = eachDayOfInterval({ start: weekStart, end: today });

    const weeklyPages: WeeklyPageData[] = weekDays.map((day) => {
      const pages = sessions
        .filter((s) => isSameDay(parseISO(s.date), day))
        .reduce((sum, s) => sum + s.pagesRead, 0);
      return {
        day: format(day, 'EEE'),
        pages,
        date: format(day, 'yyyy-MM-dd'),
      };
    });

    let readingStreak = 0;
    for (let daysBack = 0; daysBack < 365; daysBack++) {
      const checkDate = subDays(today, daysBack);
      const hasActivity = sessions.some((s) => isSameDay(parseISO(s.date), checkDate));
      if (!hasActivity) break;
      readingStreak++;
    }

    const averageReadingSpeed = 1;
    const totalRemainingChapters = inProgressBooks.reduce(
      (acc, b) => acc + Math.max(0, b.chapters - b.currentChapter),
      0
    );
    const estimatedHoursLeft = (totalRemainingChapters * 20 * averageReadingSpeed) / 60;

    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const calendarDays = monthDays.map((date) => {
      const daySessions = sessions.filter((s) => isSameDay(parseISO(s.date), date));
      const pages = daySessions.reduce((sum, s) => sum + s.pagesRead, 0);
      return { date, hasActivity: pages > 0, pages };
    });

    const totalPagesThisMonth = sessions
      .filter((s) => {
        const d = parseISO(s.date);
        return d >= monthStart && d <= monthEnd;
      })
      .reduce((sum, s) => sum + s.pagesRead, 0);

    const ratedBooks = finishedBooks.filter((b) => b.rating !== undefined);
    const averageRating =
      ratedBooks.length > 0
        ? ratedBooks.reduce((sum, b) => sum + (b.rating ?? 0), 0) / ratedBooks.length
        : null;

    const booksFinishedThisMonth = finishedBooks.filter((b) => {
      if (!b.dateFinished) return false;
      const d = parseISO(b.dateFinished);
      return d >= monthStart && d <= monthEnd;
    }).length;

    // 1. Calculate books finished this year
    const currentYear = new Date().getFullYear();
    const finishedBooksThisYear = finishedBooks.filter((b) => {
      if (!b.dateFinished) return false;
      try {
        return parseISO(b.dateFinished).getFullYear() === currentYear;
      } catch {
        return false;
      }
    }).length;

    // 2. Fetch recent sessions
    const recentSessions = [...sessions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map((session) => {
        const book = books.find((b) => b.id === session.bookId);
        return {
          ...session,
          bookTitle: book ? book.title : 'Deleted Book',
        };
      });

    // 3. Featured Quote of the Day
    const allQuotes: { text: string; author: string; page?: number }[] = [];
    books.forEach((b) => {
      if (Array.isArray(b.quotes)) {
        b.quotes.forEach((q) => {
          allQuotes.push({
            text: q.text,
            author: b.author,
            page: q.page,
          });
        });
      }
    });

    let randomQuote: { text: string; author: string; page?: number } | null = null;
    if (allQuotes.length > 0) {
      const dayOfYear = Math.floor(
        (new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
      );
      const index = dayOfYear % allQuotes.length;
      randomQuote = allQuotes[index];
    }

    return {
      totalBooks: books.length,
      finishedBooks,
      inProgressBooks,
      toReadBooks,
      genreData,
      weeklyPages,
      readingStreak,
      estimatedHoursLeft,
      calendarDays,
      totalPagesThisMonth,
      averageRating,
      booksFinishedThisMonth,
      yearlyReadingGoal: yearlyGoal,
      finishedBooksThisYear,
      recentSessions,
      randomQuote,
    };
  }, [books, sessions, yearlyGoal]);
}
