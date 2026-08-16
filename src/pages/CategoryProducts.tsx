import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FaArrowLeft, FaBoxOpen } from "react-icons/fa";

import API from "../services/Api";
import type { Product } from "../types/Product";

interface Category {
  _id: string;
  name: string;
  image?: string;
  description?: string;
}

export default function CategoryProducts() {
  const { id } = useParams<{ id: string }>();

  const [category, setCategory] =
    useState<Category | null>(null);

  const [products, setProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // =====================================
  // LOAD CATEGORY + PRODUCTS
  // =====================================

  useEffect(() => {
    if (!id) {
      setError("Category not found.");
      setLoading(false);
      return;
    }

    const loadCategory = async (
      categoryId: string,
    ): Promise<void> => {
      try {
        setLoading(true);
        setError("");

        // Get category
        const categoryResponse =
          await API.get(
            `/categories/${encodeURIComponent(categoryId)}`,
          );

        setCategory(
          categoryResponse.data?.data ?? null,
        );

        // Get products belonging to category
        const productsResponse =
          await API.get(
            `/products?category=${encodeURIComponent(
              categoryId,
            )}`,
          );

        const productData =
          productsResponse.data?.data;

        setProducts(
          Array.isArray(productData)
            ? productData
            : [],
        );
      } catch (error: unknown) {
        console.error(
          "FAILED TO LOAD CATEGORY:",
          error,
        );

        let message =
          "Failed to load category.";

        if (
          typeof error === "object" &&
          error !== null
        ) {
          const axiosError = error as {
            response?: {
              data?: {
                message?: unknown;
                error?: unknown;
              };
            };
            message?: unknown;
          };

          if (
            typeof axiosError.response?.data
              ?.message === "string"
          ) {
            message =
              axiosError.response.data.message;
          } else if (
            typeof axiosError.response?.data
              ?.error === "string"
          ) {
            message =
              axiosError.response.data.error;
          } else if (
            typeof axiosError.message === "string"
          ) {
            message = axiosError.message;
          }
        }

        setError(message);
        setCategory(null);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    void loadCategory(id);
  }, [id]);

  // =====================================
  // LOADING
  // =====================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-500">
          Loading products...
        </p>
      </div>
    );
  }

  // =====================================
  // RENDER
  // =====================================

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* HEADER */}

      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-3 px-4">
          <Link
            to="/"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-100"
            aria-label="Back home"
          >
            <FaArrowLeft />
          </Link>

          <div>
            <h1 className="text-lg font-bold text-gray-900">
              {category?.name || "Category"}
            </h1>

            {category?.description && (
              <p className="text-xs text-gray-500">
                {category.description}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* CONTENT */}

      <main className="mx-auto max-w-5xl px-4 py-6">
        {/* ERROR */}

        {error && (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <FaBoxOpen className="mx-auto text-4xl text-gray-300" />

            <h2 className="mt-4 font-bold text-gray-900">
              Unable to load category
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              {error}
            </p>

            <Link
              to="/"
              className="mt-5 inline-block rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              Back Home
            </Link>
          </div>
        )}

        {/* SUCCESS */}

        {!error && (
          <>
            <div className="mb-5">
              <h2 className="text-xl font-bold text-gray-900">
                {category?.name || "Products"}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {products.length}{" "}
                {products.length === 1
                  ? "product"
                  : "products"}
              </p>
            </div>

            {/* NO PRODUCTS */}

            {products.length === 0 ? (
              <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                <FaBoxOpen className="mx-auto text-4xl text-gray-300" />

                <h3 className="mt-4 font-bold text-gray-900">
                  No products found
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  There are no products in this
                  category yet.
                </p>
              </div>
            ) : (
              /* PRODUCTS */

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {products.map((product) => (
                  <Link
                    key={product._id}
                    to={`/product/${product._id}`}
                    className="overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-md"
                  >
                    <div className="aspect-square bg-gray-100">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <FaBoxOpen className="text-3xl text-gray-300" />
                        </div>
                      )}
                    </div>

                    <div className="p-3">
                      <h3 className="truncate text-sm font-semibold text-gray-900">
                        {product.name}
                      </h3>

                      <p className="mt-1 font-bold text-orange-500">
                        ₦
                        {Number(
                          product.price,
                        ).toLocaleString()}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}