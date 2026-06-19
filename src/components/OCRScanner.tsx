import React, { useState, useRef } from 'react';
import { createWorker } from 'tesseract.js';
import { Camera, Upload, Loader2, Check, X } from 'lucide-react';

interface OCRScannerProps {
  onQuoteExtracted: (text: string) => void;
  onClose: () => void;
}

const OCRScanner: React.FC<OCRScannerProps> = ({ onQuoteExtracted, onClose }) => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async () => {
    if (!image) return;

    setLoading(true);
    try {
      const worker = await createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      const { data: { text } } = await worker.recognize(image);
      await worker.terminate();
      
      onQuoteExtracted(text);
    } catch (error) {
      console.error('OCR Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-sage-900 bg-opacity-60 backdrop-blur-md">
      <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg md:text-xl font-serif font-bold text-sage-800">Quote Scanner</h3>
          <button onClick={onClose} className="p-2 hover:bg-sage-50 rounded-full">
            <X size={20} className="text-sage-400" />
          </button>
        </div>

        {!image ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="aspect-video border-2 border-dashed border-sage-100 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-sage-50 transition-colors group"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 bg-sage-50 text-sage-400 rounded-full flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform">
              <Camera size={20} className="md:w-6 md:h-6" />
            </div>
            <p className="text-sage-500 font-medium text-sm md:text-base text-center px-4">Upload a photo of the page</p>
            <p className="text-sage-300 text-xs mt-1">PNG, JPG, or Screenshots</p>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              className="hidden" 
              accept="image/*"
            />
          </div>
        ) : (
          <div className="space-y-4 md:space-y-6">
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-inner bg-sage-50">
              <img src={image} alt="Preview" className="w-full h-full object-contain" />
              {loading && (
                <div className="absolute inset-0 bg-sage-900 bg-opacity-40 flex flex-col items-center justify-center text-white p-4">
                  <Loader2 className="animate-spin mb-4" size={32} />
                  <div className="w-full max-w-[200px] h-2 bg-white bg-opacity-20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-sage transition-all duration-300" 
                      style={{ width: `${progress}%` }} 
                    />
                  </div>
                  <p className="text-sm mt-2 font-medium">Scanning... {progress}%</p>
                </div>
              )}
            </div>

            <div className="flex gap-2 md:gap-3">
              <button 
                onClick={() => setImage(null)}
                className="flex-1 py-3 px-2 rounded-xl border border-sage-100 text-sage-500 font-medium text-xs md:text-sm hover:bg-sage-50 transition-colors"
                disabled={loading}
              >
                Retake
              </button>
              <button 
                onClick={processImage}
                className="flex-[2] py-3 px-4 rounded-xl bg-sage text-white font-medium text-xs md:text-sm hover:bg-sage-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-sage/20"
                disabled={loading}
              >
                {loading ? 'Processing...' : (
                  <>
                    <Check size={16} />
                    Extract Quote
                  </>
                )}
              </button>
            </div>
          </div>
        )}
        
        <p className="mt-6 text-[10px] md:text-xs text-sage-400 text-center leading-relaxed">
          Powered by Tesseract.js. Your photos are processed locally.
        </p>
      </div>
    </div>
  );
};

export default OCRScanner;
