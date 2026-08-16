import { useEffect, useMemo, useState } from "react";
import API from "../services/Api";

import {
  AlertCircle,
  Check,
  ChevronDown,
  Edit,
  Eye,
  ImagePlus,
  Loader2,
  Package,
  RefreshCw,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";

// ==========================================
// TYPES
// ==========================================

interface Category {
  _id: string;
  name: string;
}

interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;

  category?: Category | string | null;

  stock?: number;
  featured?: boolean;
  active?: boolean;

  image?: string;
  images?: string[];

  imagePublicId?: string;
  imagePublicIds?: string[];

  createdAt?: string;
  updatedAt?: string;
}

interface ProductForm {
  name: string;
  description: string;
  price: string;
  category: string;
  stock: string;
  featured: boolean;
  active: boolean;
}

type ProductFilter =
  | "all"
  | "active"
  | "inactive"
  | "featured";

// ==========================================
// ADMIN PRODUCTS
// ==========================================

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] =
    useState<ProductFilter>("all");

  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);

  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [updatingId, setUpdatingId] =
    useState<string | null>(null);

  // ==========================================
  // FETCH PRODUCTS
  // ==========================================

  const fetchProducts = async (
    showRefresh = false
  ) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await API.get(
        "/admin/products"
      );

      const productData = response.data?.data;

      setProducts(
        Array.isArray(productData)
          ? productData
          : []
      );
    } catch (err: any) {
      console.error(
        "Failed to fetch products:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to fetch products"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ==========================================
  // FETCH CATEGORIES
  // ==========================================

  const fetchCategories = async () => {
    try {
      const response = await API.get(
        "/admin/categories"
      );

      const categoryData =
        response.data?.data;

      setCategories(
        Array.isArray(categoryData)
          ? categoryData
          : []
      );
    } catch (err: any) {
      console.error(
        "Failed to fetch categories:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to fetch categories"
      );
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // ==========================================
  // CATEGORY NAME
  // ==========================================

  const getCategoryName = (
    product: Product
  ) => {
    if (
      product.category &&
      typeof product.category === "object"
    ) {
      return (
        product.category.name ||
        "Uncategorized"
      );
    }

    const category = categories.find(
      (item) =>
        item._id === product.category
    );

    return (
      category?.name ||
      "Uncategorized"
    );
  };

  // ==========================================
  // CATEGORY ID
  // ==========================================

  

  // ==========================================
  // PRODUCT IMAGES
  // ==========================================

  const getProductImages = (
    product: Product
  ): string[] => {
    if (
      Array.isArray(product.images) &&
      product.images.length > 0
    ) {
      return product.images;
    }

    if (product.image) {
      return [product.image];
    }

    return [];
  };

  // ==========================================
  // STATISTICS
  // ==========================================

  const statistics = useMemo(() => {
    const active = products.filter(
      (product) =>
        product.active === true
    ).length;

    const inactive = products.filter(
      (product) =>
        product.active !== true
    ).length;

    const featured = products.filter(
      (product) =>
        product.featured === true
    ).length;

    const totalStock = products.reduce(
      (sum, product) =>
        sum +
        Number(product.stock || 0),
      0
    );

    return {
      total: products.length,
      active,
      inactive,
      featured,
      totalStock,
    };
  }, [products]);

  // ==========================================
  // FILTER PRODUCTS
  // ==========================================

  const filteredProducts = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return products.filter(
      (product) => {
        const categoryName =
          getCategoryName(product);

        const matchesSearch =
          !query ||
          product.name
            .toLowerCase()
            .includes(query) ||
          categoryName
            .toLowerCase()
            .includes(query);

        let matchesFilter = true;

        if (filter === "active") {
          matchesFilter =
            product.active === true;
        }

        if (filter === "inactive") {
          matchesFilter =
            product.active !== true;
        }

        if (filter === "featured") {
          matchesFilter =
            product.featured === true;
        }

        return (
          matchesSearch &&
          matchesFilter
        );
      }
    );
  }, [
    products,
    search,
    filter,
    categories,
  ]);

  // ==========================================
  // UPDATE PRODUCT
  // ==========================================

  const updateProduct = async (
    product: Product,
    form: ProductForm,
    images: File[]
  ) => {
    try {
      setUpdatingId(product._id);
      setError("");

      const formData = new FormData();

      formData.append(
        "name",
        form.name.trim()
      );

      formData.append(
        "description",
        form.description.trim()
      );

      formData.append(
        "price",
        form.price
      );

      formData.append(
        "category",
        form.category
      );

      formData.append(
        "stock",
        form.stock || "0"
      );

      formData.append(
        "featured",
        String(form.featured)
      );

      formData.append(
        "active",
        String(form.active)
      );

      // Backend uses:
      // upload.array("images", 5)

      images.forEach((file) => {
        formData.append(
          "images",
          file
        );
      });

      const response = await API.put(
        `/admin/products/${product._id}`,
        formData
      );

      const updatedProduct =
        response.data?.data;

      if (!updatedProduct) {
        throw new Error(
          "Updated product was not returned by the server"
        );
      }

      setProducts(
        (currentProducts) =>
          currentProducts.map(
            (item) =>
              item._id === product._id
                ? updatedProduct
                : item
          )
      );

      setEditingProduct(null);
      setSelectedProduct(null);
    } catch (err: any) {
      console.error(
        "Failed to update product:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update product"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // ==========================================
  // DELETE PRODUCT
  // ==========================================

  const deleteProduct = async (
    product: Product
  ) => {
    const confirmed =
      window.confirm(
        `Are you sure you want to permanently delete "${product.name}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(product._id);
      setError("");

      await API.delete(
        `/admin/products/${product._id}`
      );

      setProducts(
        (currentProducts) =>
          currentProducts.filter(
            (item) =>
              item._id !== product._id
          )
      );

      if (
        selectedProduct?._id ===
        product._id
      ) {
        setSelectedProduct(null);
      }

      if (
        editingProduct?._id ===
        product._id
      ) {
        setEditingProduct(null);
      }
    } catch (err: any) {
      console.error(
        "Failed to delete product:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete product"
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Package size={16} />

            <span>Catalog</span>

            <span>/</span>

            <span className="text-slate-900">
              Products
            </span>
          </div>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            Products
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your product catalog,
            inventory and product images.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            fetchProducts(true)
          }
          disabled={refreshing}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw
            size={17}
            className={
              refreshing
                ? "animate-spin"
                : ""
            }
          />

          Refresh
        </button>
      </div>

      {/* ERROR */}

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <AlertCircle size={18} />

          <span>{error}</span>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
            className="ml-auto"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* STATISTICS */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <ProductStat
          title="Total products"
          value={statistics.total}
          description="Products in catalog"
          icon={
            <Package size={20} />
          }
        />

        <ProductStat
          title="Active"
          value={statistics.active}
          description="Currently visible"
          icon={
            <Check size={20} />
          }
        />

        <ProductStat
          title="Featured"
          value={statistics.featured}
          description="Featured products"
          icon={
            <Star size={20} />
          }
        />

        <ProductStat
          title="Total stock"
          value={statistics.totalStock}
          description="Units currently available"
          icon={
            <Package size={20} />
          }
        />

      </div>

      {/* FILTERS */}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

          <div className="relative w-full xl:max-w-lg">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search products or categories..."
              className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            />
          </div>

          <div className="relative">
            <select
              value={filter}
              onChange={(event) =>
                setFilter(
                  event.target
                    .value as ProductFilter
                )
              }
              className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-10 text-sm font-medium text-slate-700 outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100 sm:w-48"
            >
              <option value="all">
                All products
              </option>

              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>

              <option value="featured">
                Featured
              </option>
            </select>

            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>

        </div>
      </div>

      {/* PRODUCTS TABLE */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="font-semibold text-slate-900">
            Product catalog
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {filteredProducts.length}{" "}
            product
            {filteredProducts.length ===
            1
              ? ""
              : "s"} displayed.
          </p>
        </div>

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1050px]">

            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Product
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Category
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Price
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Stock
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>

                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>

              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">

              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-14 text-center"
                  >
                    <Loader2
                      size={25}
                      className="mx-auto animate-spin text-slate-400"
                    />

                    <p className="mt-3 text-sm text-slate-500">
                      Loading products...
                    </p>
                  </td>
                </tr>
              ) : filteredProducts.length ===
                0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-14 text-center"
                  >
                    <Package
                      size={32}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 text-sm font-semibold text-slate-700">
                      No products found
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Try changing your search
                      or filter.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map(
                  (product) => {
                    const images =
                      getProductImages(
                        product
                      );

                    return (
                      <tr
                        key={
                          product._id
                        }
                        className="transition hover:bg-slate-50"
                      >

                        {/* PRODUCT */}

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">

                            {images[0] ? (
                              <img
                                src={
                                  images[0]
                                }
                                alt={
                                  product.name
                                }
                                className="h-12 w-12 rounded-xl object-cover"
                              />
                            ) : (
                              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                                <Package
                                  size={20}
                                />
                              </div>
                            )}

                            <div>
                              <div className="flex items-center gap-2">

                                <p className="max-w-[220px] truncate text-sm font-semibold text-slate-900">
                                  {
                                    product.name
                                  }
                                </p>

                                {product.featured && (
                                  <Star
                                    size={
                                      14
                                    }
                                    className="fill-current text-amber-400"
                                  />
                                )}

                              </div>

                              <p className="mt-1 text-xs text-slate-400">
                                {images.length}{" "}
                                image
                                {images.length ===
                                1
                                  ? ""
                                  : "s"}
                              </p>
                            </div>

                          </div>
                        </td>

                        {/* CATEGORY */}

                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-600">
                            {getCategoryName(
                              product
                            )}
                          </span>
                        </td>

                        {/* PRICE */}

                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-slate-900">
                            {Number(
                              product.price
                            ).toLocaleString()}
                          </span>
                        </td>

                        {/* STOCK */}

                        <td className="px-6 py-4">
                          <span
                            className={
                              Number(
                                product.stock ||
                                  0
                              ) <= 0
                                ? "text-sm font-semibold text-red-600"
                                : "text-sm font-semibold text-slate-700"
                            }
                          >
                            {product.stock ||
                              0}
                          </span>
                        </td>

                        {/* STATUS */}

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${
                              product.active
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {product.active
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>

                        {/* ACTIONS */}

                        <td className="px-6 py-4">

                          <div className="flex justify-end gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                setSelectedProduct(
                                  product
                                )
                              }
                              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                            >
                              <Eye
                                size={14}
                              />

                              View
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setEditingProduct(
                                  product
                                )
                              }
                              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                            >
                              <Edit
                                size={14}
                              />

                              Edit
                            </button>

                            <button
                              type="button"
                              disabled={
                                deletingId ===
                                product._id
                              }
                              onClick={() =>
                                deleteProduct(
                                  product
                                )
                              }
                              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-red-200 px-3 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                            >
                              {deletingId ===
                              product._id ? (
                                <Loader2
                                  size={14}
                                  className="animate-spin"
                                />
                              ) : (
                                <Trash2
                                  size={14}
                                />
                              )}

                              Delete
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )
              )}

            </tbody>

          </table>

        </div>

      </section>

      {/* VIEW MODAL */}

      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={() =>
            setSelectedProduct(null)
          }
          onEdit={() => {
            setEditingProduct(
              selectedProduct
            );

            setSelectedProduct(null);
          }}
          onDelete={() =>
            deleteProduct(
              selectedProduct
            )
          }
          deleting={
            deletingId ===
            selectedProduct._id
          }
        />
      )}

      {/* EDIT MODAL */}

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          categories={categories}
          updating={
            updatingId ===
            editingProduct._id
          }
          onClose={() =>
            setEditingProduct(null)
          }
          onSave={(
            form,
            images
          ) =>
            updateProduct(
              editingProduct,
              form,
              images
            )
          }
        />
      )}

    </div>
  );
}

// ==========================================
// PRODUCT STAT
// ==========================================

function ProductStat({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-start justify-between gap-4">

        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          {icon}
        </div>

      </div>

      <p className="mt-3 text-xs text-slate-400">
        {description}
      </p>

    </div>
  );
}

// ==========================================
// PRODUCT DETAILS MODAL
// ==========================================

function ProductDetailsModal({
  product,
  onClose,
  onEdit,
  onDelete,
  deleting,
}: {
  product: Product;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  const images =
    Array.isArray(product.images) &&
    product.images.length > 0
      ? product.images
      : product.image
        ? [product.image]
        : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">

      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Product details
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              View product information
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={20} />
          </button>

        </div>

        {/* CONTENT */}

        <div className="space-y-6 p-6">

          {/* IMAGES */}

          {images.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

              {images.map(
                (image, index) => (
                  <img
                    key={`${image}-${index}`}
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="aspect-square w-full rounded-xl object-cover"
                  />
                )
              )}

            </div>
          )}

          {/* PRODUCT INFO */}

          <div>

            <div className="flex flex-wrap items-center gap-2">

              <h3 className="text-xl font-bold text-slate-900">
                {product.name}
              </h3>

              {product.featured && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                  <Star
                    size={13}
                    className="fill-current"
                  />

                  Featured
                </span>
              )}

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  product.active
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {product.active
                  ? "Active"
                  : "Inactive"}
              </span>

            </div>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              {product.description ||
                "No description provided."}
            </p>

          </div>

          {/* DETAILS GRID */}

          <div className="grid gap-4 sm:grid-cols-3">

            <DetailBox
              label="Price"
              value={Number(
                product.price
              ).toLocaleString()}
            />

            <DetailBox
              label="Stock"
              value={String(
                product.stock || 0
              )}
            />

            <DetailBox
              label="Category"
              value={
                product.category &&
                typeof product.category ===
                  "object"
                  ? product.category.name
                  : String(
                      product.category ||
                        "Uncategorized"
                    )
              }
            />

          </div>

        </div>

        {/* FOOTER */}

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 px-6 py-5 sm:flex-row sm:justify-end">

          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-200 px-4 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            {deleting ? (
              <Loader2
                size={16}
                className="animate-spin"
              />
            ) : (
              <Trash2 size={16} />
            )}

            Delete
          </button>

          <button
            type="button"
            onClick={onEdit}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <Edit size={16} />

            Edit product
          </button>

        </div>

      </div>

    </div>
  );
}

// ==========================================
// DETAIL BOX
// ==========================================

function DetailBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-sm font-semibold text-slate-900">
        {value}
      </p>

    </div>
  );
}

// ==========================================
// EDIT PRODUCT MODAL
// ==========================================

function EditProductModal({
  product,
  categories,
  updating,
  onClose,
  onSave,
}: {
  product: Product;
  categories: Category[];
  updating: boolean;
  onClose: () => void;
  onSave: (
    form: ProductForm,
    images: File[]
  ) => void;
}) {
  const initialCategory =
    product.category &&
    typeof product.category ===
      "object"
      ? product.category._id
      : product.category || "";

  const [form, setForm] =
    useState<ProductForm>({
      name: product.name || "",
      description:
        product.description || "",
      price: String(
        product.price ?? ""
      ),
      category: initialCategory,
      stock: String(
        product.stock ?? 0
      ),
      featured:
        product.featured === true,
      active:
        product.active !== false,
    });

  const [images, setImages] =
    useState<File[]>([]);

  const [imagePreviews, setImagePreviews] =
    useState<string[]>([]);

  // ==========================================
  // IMAGE SELECTION
  // ==========================================

  const handleImagesChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(
      event.target.files || []
    );

    const limitedFiles =
      files.slice(0, 5);

    setImages(limitedFiles);

    const previews =
      limitedFiles.map((file) =>
        URL.createObjectURL(file)
      );

    setImagePreviews(previews);
  };

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!form.name.trim()) {
      return;
    }

    onSave(form, images);
  };

  // ==========================================
  // CURRENT IMAGES
  // ==========================================

  const existingImages =
    Array.isArray(product.images) &&
    product.images.length > 0
      ? product.images
      : product.image
        ? [product.image]
        : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">

      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Edit product
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Update product information
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={updating}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X size={20} />
          </button>

        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="space-y-6 p-6"
        >

          {/* NAME */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Product name
            </label>

            <input
              type="text"
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
              required
            />
          </div>

          {/* DESCRIPTION */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Description
            </label>

            <textarea
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description:
                    event.target.value,
                }))
              }
              rows={4}
              className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            />
          </div>

          {/* PRICE / STOCK / CATEGORY */}

          <div className="grid gap-4 sm:grid-cols-3">

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Price
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    price:
                      event.target.value,
                  }))
                }
                className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Stock
              </label>

              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    stock:
                      event.target.value,
                  }))
                }
                className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Category
              </label>

              <select
                value={form.category}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    category:
                      event.target.value,
                  }))
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
              >
                <option value="">
                  Select category
                </option>

                {categories.map(
                  (category) => (
                    <option
                      key={
                        category._id
                      }
                      value={
                        category._id
                      }
                    >
                      {category.name}
                    </option>
                  )
                )}
              </select>
            </div>

          </div>

          {/* STATUS */}

          <div className="grid gap-3 sm:grid-cols-2">

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    active:
                      event.target.checked,
                  }))
                }
                className="h-4 w-4"
              />

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Active product
                </p>

                <p className="text-xs text-slate-400">
                  Product is visible in the store
                </p>
              </div>
            </label>

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    featured:
                      event.target.checked,
                  }))
                }
                className="h-4 w-4"
              />

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Featured product
                </p>

                <p className="text-xs text-slate-400">
                  Highlight this product
                </p>
              </div>
            </label>

          </div>

          {/* EXISTING IMAGES */}

          {existingImages.length >
            0 && (
            <div>

              <p className="mb-3 text-sm font-semibold text-slate-700">
                Current images
              </p>

              <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">

                {existingImages.map(
                  (
                    image,
                    index
                  ) => (
                    <img
                      key={`${image}-${index}`}
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="aspect-square w-full rounded-xl object-cover"
                    />
                  )
                )}

              </div>

            </div>
          )}

          {/* NEW IMAGES */}

          <div>

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Replace/add images
            </label>

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 px-6 py-8 text-center transition hover:border-slate-400 hover:bg-slate-50">

              <ImagePlus
                size={28}
                className="text-slate-400"
              />

              <p className="mt-2 text-sm font-semibold text-slate-700">
                Choose product images
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Up to 5 images
              </p>

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={
                  handleImagesChange
                }
                className="hidden"
              />

            </label>

            {imagePreviews.length >
              0 && (
              <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">

                {imagePreviews.map(
                  (
                    image,
                    index
                  ) => (
                    <img
                      key={`${image}-${index}`}
                      src={image}
                      alt={`Preview ${index + 1}`}
                      className="aspect-square w-full rounded-xl object-cover"
                    />
                  )
                )}

              </div>
            )}

          </div>

          {/* FOOTER */}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={onClose}
              disabled={updating}
              className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                updating ||
                !form.name.trim()
              }
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {updating && (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              )}

              {updating
                ? "Saving..."
                : "Save changes"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}