import { useState, useEffect } from "react"
import { Kard } from "../../types"
import { Card, CardContent } from "../ui/Card"
import { StaticTag } from "../ui/StaticTag"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { useCart } from "../../contexts/CartContext"

interface KardCardProps {
  kard: Kard
}

export const KardCard = ({ kard }: KardCardProps) => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [flipped, setFlipped] = useState(false)
  const { getQuantity, addToCart, removeFromCart, fixQuantity } = useCart()
  const quantityInCart = getQuantity(kard.id)

  // Ensure cart quantity never exceeds stock
  useEffect(() => {
    fixQuantity(kard.id, kard.quantity)
  }, [kard.quantity])

  return (
    <div className="relative perspective">
      <div
        className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${flipped ? "rotate-y-180" : ""
          }`}
      >
        {/* FRONT SIDE */}
        <Card className="h-full flex flex-col backface-hidden">
          <CardContent className="p-4 flex flex-col flex-1">
            {/* Kard Name */}
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[48px] dark:text-gray-300 text-sm">
              {kard.name}
            </h3>

            {/* Image */}
            <div className="relative mb-2">
              <div className="aspect-[230/330] w-full bg-gray-100 rounded-md overflow-hidden relative">
                <img
                  src={kard.image_url}
                  alt={kard.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <span
                  className="absolute inset-0 flex items-center justify-center text-6xl font-bold text-gray-900 opacity-40 transform rotate-45"
                >
                  SAMPLE
                </span>
                {kard.for_sale != "yes" && (
                <span
                  className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-red-900 opacity-80 drop-shadow-[2px_2px_2px_white] "
                >
                  NOT FOR SALE
                </span>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="text-xs text-gray-600 space-y-1 dark:text-gray-300 mb-2">
              <div className="flex flex-wrap items-center gap-1">
                <StaticTag text={kard.code} color="red" />
                <StaticTag text={kard.rarity_code} color="green" />
                {/* <StaticTag text={kard.pack_code} color="blue" /> */}
                {/* <StaticTag text={kard.game_name} color="yellow" /> */}
                {/* <StaticTag text={kard.language_code} color="purple" /> */}
              </div>
            </div>

            {/* Details Button (Flip) */}
            <div className="mt-auto min-h-[36px] flex items-end">
              <button
                onClick={() => setFlipped(true)}
                className="w-full text-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
              >
                Details
              </button>
            </div>
          </CardContent>
        </Card>

        {/* BACK SIDE */}
        <Card className="h-full flex flex-col absolute top-0 left-0 w-full rotate-y-180 backface-hidden">
          <CardContent className="p-4 flex flex-col flex-1 text-xs">
            {/* Top Info */}
            <h4 className="font-semibold text-gray-900 dark:text-gray-300">
              {kard.name} ({kard.code})
            </h4>

            {/* Description */}
            <p className="text-gray-600 dark:text-gray-400 mt-1 mb-2 text-[10px] line-clamp-4">
              {kard.description}
            </p>

            {/* Price */}
            <div className="mt-2 space-y-1">
              <p className="text-gray-600 dark:text-gray-300">Price: ¥{kard.price}</p>
              <p className="text-gray-600 dark:text-gray-300">Price (Rp): Rp {(kard.price * kard.price_multiplier).toLocaleString("id-ID")}</p>
              <p className="text-gray-600 dark:text-gray-300">Quantity: {kard.quantity}</p>
              <p className="text-gray-600 dark:text-gray-300">For Sale: {kard.for_sale === "yes" ? "Yes" : "No"}</p>
            </div>

            {/* Cart Buttons */}
            <div className="mt-3 flex flex-col gap-2 mt-auto">
              {quantityInCart > 0 && (
                <button
                  onClick={() => removeFromCart(kard.id)}
                  disabled={!(kard.for_sale === "yes")}
                  className="w-full text-xs px-2 py-1 bg-red-600 text-white rounded 
                       hover:bg-red-700 disabled:bg-gray-400 
                       disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Remove from Cart
                </button>
              )}

              {kard.for_sale === "yes" && (
              <button
                onClick={() =>
                  addToCart(
                    kard.id,
                    kard.code,
                    kard.name,
                    kard.price,
                    kard.price_multiplier,
                    kard.quantity
                  )
                }
                disabled={
                  !(kard.for_sale === "yes") || quantityInCart >= kard.quantity
                }
                className="w-full text-xs px-2 py-1 bg-blue-600 text-white rounded 
                     hover:bg-blue-700 disabled:bg-gray-400 
                     disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add to Cart
              </button>
              )}

              {isAuthenticated && (
              <button
                onClick={() => navigate(`/create/card/${kard.id}`)}
                className="w-full text-xs px-2 py-1 bg-purple-600 text-white rounded 
                     hover:bg-purple-700"
              >
                Edit Card
              </button>
              )}

              <button
                onClick={() => setFlipped(false)}
                className="w-full px-2 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700"
              >
                Back
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}