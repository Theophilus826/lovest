import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import type { Product } from "../types/Product";

import {
  FaArrowLeft,
  FaChevronLeft,
  FaChevronRight,
  FaMinus,
  FaPlus,
  FaShoppingCart,
} from "react-icons/fa";

import API from "../services/Api";
import { useCart } from "../context/CartContext";

export default function ProductDetails() {
  const { id } = useParams<{
    id: string;
  }>();

  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);

  const [currentImage, setCurrentImage] = useState(0);

  const [quantity, setQuantity] = useState(1);

  const [loading, setLoading] = useState(true);

  const [addingToCart, setAddingToCart] = useState(false);

  const [cartMessage, setCartMessage] = useState("");

  const [cartError, setCartError] = useState("");

  const { addToCart } = useCart();

  // =====================================
  // FETCH PRODUCT
  // =====================================

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) {
        setProduct(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const response = await API.get(`/products/${id}`);

        console.log("PRODUCT RESPONSE:", response.data);

        /*
         * Adjust this if your API returns the
         * product directly instead of { data: product }.
         */
        const productData = response.data?.data ?? response.data;

        setProduct(productData || null);
      } catch (error) {
        console.error("Failed to fetch product:", error);

        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  // =====================================
  // LOADING
  // =====================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-500">Loading product...</p>
      </div>
    );
  }

  // =====================================
  // PRODUCT NOT FOUND
  // =====================================

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50">
        <p className="text-gray-500">Product not found.</p>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white"
        >
          Go back
        </button>
      </div>
    );
  }

  // =====================================
  // PRODUCT IMAGES
  // =====================================

  /*
   * Your shared Product type currently has
   * `image`, not `images`.
   *
   * Therefore use the single `image` field.
   */
  const productImages = product.image ? [product.image] : [];

  // =====================================
  // IMAGE NAVIGATION
  // =====================================

  const nextImage = () => {
    if (productImages.length === 0) {
      return;
    }

    setCurrentImage((prev) =>
      prev === productImages.length - 1 ? 0 : prev + 1,
    );
  };

  const previousImage = () => {
    if (productImages.length === 0) {
      return;
    }

    setCurrentImage((prev) =>
      prev === 0 ? productImages.length - 1 : prev - 1,
    );
  };

  // =====================================
  // PRICE / DISCOUNT
  // =====================================

  const currentPrice = Number(product.price || 0);

  const originalPrice = Number(product.originalPrice || 0);

  const hasDiscount = originalPrice > currentPrice && currentPrice > 0;

  const discountPercentage = hasDiscount
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;

  // =====================================
  // STOCK
  // =====================================

  const stock = Number(product.stock ?? 0);

  const isOutOfStock = stock <= 0;

  // =====================================
  // QUANTITY
  // =====================================

  const increaseQuantity = () => {
    if (stock <= 0) {
      return;
    }

    setQuantity((prev) => Math.min(prev + 1, stock));
  };

  const decreaseQuantity = () => {
    setQuantity((prev) => Math.max(prev - 1, 1));
  };

  // =====================================
  // ADD TO CART
  // =====================================

  const handleAddToCart = async (): Promise<void> => {
    if (!product) {
      toast.error("Product not found.");
      return;
    }

    const availableStock = product.stock ?? 0;

    if (availableStock <= 0) {
      toast.error("This product is currently out of stock.");
      return;
    }

    if (quantity < 1) {
      setCartError("Please select at least 1 item.");
      return;
    }

    if (quantity > availableStock) {
      setCartError(
        `Only ${availableStock} item${
          availableStock === 1 ? "" : "s"
        } available.`,
      );
      return;
    }

    try {
      setAddingToCart(true);
      setCartMessage("");
      setCartError("");

      addToCart(product, quantity);

      console.log("ADDED TO CART:", product._id, quantity);

      setCartMessage(`${product.name} added to your cart.`);

      window.setTimeout(() => {
        navigate("/cart");
      }, 500);
    } catch (error: unknown) {
      console.error("Failed to add product to cart:", error);

      let message = "Unable to add this product to cart.";

      if (typeof error === "object" && error !== null) {
        const err = error as {
          response?: {
            data?: {
              message?: unknown;
              error?: unknown;
            };
          };
          message?: unknown;
        };

        if (typeof err.response?.data?.message === "string") {
          message = err.response.data.message;
        } else if (typeof err.response?.data?.error === "string") {
          message = err.response.data.error;
        } else if (typeof err.message === "string") {
          message = err.message;
        }
      }

      setCartError(message);
    } finally {
      setAddingToCart(false);
    }
  };

  // =====================================
  // REST OF YOUR JSX
  // =====================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ==========================
          HEADER
      =========================== */}

      <header className="sticky top-0 z-50 flex items-center gap-4 bg-white px-4 py-4 shadow-sm">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-full p-2 transition hover:bg-gray-100"
          aria-label="Go back"
        >
          <FaArrowLeft />
        </button>

        <h1 className="text-lg font-semibold">Product Details</h1>
      </header>

      {/* ==========================
          IMAGE SLIDER
      =========================== */}

      <section className="bg-white">
        <div className="relative flex h-[380px] items-center justify-center overflow-hidden bg-gray-100">
          {productImages.length > 0 ? (
            <>
              <img
                src={productImages[currentImage]}
                alt={`${product.name} ${currentImage + 1}`}
                className="h-full w-full object-contain"
              />

              {/* Previous */}

              {productImages.length > 1 && (
                <button
                  type="button"
                  onClick={previousImage}
                  className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow transition hover:bg-white"
                  aria-label="Previous image"
                >
                  <FaChevronLeft />
                </button>
              )}

              {/* Next */}

              {productImages.length > 1 && (
                <button
                  type="button"
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow transition hover:bg-white"
                  aria-label="Next image"
                >
                  <FaChevronRight />
                </button>
              )}

              {/* Image Counter */}

              {productImages.length > 1 && (
                <div className="absolute bottom-4 right-4 rounded-full bg-black/60 px-3 py-1 text-sm text-white">
                  {currentImage + 1} / {productImages.length}
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-500">No image available</p>
          )}
        </div>

        {/* ==========================
            THUMBNAILS
        =========================== */}

        {productImages.length > 1 && (
          <div className="flex gap-3 overflow-x-auto p-4">
            {productImages.map((image, index) => (
              <button
                type="button"
                key={`${image}-${index}`}
                onClick={() => setCurrentImage(index)}
                className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 ${
                  currentImage === index
                    ? "border-orange-500"
                    : "border-transparent"
                }`}
              >
                <img
                  src={image}
                  alt={`${product.name} thumbnail ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </section>

      {/* ==========================
          PRODUCT INFO
      =========================== */}

      <main className="space-y-5 p-4">
        {/* Name */}

        <div>
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>

            {product.featured && (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                Featured
              </span>
            )}
          </div>

          {/* ==========================
              PRICES
          =========================== */}

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="text-2xl font-bold text-orange-500">
              ₦{currentPrice.toLocaleString()}
            </span>

            {hasDiscount && (
              <>
                <span className="text-base font-medium text-gray-400 line-through">
                  ₦{originalPrice.toLocaleString()}
                </span>

                <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600">
                  -{discountPercentage}%
                </span>
              </>
            )}
          </div>
        </div>

        {/* ==========================
            STOCK
        =========================== */}

        {product.stock !== undefined && (
          <div>
            {stock > 0 ? (
              <span className="inline-flex rounded-full bg-green-50 px-3 py-1.5 text-sm font-semibold text-green-600">
                {stock} in stock
              </span>
            ) : (
              <span className="inline-flex rounded-full bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-500">
                Out of stock
              </span>
            )}
          </div>
        )}

        {/* ==========================
            DESCRIPTION
        =========================== */}

        {product.description && (
          <div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Description
            </h3>

            <p className="whitespace-pre-line text-sm leading-6 text-gray-600">
              {product.description}
            </p>
          </div>
        )}

        {/* ==========================
            QUANTITY
        =========================== */}

        {!isOutOfStock && (
          <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-900">
              Quantity
            </h3>

            <div className="flex w-fit items-center overflow-hidden rounded-xl border border-gray-200 bg-white">
              <button
                type="button"
                onClick={decreaseQuantity}
                disabled={quantity <= 1 || addingToCart}
                className="flex h-11 w-11 items-center justify-center text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Decrease quantity"
              >
                <FaMinus size={12} />
              </button>

              <span className="flex h-11 min-w-[50px] items-center justify-center border-x border-gray-200 px-4 text-sm font-semibold">
                {quantity}
              </span>

              <button
                type="button"
                onClick={increaseQuantity}
                disabled={quantity >= stock || addingToCart}
                className="flex h-11 w-11 items-center justify-center text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Increase quantity"
              >
                <FaPlus size={12} />
              </button>
            </div>
          </div>
        )}

        {/* ==========================
            CART FEEDBACK
        =========================== */}

        {cartMessage && (
          <div className="rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {cartMessage}
          </div>
        )}

        {cartError && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {cartError}
          </div>
        )}

        {/* ==========================
            ADD TO CART
        =========================== */}

        <button
          type="button"
          disabled={isOutOfStock || addingToCart}
          onClick={handleAddToCart}
          className="flex w-full items-center justify-center gap-3 rounded-xl bg-orange-500 py-4 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {addingToCart ? (
            <>
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Adding to Cart...
            </>
          ) : isOutOfStock ? (
            "Out of Stock"
          ) : (
            <>
              <FaShoppingCart />
              Add to Cart
            </>
          )}
        </button>
      </main>
    </div>
  );
}
