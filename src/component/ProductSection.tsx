import { Link } from "react-router-dom";
import type { Product } from "../types/Product";
import ProductCard from "./ProductCard";

interface ProductSectionProps {
  title: string;
  products: Product[];
  loading?: boolean;
}

export default function ProductSection({
  title,
  products,
  loading = false,
}: ProductSectionProps) {
  return (
    <section className="space-y-5">
      {/* ==========================
          HEADER
      =========================== */}

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight text-gray-900">
          {title}
        </h2>

        <Link
          to="/products"
          className="text-sm font-semibold text-orange-500 transition hover:text-orange-600"
        >
          See All
        </Link>
      </div>

      {/* ==========================
          LOADING
      =========================== */}

      {loading && (
        <div className="py-12 text-center text-sm text-gray-500">
          Loading products...
        </div>
      )}

      {/* ==========================
          EMPTY
      =========================== */}

      {!loading &&
        products.length === 0 && (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-gray-500">
              No products available.
            </p>
          </div>
        )}

      {/* ==========================
          PRODUCTS
      =========================== */}

      {!loading &&
        products.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                showDescription={false}
              />
            ))}
          </div>
        )}
    </section>
  );
}