
import { useEffect, useMemo, useState } from "react";
import API from "../services/Api";

import Banner from "../component/Banner";
import CategorySection from "../component/CategorySection";
import ProductSection from "../component/ProductSection";
import DiscountSection from "../component/DiscountSection";

import type { Product } from "../types/Product";
import type { Category } from "../types/category";

interface CartItem {
  price: number;
  quantity: number;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] =
    useState(true);

  const [search] = useState("");
  const [cart] = useState<CartItem[]>([]);

  // =========================================================
  // LOAD HOME DATA
  // =========================================================

  useEffect(() => {
    const loadHomeData = async () => {
      await Promise.all([
        loadProducts(),
        loadCategories(),
      ]);
    };

    loadHomeData();
  }, []);

  // =========================================================
  // LOAD PRODUCTS
  // =========================================================

  const loadProducts = async () => {
    try {
      const response = await API.get("/products");

      console.log("HOME PRODUCTS:", response.data);

      const productData = response.data?.data;

      setProducts(
        Array.isArray(productData)
          ? productData
          : [],
      );
    } catch (error) {
      console.error(
        "FAILED TO LOAD PRODUCTS:",
        error,
      );

      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD CATEGORIES
  // =========================================================

  const loadCategories = async () => {
    try {
      const response = await API.get("/categories");

      console.log(
        "HOME CATEGORIES:",
        response.data,
      );

      const categoryData = response.data?.data;

      setCategories(
        Array.isArray(categoryData)
          ? categoryData
          : [],
      );
    } catch (error: any) {
      console.error(
        "FAILED TO LOAD CATEGORIES:",
        error,
      );

      console.error(
        "CATEGORY ERROR RESPONSE:",
        error?.response?.data,
      );

      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // =========================================================
  // FILTER PRODUCTS
  // =========================================================

  const filteredProducts = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    if (!searchTerm) {
      return products;
    }

    return products.filter((product) => {
      const name =
        product.name?.toLowerCase() || "";

      const description =
        product.description?.toLowerCase() || "";

      return (
        name.includes(searchTerm) ||
        description.includes(searchTerm)
      );
    });
  }, [products, search]);

  // =========================================================
  // CART TOTAL
  // =========================================================

  const cartTotal = useMemo(() => {
    return cart.reduce(
      (total, item) =>
        total +
        Number(item.price || 0) *
          Number(item.quantity || 0),
      0,
    );
  }, [cart]);

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="space-y-4 pb-4">
      {/* =====================================================
          BANNER
      ===================================================== */}

      <div className="-mt-4">
        <Banner />
      </div>

      {/* =====================================================
          DISCOUNTS
      ===================================================== */}

      <div>
        <DiscountSection subtotal={cartTotal} />
      </div>

      {/* =====================================================
          CATEGORIES
      ===================================================== */}

      {categoriesLoading ? (
        <section className="px-4 py-5">
          <h2 className="mb-4 text-lg font-bold">
            Categories
          </h2>

          <div className="grid grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="animate-pulse text-center"
              >
                <div className="mx-auto h-16 w-16 rounded-full bg-gray-200" />

                <div className="mx-auto mt-2 h-3 w-14 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        </section>
      ) : categories.length > 0 ? (
        <CategorySection
          categories={categories}
        />
      ) : (
        <section className="px-4 py-5">
          <h2 className="text-lg font-bold">
            Categories
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            No categories available.
          </p>
        </section>
      )}

      {/* =====================================================
          PRODUCTS
      ===================================================== */}

      <ProductSection
        title="Featured Products"
        products={filteredProducts}
        loading={loading}
      />
    </div>
  );
}

