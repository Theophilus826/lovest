
import { useEffect, useState } from "react";
import {
  FolderOpen,
  ShoppingBag,
  Search,
} from "lucide-react";

import API from "../services/Api";

// ==========================================
// TYPES
// ==========================================

interface Category {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  imagePublicId?: string;
  active?: boolean;
  createdAt?: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  image?: string;
  category?:
    | string
    | {
        _id: string;
        name: string;
      };
}

// ==========================================
// COMPONENT
// ==========================================

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selected, setSelected] =
    useState<Category | null>(null);

  const [products, setProducts] = useState<Product[]>([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] =
    useState(false);

  const [message, setMessage] = useState("");

  // ==========================================
  // FETCH CATEGORIES
  // ==========================================

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await API.get(
        "/admin/categories"
      );

      console.log(
        "CATEGORIES RESPONSE:",
        response.data
      );

      const responseData = response.data;

      /*
       * Support both:
       *
       * {
       *   success: true,
       *   data: [...]
       * }
       *
       * and:
       *
       * {
       *   categories: [...]
       * }
       */

      const fetchedCategories =
        Array.isArray(responseData)
          ? responseData
          : responseData?.data ||
            responseData?.categories ||
            [];

      /*
       * Only active categories are shown
       * to customers.
       *
       * If active is missing, we treat
       * the category as active.
       */

      const activeCategories =
        fetchedCategories.filter(
          (category: Category) =>
            category.active !== false
        );

      setCategories(activeCategories);

      if (activeCategories.length > 0) {
        setSelected(activeCategories[0]);
      } else {
        setSelected(null);
        setProducts([]);
      }
    } catch (error: any) {
      console.error(
        "Failed to fetch categories:",
        error
      );

      const status =
        error?.response?.status;

      const serverMessage =
        error?.response?.data?.message;

      if (status === 404) {
        setMessage(
          "Categories API was not found. Check your backend route."
        );
      } else {
        setMessage(
          serverMessage ||
            "Failed to fetch categories."
        );
      }

      setCategories([]);
      setSelected(null);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FETCH PRODUCTS
  // ==========================================

  const fetchProducts = async (
    categoryId: string
  ) => {
    try {
      setProductsLoading(true);
      setMessage("");

      const response = await API.get(
        "/products",
        {
          params: {
            category: categoryId,
          },
        }
      );

      console.log(
        "PRODUCTS RESPONSE:",
        response.data
      );

      const responseData = response.data;

      const fetchedProducts =
        Array.isArray(responseData)
          ? responseData
          : responseData?.data ||
            responseData?.products ||
            [];

      setProducts(fetchedProducts);
    } catch (error: any) {
      console.error(
        "Failed to fetch products:",
        error
      );

      setProducts([]);

      setMessage(
        error?.response?.data?.message ||
          "Failed to fetch products."
      );
    } finally {
      setProductsLoading(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    fetchCategories();
  }, []);

  // ==========================================
  // FETCH PRODUCTS WHEN CATEGORY CHANGES
  // ==========================================

  useEffect(() => {
    if (!selected?._id) {
      setProducts([]);
      return;
    }

    fetchProducts(selected._id);
  }, [selected?._id]);

  // ==========================================
  // SELECT CATEGORY
  // ==========================================

  const handleCategorySelect = (
    category: Category
  ) => {
    setSelected(category);
  };

  // ==========================================
  // SEARCH
  // ==========================================

  const filteredCategories =
    categories.filter((category) => {
      const query =
        search.trim().toLowerCase();

      if (!query) {
        return true;
      }

      return (
        category.name
          .toLowerCase()
          .includes(query) ||
        category.description
          ?.toLowerCase()
          .includes(query)
      );
    });

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-orange-500" />

          <p className="mt-3 text-sm text-gray-500">
            Loading categories...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* =====================================
          HEADER
      ====================================== */}

      <div className="border-b bg-white px-4 py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FolderOpen size={16} />

              <span>Store</span>

              <span>/</span>

              <span className="text-gray-900">
                Categories
              </span>
            </div>

            <h1 className="mt-2 text-2xl font-bold text-gray-900">
              Categories
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Explore products by category
            </p>
          </div>

          {/* SEARCH */}

          <div className="relative w-full sm:w-72">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search categories..."
              className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-50"
            />
          </div>
        </div>
      </div>

      {/* =====================================
          MESSAGE
      ====================================== */}

      {message && (
        <div className="mx-4 mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {message}
        </div>
      )}

      {/* =====================================
          NO CATEGORIES
      ====================================== */}

      {categories.length === 0 ? (
        <div className="flex min-h-[500px] items-center justify-center px-4">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
              <FolderOpen size={30} />
            </div>

            <h2 className="mt-4 text-lg font-bold text-gray-900">
              No categories available
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Categories added by the admin
              will appear here.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex min-h-[calc(100vh-120px)]">
          {/* =================================
              LEFT CATEGORIES
          ================================== */}

          <aside className="w-28 shrink-0 border-r bg-white">
            <div className="sticky top-0">
              {filteredCategories.map(
                (category) => {
                  const active =
                    selected?._id ===
                    category._id;

                  return (
                    <button
                      key={category._id}
                      type="button"
                      onClick={() =>
                        handleCategorySelect(
                          category
                        )
                      }
                      className={`relative flex w-full flex-col items-center gap-2 px-2 py-5 text-center transition ${
                        active
                          ? "bg-orange-50 text-orange-500"
                          : "text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {active && (
                        <span className="absolute left-0 top-0 h-full w-1 rounded-r-full bg-orange-500" />
                      )}

                      <div
                        className={`flex h-11 w-11 items-center justify-center overflow-hidden rounded-full ${
                          active
                            ? "bg-orange-500 text-white"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {category.image ? (
                          <img
                            src={category.image}
                            alt={category.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <FolderOpen
                            size={20}
                          />
                        )}
                      </div>

                      <span
                        className={`line-clamp-2 text-xs ${
                          active
                            ? "font-semibold"
                            : "font-medium"
                        }`}
                      >
                        {category.name}
                      </span>
                    </button>
                  );
                }
              )}
            </div>
          </aside>

          {/* =================================
              RIGHT CONTENT
          ================================== */}

          <main className="min-w-0 flex-1 p-4">
            {selected && (
              <>
                {/* CATEGORY HEADER */}

                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {selected.name}
                    </h2>

                    <p className="mt-1 text-xs text-gray-500">
                      {selected.description ||
                        "Popular products"}
                    </p>
                  </div>

                  <span className="text-sm font-semibold text-orange-500">
                    {products.length} products
                  </span>
                </div>

                {/* CATEGORY BANNER */}

                <div className="mb-6 overflow-hidden rounded-2xl bg-orange-500">
                  <div className="flex items-center justify-between p-5">
                    <div className="text-white">
                      <p className="text-xs font-medium opacity-80">
                        Explore
                      </p>

                      <h3 className="mt-1 text-xl font-bold">
                        {selected.name}
                      </h3>

                      <p className="mt-1 max-w-xs text-xs opacity-80">
                        {selected.description ||
                          "Find what you need at great prices"}
                      </p>
                    </div>

                    {selected.image ? (
                      <img
                        src={selected.image}
                        alt={selected.name}
                        className="h-20 w-20 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-white/20 text-white">
                        <FolderOpen
                          size={30}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* PRODUCTS */}

                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">
                    Shop {selected.name}
                  </h3>

                  <span className="text-xs text-gray-500">
                    {products.length} products
                  </span>
                </div>

                {productsLoading ? (
                  <div className="flex min-h-[250px] items-center justify-center rounded-2xl bg-white">
                    <div className="text-center">
                      <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-gray-200 border-t-orange-500" />

                      <p className="mt-3 text-sm text-gray-500">
                        Loading products...
                      </p>
                    </div>
                  </div>
                ) : products.length ===
                  0 ? (
                  <div className="rounded-2xl bg-white px-4 py-16 text-center shadow-sm">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                      <ShoppingBag
                        size={25}
                      />
                    </div>

                    <h3 className="mt-4 text-sm font-bold text-gray-900">
                      No products yet
                    </h3>

                    <p className="mt-1 text-xs text-gray-500">
                      Products added to this
                      category will appear
                      here.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {products.map(
                      (product) => (
                        <button
                          key={
                            product._id
                          }
                          type="button"
                          className="overflow-hidden rounded-2xl bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                        >
                          <div className="h-36 w-full bg-gray-100">
                            {product.image ? (
                              <img
                                src={
                                  product.image
                                }
                                alt={
                                  product.name
                                }
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-gray-300">
                                <ShoppingBag
                                  size={35}
                                />
                              </div>
                            )}
                          </div>

                          <div className="p-3">
                            <p className="truncate text-sm font-semibold text-gray-900">
                              {product.name}
                            </p>

                            <p className="mt-2 text-sm font-bold text-orange-500">
                              ₦
                              {product.price.toLocaleString()}
                            </p>
                          </div>
                        </button>
                      )
                    )}
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      )}
    </div>
  );
}

