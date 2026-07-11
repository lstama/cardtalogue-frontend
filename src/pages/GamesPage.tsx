import React, { useState } from 'react';
import { SearchLayout } from '../components/layout/Search';
import { GameCard } from '../components/items/GameCard';
import { useGames } from '../hooks/useGames';

/**
 * Page component for browsing Card Games.
 */
const GamesPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState<number>(20);
  const [offset, setOffset] = useState<number>(0);

  // Fetch games based on search query and pagination
  useGames(limit, offset, query);

  return (
    <SearchLayout
      title="Kard Games"
      description="Browse our collection of card games"
      useSearch={(q, l, o) => {
        setQuery(q);
        setLimit(l);
        setOffset(o);
        return useGames(l, o, q);
      }}
      renderItem={(game) => <GameCard key={game.id} game={game} />}
      noResultsText="No Kard games found"
    />
  );
};

export default GamesPage;
