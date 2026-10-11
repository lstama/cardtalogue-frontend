import { Game } from '../../types'
import { ItemCard } from './ItemCard'

export const GameCard = ({ game }: { game: Game }) => ItemCard({ title: game.name })
