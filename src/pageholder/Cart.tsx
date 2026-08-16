import { Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaMinus,
  FaPlus,
  FaTrash,
  FaShoppingCart,
} from "react-icons/fa";

import { useCart } from "../context/CartContext";

export default function Cart() {
  const {
    cart,
    totalItems,
    subtotal,
    increaseQuantity,
    decreaseQuantity,
    removeItem,
  } = useCart();

  // =====================================
  // DELIVERY
  // =====================================

  const deliveryFee = cart.length > 0 ? 1500 : 0;

  const total = subtotal + deliveryFee;

  // =====================================
  // EMPTY CART
  // =====================================

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* =========================
            HEADER
        ========================== */}

        <header className="border-b border-gray-100 bg-white">
          <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
            <Link
              to="/"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-100"
              aria-label="Back to home"
            >
              <FaArrowLeft />
            </Link>

            <div>
              <h1 className="text-xl font-bold text-gray-900">My Cart</h1>

              <p className="text-xs text-gray-500">0 items</p>
            </div>
          </div>
        </header>

        {/* =========================
            EMPTY STATE
        ========================== */}

        <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-orange-50">
            <FaShoppingCart className="text-4xl text-orange-400" />
          </div>

          <h2 className="mt-6 text-xl font-bold text-gray-900">
            Your cart is empty
          </h2>

          <p className="mt-2 max-w-xs text-sm leading-6 text-gray-500">
            You haven't added anything to your cart yet.
          </p>

          <Link
            to="/"
            className="mt-6 rounded-xl bg-orange-500 px-8 py-3 font-semibold text-white transition hover:bg-orange-600"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  // =====================================
  // CART
  // =====================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* =========================
          HEADER
      ========================== */}

      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
          <Link
            to="/"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-100"
            aria-label="Back to home"
          >
            <FaArrowLeft />
          </Link>

          <div>
            <h1 className="text-xl font-bold text-gray-900">My Cart</h1>

            <p className="text-xs text-gray-500">
              {totalItems} {totalItems === 1 ? "item" : "items"}
            </p>
          </div>
        </div>
      </header>

      {/* =========================
          MAIN
      ========================== */}

      <main className="mx-auto max-w-6xl p-4 sm:p-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* =========================
              CART ITEMS
          ========================== */}

          <div className="space-y-3">
            {cart.map((item) => {
              // =====================================
              // PRODUCT PRICES
              // =====================================

              const originalPrice = Number(item.product.originalPrice || 0);

              const sellingPrice = Number(item.product.price || 0);

              const hasDiscount =
                originalPrice > 0 &&
                sellingPrice > 0 &&
                originalPrice > sellingPrice;

              const discountPercentage = hasDiscount
                ? Math.round(
                    ((originalPrice - sellingPrice) / originalPrice) * 100,
                  )
                : 0;

              // =====================================
              // ITEM TOTAL
              // =====================================

              const itemTotal = sellingPrice * item.quantity;

              // =====================================
              // STOCK
              // =====================================

              const maxStock = Number(item.product.stock || 0);

              const atStockLimit = maxStock > 0 && item.quantity >= maxStock;

              return (
                <div
                  key={item.product._id}
                  className="rounded-2xl bg-white p-3 shadow-sm sm:p-4"
                >
                  <div className="flex gap-3 sm:gap-4">
                    {/* =========================
                        IMAGE
                    ========================== */}

                    <Link
                      to={`/product/${item.product._id}`}
                      className="shrink-0"
                    >
                      {item.product.image ? (
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="h-24 w-24 rounded-xl object-cover sm:h-28 sm:w-28"
                        />
                      ) : (
                        <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-gray-100 text-xs text-gray-400 sm:h-28 sm:w-28">
                          No image
                        </div>
                      )}
                    </Link>

                    {/* =========================
                        DETAILS
                    ========================== */}

                    <div className="min-w-0 flex-1">
                      {/* NAME + REMOVE */}

                      <div className="flex justify-between gap-2">
                        <Link
                          to={`/product/${item.product._id}`}
                          className="line-clamp-2 text-sm font-semibold text-gray-900 transition hover:text-orange-500 sm:text-base"
                        >
                          {item.product.name}
                        </Link>

                        <button
                          type="button"
                          onClick={() => removeItem(item.product._id)}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500 transition hover:bg-red-100"
                          aria-label={`Remove ${item.product.name}`}
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>

                      {/* =========================
                          PRICE
                      ========================== */}

                      <div className="mt-2 space-y-1">
                        {/* DISCOUNT */}

                        {hasDiscount && (
                          <span className="inline-flex rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-600">
                            -{discountPercentage}% OFF
                          </span>
                        )}

                        {/* SELLING + ORIGINAL */}

                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-lg font-bold text-orange-500">
                            ₦{sellingPrice.toLocaleString()}
                          </p>

                          {hasDiscount && (
                            <span className="text-sm font-medium text-gray-400 line-through">
                              ₦{originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* =========================
                          QUANTITY + ITEM TOTAL
                      ========================== */}

                      <div className="mt-3 flex items-center justify-between gap-3">
                        {/* QUANTITY */}

                        <div className="flex items-center gap-2 rounded-lg bg-gray-100 p-1">
                          {/* MINUS */}

                          <button
                            type="button"
                            onClick={() => decreaseQuantity(item.product._id)}
                            disabled={item.quantity <= 1}
                            className="flex h-8 w-8 items-center justify-center rounded-md bg-white transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label="Decrease quantity"
                          >
                            <FaMinus size={10} />
                          </button>

                          {/* QUANTITY */}

                          <span className="w-6 text-center text-sm font-bold text-gray-900">
                            {item.quantity}
                          </span>

                          {/* PLUS */}

                          <button
                            type="button"
                            onClick={() => increaseQuantity(item.product._id)}
                            disabled={atStockLimit || maxStock <= 0}
                            className="flex h-8 w-8 items-center justify-center rounded-md bg-orange-500 text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-300"
                            aria-label="Increase quantity"
                          >
                            <FaPlus size={10} />
                          </button>
                        </div>

                        {/* ITEM TOTAL */}

                        <p className="text-sm font-bold text-gray-900 sm:text-base">
                          ₦{itemTotal.toLocaleString()}
                        </p>
                      </div>

                      {/* =========================
                          STOCK MESSAGE
                      ========================== */}

                      {atStockLimit && (
                        <p className="mt-2 text-xs text-gray-400">
                          Maximum available stock reached.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* =========================
              ORDER SUMMARY
          ========================== */}

          <div className="h-fit rounded-2xl bg-white p-5 shadow-sm lg:sticky lg:top-24">
            <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>

            <div className="mt-4 space-y-3 text-sm">
              {/* SUBTOTAL */}

              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>

                <span className="font-medium text-gray-900">
                  ₦{subtotal.toLocaleString()}
                </span>
              </div>

              {/* DELIVERY */}

              <div className="flex justify-between">
                <span className="text-gray-500">Delivery</span>

                <span className="font-medium text-gray-900">
                  ₦{deliveryFee.toLocaleString()}
                </span>
              </div>

              {/* TOTAL */}

              <div className="border-t border-gray-100 pt-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900">Total</span>

                  <span className="text-xl font-bold text-orange-500">
                    ₦{total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* CHECKOUT */}

            <Link
              to="/checkout"
              className="mt-5 block w-full rounded-xl bg-orange-500 py-4 text-center font-bold text-white transition hover:bg-orange-600"
            >
              Proceed to Checkout
            </Link>

            {/* CONTINUE SHOPPING */}

            <Link
              to="/"
              className="mt-3 block text-center text-sm font-semibold text-gray-500 transition hover:text-orange-500"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
