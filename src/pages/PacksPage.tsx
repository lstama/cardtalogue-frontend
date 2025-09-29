// pages/PacksPage.tsx
import { useEffect, useState } from "react"
import { SearchLayout } from "../components/layout/Search"
import { PackCard } from "../components/items/PackCard"
import { useSearchPacks } from "../hooks/usePacks"
import { gamesAPI, languagesAPI } from "../services/api"

export const PacksPage = () => {
  const [gameId, setGameId] = useState(0)
  const [languageId, setLanguageId] = useState(0)
  const [games, setGames] = useState<{ id: number; name: string }[]>([])
  const [languages, setLanguages] = useState<{ id: number; name: string }[]>([])

  useEffect(() => {
    gamesAPI.getGames(100, 0).then((res) =>
      setGames([{ id: 0, name: "All Games" }, ...res.data])
    )
    languagesAPI.getLanguages(100, 0).then((res) =>
      setLanguages([{ id: 0, name: "All Languages" }, ...res.data])
    )
  }, [])

  return (
    <SearchLayout
      title="Card Packs"
      description="Browse our collection of card packs"
      useSearch={(query, limit, offset) =>
        useSearchPacks(gameId, languageId, query, limit, offset)
      }
      renderItem={(pack) => <PackCard key={pack.id} pack={pack} />}
      filters={[
        {
          label: "Game",
          value: gameId,
          onChange: (val) => setGameId(Number(val)),
          options: games,
        },
        {
          label: "Language",
          value: languageId,
          onChange: (val) => setLanguageId(Number(val)),
          options: languages,
        },
      ]}
      noResultsText="No card packs found"
    />
  )
}
