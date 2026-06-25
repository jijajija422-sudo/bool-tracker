import React from 'react';
import { useBooks } from '../context/BookContext';
import { useReadingStats } from '../hooks/useReadingStats';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { Timer, Trophy, Calendar, BookOpen, Star, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

const COLORS = ['#B2AC88', '#94a178', '#758458', '#d7dbca', '#eceee2'];

const Dashboard: React.FC = () => {
  const { books, readingSessions } = useBooks();
  const stats = useReadingStats(books, readingSessions);

  if (books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-20">
        <BookOpen className="text-sage-200 mb-4" size={48} />
        <h3 className="text-xl font-serif text-sage-700 mb-2">No reading data yet</h3>
        <p className="text-sage-400 italic max-w-sm">
          Add books to your shelf and log reading progress to see your insights here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-10 pb-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <StatCard icon={<Trophy size={18} />} value={stats.finishedBooks.length} label="Finished" />
        <StatCard icon={<BookOpen size={18} />} value={stats.inProgressBooks.length} label="Reading" />
        <StatCard icon={<Calendar size={18} />} value={stats.readingStreak} label="Day Streak" />
        <StatCard
          icon={<Timer size={18} />}
          value={`~${Math.round(stats.estimatedHoursLeft)}h`}
          label="To Finish"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <StatCard icon={<TrendingUp size={18} />} value={stats.totalPagesThisMonth} label="Pages This Month" />
        <StatCard icon={<Trophy size={18} />} value={stats.booksFinishedThisMonth} label="Finished This Month" />
        <StatCard
          icon={<Star size={18} />}
          value={stats.averageRating !== null ? stats.averageRating.toFixed(1) : '—'}
          label="Avg Rating"
        />
        <StatCard icon={<BookOpen size={18} />} value={stats.totalBooks} label="Total Books" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-sm border border-sage-100 h-[300px] md:h-[400px]">
          <h3 className="text-lg font-serif font-bold text-sage-800 mb-4 md:mb-6">Genre Distribution</h3>
          {stats.genreData.length > 0 ? (
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={stats.genreData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.genreData.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="Add genres to your books to see distribution." />
          )}
        </div>

        <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-sm border border-sage-100 h-[300px] md:h-[400px]">
          <h3 className="text-lg font-serif font-bold text-sage-800 mb-4 md:mb-6">Weekly Reading Progress</h3>
          {stats.weeklyPages.some((d) => d.pages > 0) ? (
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={stats.weeklyPages}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a178', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a178', fontSize: 10 }} />
                <Tooltip
                  cursor={{ fill: '#f6f7f2' }}
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  }}
                />
                <Bar dataKey="pages" fill="#B2AC88" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="Log reading progress on a book to track weekly pages." />
          )}
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-sage-100">
        <h3 className="text-lg font-serif font-bold text-sage-800 mb-6">Reading Activity Calendar</h3>
        <div className="flex flex-wrap gap-2">
          {stats.calendarDays.map((day) => (
            <div
              key={day.date.toISOString()}
              className={`w-6 h-6 rounded-md transition-all hover:scale-110 cursor-default border border-sage-50 ${
                day.hasActivity
                  ? day.pages >= 50
                    ? 'bg-sage'
                    : 'bg-sage-200'
                  : 'bg-off-white'
              }`}
              title={`${format(day.date, 'MMM d')}: ${day.hasActivity ? `${day.pages} pages` : 'No activity'}`}
            />
          ))}
        </div>
        <p className="mt-4 text-xs text-sage-400 font-medium italic">
          {stats.readingStreak > 0
            ? `${stats.readingStreak}-day streak — keep the momentum going!`
            : 'Start logging progress to build your reading streak.'}
        </p>
      </div>
    </div>
  );
};

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
}) {
  return (
    <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-sage-100">
      <div className="w-8 h-8 md:w-10 md:h-10 bg-sage-50 text-sage-600 rounded-lg md:rounded-xl flex items-center justify-center mb-3 md:mb-4">
        {icon}
      </div>
      <div className="text-2xl md:text-3xl font-bold text-sage-800">{value}</div>
      <div className="text-sage-500 text-xs md:text-sm">{label}</div>
    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="h-[90%] flex items-center justify-center">
      <p className="text-sage-400 text-sm italic text-center px-8">{message}</p>
    </div>
  );
}

export default Dashboard;
