import React, { useRef, useState } from 'react';
import { Download, Upload, Trash2, BookOpen, AlertCircle } from 'lucide-react';
import { useBooks } from '../context/BookContext';
import Modal from './Modal';
import ConfirmDialog from './ConfirmDialog';
import { cn } from '../utils/cn';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    exportData,
    importData,
    loadSampleData,
    clearLibrary,
    books,
    yearlyGoal,
    updateYearlyGoal,
  } = useBooks();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmSample, setConfirmSample] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains('dark')
  );

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `book-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage({ type: 'success', text: 'Library exported successfully.' });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const raw = JSON.parse(event.target?.result as string);
        if (importData(raw)) {
          setMessage({ type: 'success', text: 'Library imported successfully.' });
        } else {
          setMessage({ type: 'error', text: 'Invalid backup file format.' });
        }
      } catch {
        setMessage({ type: 'error', text: 'Could not parse the file.' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Settings" size="md">
        <div className="space-y-6 -mt-2">
          <div className="p-4 bg-sage-50 dark:bg-sage-900/40 rounded-2xl border border-sage-100 dark:border-sage-800/80">
            <p className="text-sm text-sage-600 dark:text-sage-300">
              <span className="font-bold text-sage-800 dark:text-sage-100">{books.length}</span> books in your library.
              Data is saved locally in your browser.
            </p>
          </div>

          {/* Preferences (Reading Goal & Dark Mode) */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-wider text-sage-400 font-bold">Preferences</h3>

            {/* Yearly Goal Input */}
            <div className="flex items-center justify-between p-4 bg-sage-50 dark:bg-sage-900/30 rounded-2xl border border-sage-100 dark:border-sage-800/50">
              <div className="space-y-0.5">
                <span className="text-sm font-semibold text-sage-800 dark:text-sage-100">Yearly Reading Goal</span>
                <p className="text-[10px] md:text-xs text-sage-500">How many books do you want to finish this year?</p>
              </div>
              <input
                type="number"
                min={1}
                value={yearlyGoal}
                onChange={(e) => updateYearlyGoal(Number(e.target.value))}
                className="w-16 px-2 py-1.5 rounded-xl border border-sage-100 dark:border-sage-800 bg-white dark:bg-sage-950 text-sage-900 dark:text-sage-100 text-sm font-bold text-center focus:outline-none focus:border-sage"
              />
            </div>

            {/* Cozy Dark Mode Toggle */}
            <div className="flex items-center justify-between p-4 bg-sage-50 dark:bg-sage-900/30 rounded-2xl border border-sage-100 dark:border-sage-800/50">
              <div className="space-y-0.5">
                <span className="text-sm font-semibold text-sage-800 dark:text-sage-100">Cozy Dark Mode</span>
                <p className="text-[10px] md:text-xs text-sage-500">Cozy warm aesthetic for night browsing</p>
              </div>
              <button
                type="button"
                onClick={toggleDarkMode}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sage focus:ring-offset-2",
                  isDarkMode ? "bg-sage" : "bg-sage-200"
                )}
                role="switch"
                aria-checked={isDarkMode}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                    isDarkMode ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>
          </div>

          {message && (
            <div
              className={`p-4 rounded-xl flex items-center gap-3 text-sm ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'
              }`}
            >
              <AlertCircle size={18} />
              {message.text}
            </div>
          )}

          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-wider text-sage-400 font-bold">Backup & Restore</h3>
            <button
              onClick={handleExport}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-sage-100 text-sage-700 hover:bg-sage-50 transition-colors"
            >
              <Download size={20} className="text-sage-500" />
              <span>Export library as JSON</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-sage-100 text-sage-700 hover:bg-sage-50 transition-colors"
            >
              <Upload size={20} className="text-sage-500" />
              <span>Import library from JSON</span>
            </button>
            <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          </div>

          <div className="space-y-3 pt-4 border-t border-sage-100">
            <h3 className="text-xs uppercase tracking-wider text-sage-400 font-bold">Library</h3>
            <button
              onClick={() => setConfirmSample(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-sage-100 text-sage-700 hover:bg-sage-50 transition-colors"
            >
              <BookOpen size={20} className="text-sage-500" />
              <span>Load sample books</span>
            </button>
            <button
              onClick={() => setConfirmClear(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-red-100 text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={20} />
              <span>Clear entire library</span>
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={clearLibrary}
        title="Clear Library"
        message="This will permanently delete all books and reading sessions. This cannot be undone."
        confirmLabel="Clear Everything"
        variant="danger"
      />

      <ConfirmDialog
        isOpen={confirmSample}
        onClose={() => setConfirmSample(false)}
        onConfirm={loadSampleData}
        title="Load Sample Data"
        message="This will replace your current library with sample books. Export first if you want to keep your data."
        confirmLabel="Load Samples"
      />
    </>
  );
};

export default SettingsModal;
