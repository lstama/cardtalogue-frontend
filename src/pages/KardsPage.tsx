// pages/KardsPage.tsx
import { useEffect, useState } from "react"
import { SearchLayout } from "../components/layout/Search"
import { KardCard } from "../components/items/KardCard"
import { useSearchKards } from "../hooks/useKards"
import { gamesAPI, languagesAPI, packsAPI } from "../services/api"

export const KardsPage = () => {
  const [gameId, setGameId] = useState(0)
  const [languageId, setLanguageId] = useState(0)
  const [packId, setPackId] = useState(0)
  const [games, setGames] = useState<{ id: number; name: string }[]>([])
  const [languages, setLanguages] = useState<{ id: number; name: string }[]>([])
  const [packs, setPacks] = useState<{ id: number; name: string }[]>([])

  useEffect(() => {
    gamesAPI.getGames(100, 0).then((res) =>
      setGames([{ id: 0, name: "All Games" }, ...res.data])
    )
    languagesAPI.getLanguages(100, 0).then((res) =>
      setLanguages([{ id: 0, name: "All Languages" }, ...res.data])
    )
  }, [])

  useEffect(() => {
    packsAPI.searchPacks(gameId, languageId, "", 100, 0).then((res) =>
      setPacks([{ id: 0, name: "All Packs" }, ...res.data])
    )
    // packsAPI.getPacks(100, 0).then((res) =>
    //   setPacks([{ id: 0, name: "All Packs" }, ...res.data])
    // )
  }, [gameId, languageId])

  return (
    <SearchLayout
      title="Card"
      description="Browse our collection of cards"
      useSearch={(query, limit, offset) =>
        useSearchKards(gameId, languageId, packId, query, limit, offset)
      }
      renderItem={(kard) => <KardCard key={kard.id} kard={kard} />}
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
        {
          label: "Pack",
          value: packId,
          onChange: (val) => setPackId(Number(val)),
          options: packs,
        },
      ]}
      noResultsText="No card found"
    />
  )
}
