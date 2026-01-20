import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';

export interface TCGCardData {
  name: string;
  set: string;
  number: string;
  rarity: string;
}

export const processImage = (base64Str: string, maxWidth = 420): Promise<{ file: File; isDark: boolean }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64Str;
    img.onerror = reject;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error("Canvas error"));

      // 1. Check Brightness (using a tiny sample for speed)
      canvas.width = 40;
      canvas.height = 40;
      ctx.drawImage(img, 0, 0, 40, 40);
      const data = ctx.getImageData(0, 0, 40, 40).data;
      let brightness = 0;
      for (let i = 0; i < data.length; i += 4) {
        brightness += (data[i] * 0.299 + data[i+1] * 0.587 + data[i+2] * 0.114);
      }
      const avgBrightness = brightness / (40 * 40);

      // 2. Compress to 420p JPEG
      const scale = maxWidth / img.width;
      canvas.width = maxWidth;
      canvas.height = img.height * scale;
      ctx.fillStyle = "#FFFFFF"; // Fill background for JPEG
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "scan.jpg", { type: "image/jpeg" });
          resolve({ file, isDark: avgBrightness < 50 });
        }
      }, "image/jpeg", 0.7);
    };
  });
};

interface Props {
  onProcessed: (file: File, preview: string) => void;
  onClose: () => void;
}

const TCGCameraModal: React.FC<Props> = ({ onProcessed, onClose }) => {
  const webcamRef = useRef<Webcam>(null);
  const [warning, setWarning] = useState<string | null>(null);

  const handleCapture = async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      const { file, isDark } = await processImage(imageSrc);
      
      if (isDark) {
        setWarning("Too dark! Please move to a brighter area.");
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        return;
      }

      onProcessed(file, imageSrc);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-sm aspect-[2.5/3.5] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
        <Webcam ref={webcamRef} screenshotFormat="image/jpeg" className="h-full w-full object-cover" />
        
        {/* Guideline */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[85%] h-[85%] border-2 border-blue-400/50 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]">
            <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-blue-500" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-blue-500" />
          </div>
        </div>

        {warning && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-6 text-center">
            <div className="text-white">
              <p className="mb-4 font-bold">{warning}</p>
              <button onClick={() => setWarning(null)} className="bg-blue-600 px-6 py-2 rounded-lg uppercase text-xs font-black">Try Again</button>
            </div>
          </div>
        )}
      </div>

      {!warning && (
        <div className="mt-8 flex items-center gap-10">
          <button onClick={onClose} className="text-white/50 uppercase text-xs font-bold">Cancel</button>
          <button onClick={handleCapture} className="w-20 h-20 bg-white rounded-full border-4 border-blue-500/20 active:scale-95 transition-all shadow-xl" />
          <div className="w-10" />
        </div>
      )}
    </div>
  );
};

export default TCGCameraModal;