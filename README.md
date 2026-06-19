# 📚 Book Tracker

> *Your personal literary companion for organizing, tracking, and celebrating your reading journey*

## ✨ What is Book Tracker?

Book Tracker is a beautifully designed web application that transforms how you manage your book collection. Whether you're a voracious reader juggling multiple books at once or someone building their dream library, Book Tracker keeps everything organized and helps you visualize your reading progress in real-time.

Think of it as a **personal library management system** that's as enjoyable to use as it is powerful. 📖

---

## 🎯 Key Features

### 📋 **Kanban Board View**
Organize your books visually on an intuitive board. Drag and drop books between different reading statuses:
- 📌 **To Read** - Books waiting for your attention
- 📖 **In Progress** - Currently reading
- ✅ **Finished** - Books you've completed

It's satisfying to move that book to "Finished"! 🎉

### 📸 **Smart OCR Scanner**
Can't remember your book's exact title? No problem!
- Snap a photo of your book cover or ISBN
- Our OCR technology instantly recognizes the text
- Books are auto-populated with their data
- Perfect for quickly adding books from your physical shelf

### 📊 **Reading Insights Dashboard**
Get the full picture of your reading habits:
- **Reading Statistics** - Total books, currently reading, finished count
- **Genre Distribution** - See which genres dominate your collection (pie chart)
- **Reading Timeline** - Track your progress over time (bar chart)
- **Personal Milestones** - Celebrate reading achievements

Watch your data tell the story of your literary adventures! 📈

### 🎨 **Beautiful, Responsive Design**
- Elegant UI with a warm, book-friendly aesthetic
- Works seamlessly on desktop, tablet, and mobile
- Tailwind CSS for modern, smooth styling
- Intuitive navigation and smooth interactions

### 💾 **Comprehensive Book Management**
- Add books with custom details (title, author, genre, dates)
- View detailed book information
- Track reading status and completion dates
- Organize by genre and author
- Full edit and delete capabilities

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/book-tracker.git
   cd book-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open in your browser**
   - Navigate to `http://localhost:5173`
   - Start adding books and building your library! 🎊

---

## 📦 What's Inside

### Tech Stack
- **Frontend:** React 18 with TypeScript
- **Build Tool:** Vite (lightning-fast development)
- **Styling:** Tailwind CSS + PostCSS
- **Drag & Drop:** @dnd-kit (smooth, accessible)
- **OCR Recognition:** Tesseract.js (text recognition)
- **Charts & Graphs:** Recharts (beautiful visualizations)
- **Icons:** Lucide React (crisp, modern icons)
- **Date Handling:** date-fns (reliable date operations)

### Project Structure
```
src/
├── components/        # React components (Board, Dashboard, Modals, etc.)
├── context/          # React Context for state management
├── hooks/            # Custom React hooks
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
├── assets/           # Images and static files
├── main.tsx          # Entry point
└── App.tsx           # Main app component
```

---

## 🛠️ Development

### Available Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production (optimized) |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint to check code quality |

### Development Workflow
```bash
# Watch mode - changes auto-reload in browser
npm run dev

# Before committing - ensure code passes linting
npm run lint

# Build when ready for deployment
npm run build
```

---

## 📖 How to Use

### Adding Books

**Method 1: Manual Entry**
- Click "Add Book" button
- Fill in title, author, genres, and reading status
- Set dates when you started/finished
- Click Save - your book is now in the library!

**Method 2: Smart OCR Scanner**
- Click the camera icon
- Point at a book cover or ISBN
- Watch as Book Tracker recognizes the text
- Confirm and add - that easy! 📸

### Organizing Your Library

1. **Navigate to the Board View** to see all your books
2. **Drag books** between columns to update their reading status
3. **View details** by clicking on any book card
4. **Switch to Dashboard** to see your reading statistics
5. **Analyze trends** and celebrate your reading achievements

### Dashboard Insights

- **Quick Stats** - See your reading count at a glance
- **Genre Breakdown** - Discover your reading preferences
- **Progress Chart** - Track books finished over time
- **Total Reading Time** - Understand your reading habits

---

## 💡 Why Book Tracker?

✅ **Stay Organized** - Never lose track of your books again  
✅ **Visual Progress** - Watch your library grow  
✅ **Habit Tracking** - See your reading patterns  
✅ **Smart Features** - OCR technology saves time  
✅ **Beautiful Design** - Aesthetically pleasing to use daily  
✅ **Responsive** - Works anywhere, anytime  

---

## 🎓 Learning Features

This project is also a great example of:
- Modern React patterns with TypeScript
- Context API for state management
- Drag-and-drop interactions with dnd-kit
- Data visualization with Recharts
- OCR integration with Tesseract.js
- Responsive design with Tailwind CSS
- Component composition and reusability

---

## 🐛 Troubleshooting

**OCR not working?**
- Ensure good lighting on the book cover
- Try different angles
- The text should be clear and readable

**Books not dragging?**
- Try clicking and holding for a moment before dragging
- Ensure you're using a modern browser

**Charts not showing?**
- Make sure you have books in your library
- Try switching tabs and back

---

## 🤝 Contributing

Have ideas to make Book Tracker better?

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is open source. Feel free to use it, modify it, and share it with fellow book lovers! 📚

---

## 🌟 Support This Project

If you love Book Tracker:
- ⭐ Star this repository
- 📤 Share it with other readers
- 🐛 Report bugs or suggest features
- 💬 Share your feedback

---

## 👨‍💻 Built with ❤️

Created for book lovers, by someone who understands the joy of tracking literary adventures.

Happy reading! 📚✨

---

*Last updated: June 2026*
