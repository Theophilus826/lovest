import { useEffect, useState } from "react";
import { FaHeart } from "react-icons/fa";

import API from "../services/Api";
import ProductCard from "../component/ProductCard";
import type { Product } from "../types/Product";

export default function Wishlist() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      // Temporary: load products until wishlist API is connected
      const { data } = await API.get("/products");

      setProducts(data.data || []);
    } catch (error) {
      console.error("Failed to load wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="border-b bg-white px-4 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-50">
            <FaHeart className="text-lg text-orange-500" />
          </div>

          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Wishlist
            </h1>

            <p className="text-sm text-gray-500">
              Products you saved
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="p-4">
        {loading && (
          <div className="py-16 text-center">
            <p className="text-gray-500">Loading wishlist...</p>
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-50">
              <FaHeart className="text-3xl text-orange-400" />
            </div>

            <h2 className="mt-5 text-xl font-bold text-gray-900">
              Your wishlist is empty
            </h2>

            <p className="mt-2 max-w-xs text-sm text-gray-500">
              Save products you love and find them here later.
            </p>
          </div>
        )}

        {!loading && products.length > 0 && (
          <>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                Saved Products
              </h2>

              <span className="text-sm text-gray-500">
                {products.length} items
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}