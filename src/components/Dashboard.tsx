import React from 'react';
import { useBooks } from '../context/BookContext';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { Timer, Trophy, Calendar, BookOpen } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { books } = useBooks();

  // Stats Calculations
  const finishedBooks = books.filter(b => b.status === 'FINISHED');
  const inProgressBooks = books.filter(b => b.status === 'IN_PROGRESS');
  
  const genreCounts: Record<string, number> = {};
  books.forEach(b => {
    b.genres.forEach(g => {
      genreCounts[g] = (genreCounts[g] || 0) + 1;
    });
  });

  const genreData = Object.entries(genreCounts).map(([name, value]) => ({ name, value }));
  
  const COLORS = ['#B2AC88', '#94a178', '#758458', '#d7dbca', '#eceee2'];

  // Mock reading streak data
  const streakData = [
    { day: 'Mon', pages: 45 },
    { day: 'Tue', pages: 30 },
    { day: 'Wed', pages: 62 },
    { day: 'Thu', pages: 12 },
    { day: 'Fri', pages: 55 },
    { day: 'Sat', pages: 80 },
    { day: 'Sun', pages: 40 },
  ];

  // Estimation Logic
  const averageReadingSpeed = 1; // minutes per page
  const totalRemainingChapters = inProgressBooks.reduce((acc, b) => acc + (b.chapters - b.currentChapter), 0);
  const estimatedHoursLeft = (totalRemainingChapters * 20 * averageReadingSpeed) / 60; // Assuming 20 pages per chapter

  return (
    <div className="space-y-6 md:space-y-10 pb-12">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-sage-100">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-sage-50 text-sage-600 rounded-lg md:rounded-xl flex items-center justify-center mb-3 md:mb-4">
            <Trophy size={18} />
          </div>
          <div className="text-2xl md:text-3xl font-bold text-sage-800">{finishedBooks.length}</div>
          <div className="text-sage-500 text-xs md:text-sm">Finished</div>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-sage-100">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-sage-50 text-sage-600 rounded-lg md:rounded-xl flex items-center justify-center mb-3 md:mb-4">
            <BookOpen size={18} />
          </div>
          <div className="text-2xl md:text-3xl font-bold text-sage-800">{inProgressBooks.length}</div>
          <div className="text-sage-500 text-xs md:text-sm">Reading</div>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-sage-100">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-sage-50 text-sage-600 rounded-lg md:rounded-xl flex items-center justify-center mb-3 md:mb-4">
            <Calendar size={18} />
          </div>
          <div className="text-2xl md:text-3xl font-bold text-sage-800">12</div>
          <div className="text-sage-500 text-xs md:text-sm">Day Streak</div>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-sage-100">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-sage-50 text-sage-600 rounded-lg md:rounded-xl flex items-center justify-center mb-3 md:mb-4">
            <Timer size={18} />
          </div>
          <div className="text-2xl md:text-3xl font-bold text-sage-800">~{Math.round(estimatedHoursLeft)}h</div>
          <div className="text-sage-500 text-xs md:text-sm">To Finish</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Genre Chart */}
        <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-sm border border-sage-100 h-[300px] md:h-[400px]">
          <h3 className="text-lg font-serif font-bold text-sage-800 mb-4 md:mb-6">Genre Distribution</h3>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie
                data={genreData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {genreData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Progress */}
        <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-sm border border-sage-100 h-[300px] md:h-[400px]">
          <h3 className="text-lg font-serif font-bold text-sage-800 mb-4 md:mb-6">Weekly Reading Progress</h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={streakData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a178', fontSize: 10}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a178', fontSize: 10}} />
              <Tooltip 
                cursor={{fill: '#f6f7f2'}}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
              />
              <Bar dataKey="pages" fill="#B2AC88" radius={[4, 4, 0, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Mini Streak Calendar */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-sage-100">
        <h3 className="text-lg font-serif font-bold text-sage-800 mb-6">Reading Streak Calendar</h3>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 35 }).map((_, i) => (
            <div 
              key={i} 
              className={`w-6 h-6 rounded-md ${
                i < 12 ? 'bg-sage' : i < 18 ? 'bg-sage-100' : 'bg-off-white'
              } border border-sage-50 transition-all hover:scale-110 cursor-pointer`}
              title={`Day ${i + 1}: ${i < 12 ? 'Read' : 'No activity'}`}
            />
          ))}
        </div>
        <p className="mt-4 text-xs text-sage-400 font-medium italic">You're doing great! Keep the momentum going.</p>
      </div>
    </div>
  );
};

export default Dashboard;
