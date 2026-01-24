import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';

export const processImage = (
  base64Str: string,
  crop: { x: number; y: number; width: number; height: number },
  targetWidth = 420
): Promise<{ file: File }> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Calculate target height for the 2.4:3.4 ratio
      const targetHeight = Math.round(targetWidth * (3.4 / 2.4));
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // Draw exactly from the calculated source coordinates to the full canvas
      ctx?.drawImage(
        img,
        crop.x, crop.y, crop.width, crop.height, // Source
        0, 0, targetWidth, targetHeight         // Destination
      );

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "scan.jpg", { type: "image/jpeg" });
          resolve({ file });
        }
      }, "image/jpeg", 0.9);
    };
  });
};

const TCGCameraModal: React.FC<{ onProcessed: (f: File, p: string) => void; onClose: () => void }> = ({ onProcessed, onClose }) => {
  const webcamRef = useRef<Webcam>(null);
  const [warning, setWarning] = useState<string | null>(null);

  const handleCapture = async () => {
    const video = webcamRef.current?.video;
    const imageSrc = webcamRef.current?.getScreenshot();

    if (imageSrc && video) {
      // 1. Raw Resolution of the camera (e.g., 1920x1080)
      const sourceW = video.videoWidth;   
      const sourceH = video.videoHeight;  
      
      // 2. CSS size of the video element on your screen (e.g., 390x550)
      const displayW = video.clientWidth; 
      const displayH = video.clientHeight; 

      // 3. Determine how the video is "zoomed" inside the container
      const videoRatio = sourceW / sourceH;
      const containerRatio = displayW / displayH;

      let scale, xOffset = 0, yOffset = 0;

      if (videoRatio > containerRatio) {
          // Video is wider than the container (Landscape sensor on Portrait screen)
          scale = displayH / sourceH;
          xOffset = (sourceW * scale - displayW) / 2 / scale;
      } else {
          // Video is taller than container
          scale = displayW / sourceW;
          yOffset = (sourceH * scale - displayH) / 2 / scale;
      }

      // 4. Calculate the 85% blue box relative to the VISIBLE portion of the sensor
      const visibleWidth = sourceW - (xOffset * 2);
      const visibleHeight = sourceH - (yOffset * 2);

      const cropWidth = visibleWidth * 0.85;
      const cropHeight = visibleHeight * 0.85;
      
      // Final coordinates to "cut" from the raw image
      const cropParams = {
        x: Math.round(xOffset + (visibleWidth - cropWidth) / 2),
        y: Math.round(yOffset + (visibleHeight - cropHeight) / 2),
        width: Math.round(cropWidth),
        height: Math.round(cropHeight)
      };

      const { file } = await processImage(imageSrc, cropParams);
      onProcessed(file, imageSrc);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-sm rounded-2xl overflow-hidden border border-white/10" style={{ aspectRatio: '2.4/3.4' }}>
        <Webcam 
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          forceScreenshotSourceSize={true} // IMPORTANT: This tells the library to use the raw resolution
          videoConstraints={{ facingMode: "environment" }}
          className="h-full w-full object-cover"
        />
        
        {/* Blue Guideline Box */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[85%] h-[85%] border-2 border-blue-400 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]">
             <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-blue-500" />
             <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-blue-500" />
          </div>
        </div>

        {warning && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-30">
            <button onClick={() => setWarning(null)} className="bg-white text-black px-4 py-2 rounded">Too Dark - Try Again</button>
          </div>
        )}
      </div>

      <div className="mt-8 flex gap-10">
        <button onClick={onClose} className="text-white/50 text-xs font-bold">CANCEL</button>
        <button onClick={handleCapture} className="w-16 h-16 bg-white rounded-full border-4 border-white/20 active:scale-90 shadow-lg" />
        <div className="w-10" />
      </div>
    </div>
  );
};

export default TCGCameraModal;