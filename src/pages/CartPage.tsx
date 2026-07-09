import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { Button } from '../components/ui/Button';

/**
 * Page component for managing the user's cart.
 */
const CartPage: React.FC = () => {
  const { cart, addToCart, removeFromCart, deleteFromCart, clearCart, getSimplifiedCart } = useCart();
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(cart.length / itemsPerPage);
  const paginatedCart = cart.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  // Calculate totals
  const totalYen = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalRupiah = cart.reduce((sum, item) => sum + item.price * item.priceMultiplier * item.quantity, 0);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(getSimplifiedCart());
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Your Cart</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage your items and prepare for checkout.</p>
      </header>

      {cart.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
          <p className="text-gray-500 dark:text-gray-400">Your cart is empty.</p>
          <p className="text-sm text-gray-400">Add some Kards to your cart to get started!</p>
        </div>
      ) : (
        <>
          <ul className="space-y-4">
            {paginatedCart.map((item) => (
              <li
                key={item.id}
                className="flex justify-between items-center border p-4 rounded-xl bg-white dark:bg-gray-800 shadow-sm dark:border-gray-700"
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {item.name} ({item.code})
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Qty: {item.quantity} / {item.maxQuantity}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Price: ¥{item.price} | Rp {item.price * item.priceMultiplier}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => removeFromCart(item.id)}
                    disabled={item.quantity <= 0}
                    variant="destructive"
                    className="text-xs px-3 py-1"
                  >
                    -1
                  </Button>
                  <Button
                    onClick={() => addToCart(item.id, item.code, item.name, item.price, item.priceMultiplier, item.maxQuantity)}
                    disabled={item.quantity >= item.maxQuantity}
                    variant="outline"
                    className="text-xs px-3 py-1"
                  >
                    +1
                  </Button>
                  <Button
                    onClick={() => deleteFromCart(item.id)}
                    variant="destructive"
                    className="text-xs px-3 py-1"
                  >
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <Button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                variant="outline"
              >
                Prev
              </Button>
              <span className="font-medium">Page {page} / {totalPages}</span>
              <Button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                variant="outline"
              >
                Next
              </Button>
            </div>
          )}

          {/* Totals */}
          <div className="p-6 border rounded-xl bg-gray-50 dark:bg-gray-900/30">
            <h2 className="font-bold mb-3 dark:text-gray-200">Order Summary</h2>
            <div className="flex gap-6 text-lg">
              <div className="dark:text-gray-300">
                <span className="block text-xs font-semibold uppercase text-gray-500">Total Yen</span>
                ¥{totalYen.toLocaleString()}
              </div>
              <div className="dark:text-gray-300">
                <span className="block text-xs font-semibold uppercase text-gray-500">Total Rupiah</span>
                Rp {totalRupiah.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between gap-4 pt-4">
            <Button
              onClick={() => setShowModal(true)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              Checkout
            </Button>
            <Button
              onClick={() => setShowClearConfirm(true)}
              variant="destructive"
            >
              Clear All
            </Button>
          </div>
        </>
      )}

      {/* Checkout Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[100] p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl max-w-md w-full">
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">
              Please copy this and send it to me
            </h3>
            <textarea
              readOnly
              className="w-full h-48 border rounded p-3 bg-gray-50 dark:bg-gray-900 text-xs font-mono"
              value={getSimplifiedCart()}
            />
            <div className="flex justify-end gap-3 mt-4">
              <Button
                onClick={() => setShowModal(false)}
                variant="outline"
              >
                Close
              </Button>
              <Button
                onClick={handleCopyToClipboard}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Copy to Clipboard
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl max-w-sm w-full">
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">
              Clear all items?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              This action cannot be undone. All items will be removed from your cart.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                onClick={() => setShowClearConfirm(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  clearCart();
                  setShowClearConfirm(false);
                }}
                variant="destructive"
              >
                Clear All
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
