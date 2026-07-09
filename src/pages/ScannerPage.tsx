import React, { useState } from 'react';
import TCGCameraModal from '../components/ui/TCGCamera';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { mediaAPIScan } from '../services/api';
import { useCreateKard } from '../hooks/useKards';

/**
 * Page component for scanning and adding Kards via camera/image upload.
 */
const ScannerPage: React.FC = () => {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cardData, setCardData] = useState({
    name: '',
    set: '',
    number: '',
  });

  const createKard = useCreateKard();

  const onProcessed = async (file: File, originalBase64: string) => {
    setPreview(originalBase64);
    setIsCameraOpen(false);
    setLoading(true);

    try {
      const response = await mediaAPIScan.uploadImage(file);
      const mediaId = response.data?.id;
      const matches = response.scan?.scan?.matches || [];

      if (matches.length > 0) {
        const bestMatch = matches[0];
        setCardData({
          name: bestMatch.name || '',
          set: bestMatch.set || '',
          number: bestMatch.number || '',
        });
        
        // If we want to use the mediaId, we'd need to include it in the form state
        // For now, we're just mapping the basic metadata
      }
    } catch (err: any) {
      console.error('Scan failed:', err);
      alert(err.response?.data?.message || 'Failed to scan card');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    const submitData = {
      name: cardData.name,
      code: cardData.number || `SCAN-${Date.now()}`,
      description: `Scanned: ${cardData.set}`,
      price: 100,
      price_multiplier: 100,
      quantity: 1,
      image_url: preview || 'https://picsum.photos/230/330.webp',
      status: 'enabled',
      for_sale: 'yes',
      game_id: 1,
      language_id: 1,
      rarity_id: 1,
      storage_id: 1,
    };

    createKard.mutate(submitData as any, {
      onSuccess: () => {
        alert('Card added successfully!');
        setPreview(null);
        setCardData({ name: '', set: '', number: '' });
      },
      onError: (err: any) => {
        alert(err.response?.data?.message || 'Failed to save card');
      },
    });
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 p-6 flex flex-col">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Scanner</h1>
        <p className="text-gray-500 dark:text-gray-400">Scan your Kards to auto-fill details.</p>
      </header>

      <div
        onClick={() => setIsCameraOpen(true)}
        className="relative bg-white border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl mx-auto mb-8 cursor-pointer overflow-hidden flex items-center justify-center aspect-[2.4/3.4] w-full max-w-[160px] shadow-sm"
      >
        {preview ? (
          <div className="relative h-full w-full">
            <img src={preview} className="h-full w-full object-cover" alt="Preview" />
            {loading && (
              <div className="absolute inset-0 bg-blue-500/20 animate-pulse flex items-center justify-center font-bold text-white text-xs tracking-widest">
                SCANNING...
              </div>
            )}
            {loading && (
              <div className="absolute top-0 left-0 w-full h-1 bg-blue-400 shadow-[0_0_15px_#3b82f6] animate-scan" />
            )}
          </div>
        ) : (
          <div className="text-gray-400 text-center uppercase font-bold text-[10px] px-2">
            Tap to Scan
          </div>
        )}
      </div>

      <div className="space-y-6 flex-1">
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase ml-1">Name</label>
          <input
            type="text"
            placeholder="e.g. Charizard"
            value={cardData.name}
            className="w-full bg-white border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all"
            onChange={(e) => setCardData((prev) => ({ ...prev, name: e.target.value }))}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase ml-1">Set</label>
          <input
            type="text"
            placeholder="e.g. Celebrations"
            value={cardData.set}
            className="w-full bg-white border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all"
            onChange={(e) => setCardData((prev) => ({ ...prev, set: e.target.value }))}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase ml-1">Number</label>
          <input
            type="text"
            placeholder="e.g. 4/102"
            value={cardData.number}
            className="w-full bg-white border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all"
            onChange={(e) => setCardData((prev) => ({ ...prev, number: e.target.value }))}
          />
        </div>

        <Button
          className="w-full bg-slate-900 hover:bg-slate-800 text-white p-4 rounded-2xl font-bold uppercase tracking-widest mt-8 shadow-lg transition-all active:scale-[0.98]"
          onClick={handleSave}
          disabled={createKard.isPending || loading}
        >
          {createKard.isPending || loading ? <LoadingSpinner size="sm" /> : 'Save Card'}
        </Button>
      </div>

      {isCameraOpen && (
        <TCGCameraModal onProcessed={onProcessed} onClose={() => setIsCameraOpen(false)} />
      )}
    </div>
  );
};

export default ScannerPage;
