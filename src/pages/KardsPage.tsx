import React, { useState, useMemo } from 'react';
import { SearchLayout } from '../components/layout/Search';
import { KardCard } from '../components/items/KardCard';
import { useKards } from '../hooks/useKards';
import { useGames } from '../hooks/useGames';
import { usePacks } from '../hooks/usePacks';

/**
 * Page component for browsing Kards.
 */
const KardsPage: React.FC = () => {
  const [gameId, setGameId] = useState<number>(0);
  const [languageId, setLanguageId] = useState<number>(0);
  const [packId, setPackId] = useState<number>(0);
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState<number>(20);
  const [offset, setOffset] = useState<number>(0);

  // Fetch filter metadata
  const { data: gamesData } = useGames(100, 0);
  const { data: packsData } = usePacks(100, 0);

  // Fetch Kards based on filters and search query
  // We use a memoized queryKey or handle the reactive dependencies of useKards.
  // Since useKards now takes all params, it will react to changes in these states.
  useKards(gameId, languageId, packId, query, limit, offset);

  // Prepare filter options for SearchLayout
  const filters = useMemo(() => {
    const gameOptions = gamesData?.data?.map((g: any) => ({ id: g.id, name: g.name })) || [];
    const languageOptions: Array<{ id: number; name: string }> = [];
    const packOptions = packsData?.data?.map((p: any) => ({ id: p.id, name: p.name })) || [];

    return [
      {
        label: 'Game',
        value: gameId,
        onChange: (val: number) => setGameId(val),
        options: gameOptions,
      },
      {
        label: 'Language',
        value: languageId,
        onChange: (val: number) => setLanguageId(val),
        options: languageOptions,
      },
      {
        label: 'Pack',
        value: packId,
        onChange: (val: number) => setPackId(val),
        options: packOptions,
      },
    ];
  }, [gameId, languageId, packId, gamesData, packsData]);

  return (
    <SearchLayout
      title="Kards"
      description="Browse our collection of cards"
      useSearch={(q, l, o) => {
        setQuery(q);
        setLimit(l);
        setOffset(o);
        // This is tricky because useKards is already called at top level.
        // SearchLayout calls useSearch which returns the query object.
        // We need to make sure the params are updated correctly.
        return useKards(gameId, languageId, packId, q, l, o);
      }}
      renderItem={(kard) => <KardCard key={kard.id} kard={kard} />}
      filters={filters}
      itemsPerPage={limit}
      noResultsText="No Kards found"
    />
  );
};

export default KardsPage;
