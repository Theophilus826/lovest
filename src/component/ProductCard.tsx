import { FaHeart, FaShoppingCart } from "react-icons/fa";
import { Link } from "react-router-dom";
import type { Product } from "../types/Product";
import { useCart } from "../context/CartContext";

interface Props {
  product: Product;
  showDescription?: boolean;
}

export default function ProductCard({
  product,
  showDescription = true,
}: Props) {
  const { addToCart } = useCart();

  // =====================================
  // CATEGORY
  // =====================================

  const categoryName =
    typeof product.category === "string"
      ? product.category
      : product.category?.name;

  // =====================================
  // PRICE / DISCOUNT
  // =====================================

  const originalPrice = Number(
    product.originalPrice || 0
  );

  const sellingPrice = Number(
    product.price || 0
  );

  const hasDiscount =
    originalPrice > sellingPrice &&
    sellingPrice > 0;

  const discountPercentage = hasDiscount
    ? Math.round(
        ((originalPrice - sellingPrice) /
          originalPrice) *
          100
      )
    : 0;

  // =====================================
  // STOCK
  // =====================================

  const stock = Number(product.stock ?? 0);

  const isOutOfStock = stock <= 0;

  // =====================================
  // ADD TO CART
  // =====================================

  const handleAddToCart = (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) {
      return;
    }

    console.log("ADDING TO CART:", product);

    addToCart(product);
  };

  // =====================================
  // WISHLIST
  // =====================================

  const handleWishlist = (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();

    // Wishlist functionality
  };

  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-md">

      {/* =========================
          PRODUCT IMAGE
      ========================== */}

      <div className="relative">
        <Link
          to={`/product/${product._id}`}
          className="block"
        >
          <div className="aspect-square overflow-hidden bg-gray-100">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover transition duration-500 hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-400">
                No image
              </div>
            )}
          </div>
        </Link>

        {/* Wishlist */}

        <button
          type="button"
          onClick={handleWishlist}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow transition hover:bg-red-50"
          aria-label={`Add ${product.name} to wishlist`}
        >
          <FaHeart className="text-gray-500 transition hover:text-red-500" />
        </button>

        {/* Featured */}

        {product.featured && (
          <span className="absolute left-3 top-3 rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
            Featured
          </span>
        )}

        {/* Out of Stock */}

        {isOutOfStock && (
          <span className="absolute bottom-3 left-3 rounded-full bg-gray-900/80 px-3 py-1 text-xs font-semibold text-white">
            Out of stock
          </span>
        )}
      </div>

      {/* =========================
          CONTENT
      ========================== */}

      <div className="space-y-3 p-4">

        {/* Category */}

        {categoryName && (
          <span className="inline-block rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
            {categoryName}
          </span>
        )}

        {/* Product Name */}

        <Link
          to={`/product/${product._id}`}
        >
          <h3 className="line-clamp-2 text-base font-semibold text-gray-800 transition hover:text-orange-500">
            {product.name}
          </h3>
        </Link>

        {/* Description */}

        {showDescription &&
          product.description && (
            <p className="line-clamp-2 text-sm text-gray-500">
              {product.description}
            </p>
          )}

        {/* =========================
            PRICE
        ========================== */}

        <div className="space-y-2">

          {hasDiscount && (
            <span className="inline-flex rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-600">
              -{discountPercentage}% OFF
            </span>
          )}

          <div className="flex flex-wrap items-center gap-3">

            {/* Selling price */}

            <p className="text-xl font-bold text-orange-500">
              ₦{sellingPrice.toLocaleString()}
            </p>

            {/* Original price */}

            {hasDiscount && (
              <span className="text-sm font-medium text-gray-400 line-through">
                ₦{originalPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* =========================
            ADD TO CART
        ========================== */}

        <button
          type="button"
          disabled={isOutOfStock}
          onClick={handleAddToCart}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          <FaShoppingCart />

          {isOutOfStock
            ? "Out of Stock"
            : "Add to Cart"}
        </button>
      </div>
    </article>
  );
}