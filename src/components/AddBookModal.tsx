import React, { useState } from 'react';
import { X, Upload, Check } from 'lucide-react';
import { useBooks } from '../context/BookContext';
import { Book } from '../types';

interface AddBookModalProps {
  onClose: () => void;
}

const AddBookModal: React.FC<AddBookModalProps> = ({ onClose }) => {
  const { addBook } = useBooks();
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    chapters: 0,
    genres: '',
    tropes: '',
    coverUrl: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newBook: Book = {
      id: Math.random().toString(36).substr(2, 9),
      title: formData.title,
      author: formData.author,
      description: formData.description,
      chapters: Number(formData.chapters),
      currentChapter: 0,
      genres: formData.genres.split(',').map(g => g.trim()).filter(g => g),
      tropes: formData.tropes.split(',').map(t => t.trim()).filter(t => t),
      moods: [],
      status: 'TO_READ',
      quotes: [],
      coverUrl: formData.coverUrl || 'https://images.unsplash.com/photo-1543004471-240ce440076a?q=80&w=800&auto=format&fit=crop',
    };

    addBook(newBook);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-sage-900 bg-opacity-40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-6 md:p-8">
        <div className="flex justify-between items-center mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-serif font-bold text-sage-900">Add New Book</h2>
          <button onClick={onClose} className="p-2 hover:bg-sage-50 rounded-full transition-colors">
            <X size={24} className="text-sage-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-1">
              <label className="text-[10px] md:text-xs uppercase tracking-wider text-sage-400 font-bold">Title</label>
              <input 
                required
                type="text" 
                className="w-full px-4 py-3 rounded-xl border border-sage-100 focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage text-sm md:text-base"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] md:text-xs uppercase tracking-wider text-sage-400 font-bold">Author</label>
              <input 
                required
                type="text" 
                className="w-full px-4 py-3 rounded-xl border border-sage-100 focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage text-sm md:text-base"
                value={formData.author}
                onChange={e => setFormData({ ...formData, author: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] md:text-xs uppercase tracking-wider text-sage-400 font-bold">Description</label>
            <textarea 
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-sage-100 focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage text-sm md:text-base"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-1">
              <label className="text-[10px] md:text-xs uppercase tracking-wider text-sage-400 font-bold">Chapters</label>
              <input 
                type="number" 
                className="w-full px-4 py-3 rounded-xl border border-sage-100 focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage text-sm md:text-base"
                value={formData.chapters}
                onChange={e => setFormData({ ...formData, chapters: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] md:text-xs uppercase tracking-wider text-sage-400 font-bold">Cover URL</label>
              <input 
                type="text" 
                placeholder="https://..."
                className="w-full px-4 py-3 rounded-xl border border-sage-100 focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage text-sm md:text-base"
                value={formData.coverUrl}
                onChange={e => setFormData({ ...formData, coverUrl: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-1">
              <label className="text-[10px] md:text-xs uppercase tracking-wider text-sage-400 font-bold">Genres (comma separated)</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 rounded-xl border border-sage-100 focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage text-sm md:text-base"
                value={formData.genres}
                onChange={e => setFormData({ ...formData, genres: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] md:text-xs uppercase tracking-wider text-sage-400 font-bold">Tropes (comma separated)</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 rounded-xl border border-sage-100 focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage text-sm md:text-base"
                value={formData.tropes}
                onChange={e => setFormData({ ...formData, tropes: e.target.value })}
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-4 px-4 rounded-2xl bg-sage text-white font-bold hover:bg-sage-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-sage/20 mt-4 text-sm md:text-base"
          >
            <Check size={20} />
            Add to My Shelf
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddBookModal;
