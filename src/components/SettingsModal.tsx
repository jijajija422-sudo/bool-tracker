import React, { useRef, useState } from 'react';
import { Download, Upload, Trash2, BookOpen, AlertCircle } from 'lucide-react';
import { useBooks } from '../context/BookContext';
import Modal from './Modal';
import ConfirmDialog from './ConfirmDialog';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { exportData, importData, loadSampleData, clearLibrary, books } = useBooks();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmSample, setConfirmSample] = useState(false);

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
          <div className="p-4 bg-sage-50 rounded-2xl">
            <p className="text-sm text-sage-600">
              <span className="font-bold text-sage-800">{books.length}</span> books in your library.
              Data is saved locally in your browser.
            </p>
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
