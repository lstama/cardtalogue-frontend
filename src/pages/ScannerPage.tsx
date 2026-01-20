import { useState } from 'react';
import TCGCameraModal from '../components/ui/TCGCamera';

export const ScannerPage: React.FC = () => {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cardData, setCardData] = useState({ name: '', set: '', number: '' });

  const onProcessed = async (file: File, originalBase64: string) => {
    setPreview(originalBase64);
    setIsCameraOpen(false);
    setLoading(true);

    // MOCK API CALL
    console.log("Uploading file:", file.size, "bytes");
    setTimeout(() => {
      setCardData({ name: "Charizard", set: "Celebrations", number: "4/102" });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 p-6 flex flex-col">
      <div 
        onClick={() => setIsCameraOpen(true)}
        className="relative w-40 aspect-[2.5/3.5] bg-white border-2 border-dashed border-slate-300 rounded-2xl mx-auto mb-8 cursor-pointer overflow-hidden flex items-center justify-center"
      >
        {preview ? (
          <div className="relative h-full w-full">
            <img src={preview} className="h-full w-full object-cover" />
            {loading && <div className="absolute inset-0 bg-blue-500/20 animate-pulse flex items-center justify-center font-black text-white text-[10px] tracking-widest">SCANNING</div>}
            {loading && <div className="absolute top-0 left-0 w-full h-1 bg-blue-400 shadow-[0_0_15px_#3b82f6] animate-scan" />}
          </div>
        ) : (
          <div className="text-slate-400 text-center uppercase font-black text-[10px]">Tap to Scan</div>
        )}
      </div>

      <div className="space-y-4 flex-1">
        {Object.entries(cardData).map(([key, val]) => (
          <div key={key}>
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">{key}</label>
            <input 
              type="text" 
              value={val} 
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all"
              onChange={(e) => setCardData({...cardData, [key]: e.target.value})}
            />
          </div>
        ))}
      </div>

      <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest mt-6 shadow-xl active:scale-95 transition-all">Save Card</button>
      
      {isCameraOpen && <TCGCameraModal onProcessed={onProcessed} onClose={() => setIsCameraOpen(false)} />}
    </div>
  );
};
