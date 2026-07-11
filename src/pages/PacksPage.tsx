import React, { useState, useMemo } from 'react';
import { SearchLayout } from '../components/layout/Search';
import { PackCard } from '../components/items/PackCard';
import { usePacks } from '../hooks/usePacks';
import { useGames } from '../hooks/useGames';

/**
 * Page component for browsing Kard Packs.
 */
const PacksPage: React.FC = () => {
  const [gameId, setGameId] = useState<number>(0);
  const [languageId, setLanguageId] = useState<number>(0);
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState<number>(20);
  const [offset, setOffset] = useState<number>(0);

  // Fetch filter metadata
  const { data: gamesData } = useGames(100, 0);

  // Fetch Packs based on filters and search query
  usePacks(limit, offset, gameId, languageId, query);

  // Prepare filter options for SearchLayout
  const filters = useMemo(() => {
    const gameOptions = gamesData?.data?.map((g: any) => ({ id: g.id, name: g.name })) || [];
    const languageOptions: Array<{ id: number; name: string }> = [];

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
    ];
  }, [gameId, languageId, gamesData]);

  return (
    <SearchLayout
      title="Kard Packs"
      description="Browse our collection of card packs"
      useSearch={(q, l, o) => {
        setQuery(q);
        setLimit(l);
        setOffset(o);
        return usePacks(l, o, gameId, languageId, q);
      }}
      renderItem={(pack) => <PackCard key={pack.id} pack={pack} />}
      filters={filters}
      itemsPerPage={limit}
      noResultsText="No Kard packs found"
    />
  );
};

export default PacksPage;
