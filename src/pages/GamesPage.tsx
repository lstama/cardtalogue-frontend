// pages/GamesPage.tsx
import { SearchLayout } from "../components/layout/SearchLayout"
import { GameCard } from "../components/items/GameCard"
import { useSearchGames } from "../hooks/useGames"

export const GamesPage = () => {
  return (
    <SearchLayout
      title="Card Games"
      description="Browse our collection of card games"
      useSearch={(query, limit, offset) =>
        useSearchGames(query, limit, offset)
      }
      renderItem={(game) => <GameCard key={game.id} game={game} />}
      noResultsText= "No card games found"
    />
  )
}
