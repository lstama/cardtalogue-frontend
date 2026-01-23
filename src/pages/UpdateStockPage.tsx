import { useState } from "react"
import { LoadingSpinner } from "../components/ui/LoadingSpinner"
import { CartItem } from "../contexts/CartContext"
import { protectedKardsAPI, storagesAPI } from "../services/api"

export const UpdateStockPage = () => {
  const [jsonInput, setJsonInput] = useState("")
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [stockStatus, setStockStatus] = useState<{
    item: CartItem
    available: number
    cardCode: string
    storageCode: string
    isSufficient: boolean
  }[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const validateAndParseJSON = () => {
    setError(null)
    try {
      const parsed = JSON.parse(jsonInput)
      
      if (!Array.isArray(parsed)) {
        setError("JSON must be an array of cart items")
        return
      }

      if (parsed.length === 0) {
        setError("Cart is empty")
        return
      }

      // Validate each item has required fields
      for (const item of parsed) {
        if (!item.id || !item.name || item.quantity === undefined || item.maxQuantity === undefined) {
          setError("Each item must have: id, name, quantity, maxQuantity")
          return
        }
      }

      setCartItems(parsed)
      checkStock(parsed)
    } catch (err: any) {
      setError(err.message || "Invalid JSON format")
    }
  }

  const checkStock = async (items: CartItem[]) => {
    setIsProcessing(true)
    try {
      const status = await Promise.all(
        items.map(async (item) => {
          const response = await protectedKardsAPI.getKard(item.id)
          const kard = response.data
          
          if (!kard) {
            throw new Error(`Card with ID ${item.id} not found`)
          }

          // Fetch storage to get the storage code
          let storageCode = ""
          try {
            const storageResponse = await storagesAPI.getStorage(kard.storage_id)
            console.log("Storage response:", storageResponse)
            storageCode = storageResponse.data.code || ""
          } catch (err) {
            console.warn(`Could not fetch storage ${kard.storage_id}:`, err)
          }

          return {
            item,
            available: kard.quantity,
            cardCode: kard.code,
            storageCode: storageCode,
            isSufficient: kard.quantity >= item.quantity,
          }
        })
      )
      
      setStockStatus(status)
    } catch (err: any) {
      setError(err.message || "Failed to check stock")
      setStockStatus([])
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClear = () => {
    setJsonInput("")
    setCartItems([])
    setStockStatus([])
    setError(null)
  }

  const handleUpdateStock = async () => {
    setIsUpdating(true)
    try {
      // Update each card's quantity by decreasing it
      await Promise.all(
        cartItems.map(async (item) => {
          const response = await protectedKardsAPI.getKard(item.id)
          const kard = response.data
          
          // Decrease quantity
          const newQuantity = kard.quantity - item.quantity
          
          await protectedKardsAPI.updateKard(item.id, {
            ...kard,
            quantity: Math.max(0, newQuantity),
          } as any)
        })
      )

      // Success - clear and show message
      alert("Stock updated successfully!")
      handleClear()
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to update stock")
    } finally {
      setIsUpdating(false)
      setShowConfirmModal(false)
    }
  }

  const allSufficient = stockStatus.length > 0 && stockStatus.every((s) => s.isSufficient)

  return (
    <div className="max-w-2xl mx-auto p-4 mt-7">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Update Stock</h1>

      {/* JSON Input Section */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Paste Sales JSON</h2>
        <textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder='Paste JSON format: [{"id":1,"name":"Card","price":100,"priceMultiplier":100,"maxQuantity":3,"quantity":2}]'
          rows={6}
          className="w-full border p-3 rounded bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm"
        />

        <div className="flex gap-2 mt-3">
          <button
            onClick={validateAndParseJSON}
            disabled={!jsonInput.trim() || isProcessing}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:opacity-50 font-bold flex items-center justify-center gap-2"
          >
            {isProcessing ? <LoadingSpinner size="sm" /> : "Check Stock"}
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 font-bold"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
          <p className="text-red-600 dark:text-red-400 font-semibold">Error:</p>
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Stock Status Table */}
      {stockStatus.length > 0 && (
        <div className="mb-6">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Stock Status</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 dark:border-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="border border-gray-300 dark:border-gray-700 p-2 text-left text-gray-900 dark:text-gray-100">Card Name</th>
                  <th className="border border-gray-300 dark:border-gray-700 p-2 text-center text-gray-900 dark:text-gray-100">Storage</th>
                  <th className="border border-gray-300 dark:border-gray-700 p-2 text-center text-gray-900 dark:text-gray-100">Current Stock</th>
                  <th className="border border-gray-300 dark:border-gray-700 p-2 text-center text-gray-900 dark:text-gray-100">Qty to Sell</th>
                  <th className="border border-gray-300 dark:border-gray-700 p-2 text-center text-gray-900 dark:text-gray-100">Status</th>
                </tr>
              </thead>
              <tbody>
                {stockStatus.map((status) => (
                  <tr key={status.item.id}>
                    <td className="border border-gray-300 dark:border-gray-700 p-2 text-gray-900 dark:text-gray-100">
                      {status.item.name} ({status.cardCode})
                    </td>
                    <td className="border border-gray-300 dark:border-gray-700 p-2 text-center text-gray-900 dark:text-gray-100">
                      {status.storageCode}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-700 p-2 text-center text-gray-900 dark:text-gray-100">
                      {status.available}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-700 p-2 text-center text-gray-900 dark:text-gray-100">
                      {status.item.quantity}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-700 p-2 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded font-bold text-sm ${
                          status.isSufficient
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                            : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                        }`}
                      >
                        {status.isSufficient ? "✓ OK" : "✗ Insufficient"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={!allSufficient}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg"
            >
              Update Stock
            </button>
            <button
              onClick={handleClear}
              className="px-4 py-3 bg-gray-600 text-white rounded hover:bg-gray-700 font-bold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[100]">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg max-w-md w-full">
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">
              Confirm Stock Update
            </h2>
            
            <div className="mb-4 max-h-64 overflow-y-auto">
              <p className="text-gray-700 dark:text-gray-300 mb-3 font-semibold">
                The following stock will be updated:
              </p>
              <ul className="space-y-2">
                {stockStatus.map((status) => (
                  <li
                    key={status.item.id}
                    className="p-2 bg-gray-100 dark:bg-gray-700 rounded text-gray-900 dark:text-gray-100 text-sm"
                  >
                    <div className="font-semibold">{status.item.name} ({status.cardCode})</div>
                    <div className="text-xs">Storage: {status.storageCode}</div>
                    <div className="text-xs">
                      {status.available} → {status.available - status.item.quantity}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded hover:bg-gray-400 font-bold"
                onClick={() => setShowConfirmModal(false)}
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2 font-bold disabled:opacity-50"
                onClick={handleUpdateStock}
                disabled={isUpdating}
              >
                {isUpdating ? <LoadingSpinner size="sm" /> : "Confirm & Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
