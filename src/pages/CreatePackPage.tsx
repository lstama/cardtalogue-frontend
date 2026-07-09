import React, { useEffect, useState } from 'react';
import { useCreatePack } from '../hooks/usePacks';
import { gamesAPI, languagesAPI } from '../services/api';
import { SearchableSelect } from '../components/ui/SearchableSelect';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';

/**
 * Page component for creating new Pack information.
 */
const CreatePackPage: React.FC = () => {
  const [form, setForm] = useState({
    code: '',
    name: '',
    image_url: 'https://picsum.photos/230/330.webp',
    description: '',
    game_id: 0,
    language_id: 0,
  });

  const [games, setGames] = useState<{ id: number; name: string }[]>([]);
  const [languages, setLanguages] = useState<{ id: number; name: string }[]>([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createPack = useCreatePack();

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [storageRes, rarityRes] = await Promise.all([
          gamesAPI.getGames(100, 0),
          languagesAPI.getLanguages(100, 0),
        ]);
        setGames(storageRes.data);
        setLanguages(rarityRes.data);
      } catch (err) {
        console.error('Failed to fetch metadata', err);
      }
    };
    fetchMetadata();
  }, []);

  const handleChange = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    setIsConfirmOpen(true);
  };

  const confirmSubmit = () => {
    createPack.mutate(form, {
      onSuccess: () => {
        alert('Pack created successfully!');
        setForm({
          code: '',
          name: '',
          image_url: 'https://picsum.photos/230/330.webp',
          description: '',
          game_id: 0,
          language_id: 0,
        });
        setPreviewUrl(null);
      },
      onError: (err: any) => {
        const message =
          err.response?.data?.message || err.message || 'Unexpected error';
        setError(message);
      },
    });
    setIsConfirmOpen(false);
  };

  return (
    <div className="max-w-xl mx-auto p-4 mt-7 space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Create Pack</h1>
        <p className="text-gray-500 dark:text-gray-400">Add a new Pack to the collection.</p>
      </header>

      <div className="space-y-6">
        <div className="space-y-1">
          <h5 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Code</h5>
          <input
            className="w-full border p-2 rounded bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 uppercase"
            placeholder="e.g., PACK-001"
            value={form.code}
            onChange={(e) => handleChange('code', e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <h5 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Name</h5>
          <input
            className="w-full border p-2 rounded bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="Pack Name"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <h5 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Image URL</h5>
          <div className="flex gap-2">
            <input
              className="flex-1 border p-2 rounded bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="https://..."
              value={form.image_url}
              onChange={(e) => handleChange('image_url', e.target.value)}
            />
            <Button
              type="button"
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
              onClick={() => setPreviewUrl(form.image_url)}
            >
              Check
            </Button>
          </div>

          {previewUrl && (
            <div className="mt-3 flex justify-center">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-h-48 border-4 rounded-lg border-gray-300 dark:border-gray-700 shadow-md"
                onError={() => setPreviewUrl(null)}
              />
            </div>
          )}
        </div>

        <div className="space-y-1">
          <h5 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Description</h5>
          <textarea
            className="w-full border p-2 rounded bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="Optional description for the pack..."
            rows={4}
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <h5 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Game</h5>
          <SearchableSelect
            label="Select Game"
            value={form.game_id}
            options={games}
            onChange={(id) => handleChange("game_id", id)}
            onSearchQueryChange={() => { }}
          />
        </div>

        <div className="space-y-1">
          <h5 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Language</h5>
          <SearchableSelect
            label="Select Language"
            value={form.language_id}
            options={languages}
            onChange={(id) => handleChange("language_id", id)}
            onSearchQueryChange={() => { }}
          />
        </div>

        <Button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl font-bold shadow-lg transition-all"
          onClick={handleSubmit}
          disabled={createPack.isPending}
        >
          {createPack.isPending ? <LoadingSpinner size="sm" /> : 'Submit Pack'}
        </Button>
      </div>

      {/* Confirmation Modal */}
      {isConfirmOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[100] p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl max-w-md w-full border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">
              Are these data correct?
            </h2>
            <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-xs mb-4 text-gray-900 dark:text-gray-100 overflow-auto max-h-64">
              {JSON.stringify(form, null, 2)}
            </pre>
            <div className="flex justify-end gap-3">
              <Button
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded hover:bg-gray-400 dark:hover:bg-gray-600"
                onClick={() => setIsConfirmOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded shadow-md"
                onClick={confirmSubmit}
                disabled={createPack.isPending}
              >
                {createPack.isPending ? <LoadingSpinner size="sm" /> : 'Confirm & Create'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {error && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[110] p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl max-w-md w-full border-t-4 border-red-600">
            <h2 className="text-lg font-bold mb-4 text-red-600">
              Error
            </h2>
            <p className="text-gray-900 dark:text-gray-100 mb-6">
              {error}
            </p>
            <div className="flex justify-end">
              <Button
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
                onClick={() => setError(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatePackPage;
