import { useState } from "react"
import { useCart } from "../contexts/CartContext"
import { Button } from "../components/ui/Button"

export const CartPage = () => {
    const { cart, addToCart, removeFromCart, deleteFromCart, clearCart, getSimplifiedCart } = useCart()
    const [page, setPage] = useState(1)
    const [showModal, setShowModal] = useState(false)
    const [showClearConfirm, setShowClearConfirm] = useState(false)

    const itemsPerPage = 10
    const totalPages = Math.ceil(cart.length / itemsPerPage)
    const paginatedCart = cart.slice((page - 1) * itemsPerPage, page * itemsPerPage)

    // Calculate totals
    const totalYen = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const totalRupiah = cart.reduce((sum, item) => sum + item.price * item.priceMultiplier * item.quantity, 0)

    return (
        <div className="max-w-2xl mx-auto p-4 space-y-4">
            <h2 className="text-lg font-bold">Your Cart</h2>

            {cart.length === 0 ? (
                <p className="text-sm text-gray-500">Your cart is empty.</p>
            ) : (
                <>
                    <ul className="space-y-2">
                        {paginatedCart.map((item) => (
                            <li
                                key={item.id}
                                className="flex justify-between items-center border p-2 rounded text-sm dark:border-gray-300"
                            >
                                <div className="flex-1">
                                    <p className="font-semibold  dark:text-gray-100">{item.name} ({item.code})</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-200">
                                        Qty: {item.quantity} / {item.maxQuantity}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-200">
                                        Price: ¥{item.price} | Rp {item.price * item.priceMultiplier}
                                    </p>
                                </div>
                                <div className="flex gap-1">
                                    <Button
                                        onClick={() => removeFromCart(item.id)}
                                        disabled={item.quantity <= 0}
                                        className="text-xs px-2 py-1 bg-red-600 dark:bg-red-400 dark:hover:bg-red-300 hover:bg-red-700"
                                    >
                                        -1
                                    </Button>
                                    <Button
                                        onClick={() => addToCart(item.id, item.code, item.name, item.price, item.priceMultiplier, item.maxQuantity)}
                                        disabled={item.quantity >= item.maxQuantity}
                                        className="text-xs px-2 py-1 dark:bg-blue-200 dark:hover:bg-blue-100"
                                    >
                                        +1
                                    </Button>
                                    <Button
                                        onClick={() => deleteFromCart(item.id)}
                                        className="text-xs px-2 py-1 bg-red-600 hover:bg-red-700 text-white dark:bg-red-400 dark:hover:bg-red-300"
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-2 text-sm">
                            <Button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                                Prev
                            </Button>
                            <span>
                                Page {page} / {totalPages}
                            </span>
                            <Button
                                disabled={page === totalPages}
                                onClick={() => setPage((p) => p + 1)}
                            >
                                Next
                            </Button>
                        </div>
                    )}

                    {/* Totals */}
                    <div className="mt-4 p-2 border rounded text-sm dark:border-gray-300">
                        <p className="font-semibold dark:text-gray-200">Total:</p>
                        <div className="flex mx-auto gap-1">
                            <p className=" dark:text-gray-200">¥{totalYen}</p>
                            <p className=" dark:text-gray-200">{" | "}</p>
                            <p className=" dark:text-gray-200">Rp {totalRupiah}</p>
                        </div>

                    </div>

                    {/* Actions */}
                    <div className="flex justify-between mt-4">
                        <Button
                            onClick={() => setShowModal(true)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            Checkout
                        </Button>
                        <Button
                            onClick={() => setShowClearConfirm(true)}
                            className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-500 dark:hover:bg-red-300"
                        >
                            Clear All
                        </Button>
                    </div>
                </>
            )}

            {/* Checkout Modal */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-4 rounded shadow max-w-md w-full text-sm">
                        <h3 className="font-semibold mb-2">Please copy this and send it to me</h3>
                        <textarea
                            readOnly
                            className="w-full h-40 border rounded p-2 text-xs"
                            value={getSimplifiedCart()}
                        />
                        <div className="flex justify-end gap-2 mt-2">
                            <Button
                                onClick={() => {
                                    navigator.clipboard.writeText(JSON.stringify(cart))
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                Copy
                            </Button>
                            <Button onClick={() => setShowModal(false)}>Close</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Clear All Confirmation Modal */}
            {showClearConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg max-w-sm w-full">
                        <h2 className="text-lg font-bold mb-4 dark:text-gray-200">Clear all items?</h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setShowClearConfirm(false)}
                                className="px-4 py-2 bg-gray-500 text-white rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    clearCart()
                                    setShowClearConfirm(false)
                                }}
                                className="px-4 py-2 bg-red-700 text-white rounded"
                            >
                                Clear All
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
