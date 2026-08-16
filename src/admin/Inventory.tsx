import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Box,
  CheckCircle2,
  ChevronDown,
  Package,
  RefreshCw,
  Search,
  X,
  XCircle,
} from "lucide-react";

interface Product {
  _id: string;
  name: string;
  category?: string;
  price: number;
  stock: number;
  image?: string;
  active: boolean;
}

type StockFilter = "all" | "in-stock" | "low-stock" | "out-of-stock";

const LOW_STOCK_LIMIT = 10;

export default function AdminInventory() {
  const [products, setProducts] = useState<Product[]>([]);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StockFilter>("all");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [message, setMessage] = useState("");

  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(
    null,
  );

  const [adjustment, setAdjustment] = useState<number>(0);

  const [adjustmentMode, setAdjustmentMode] = useState<"add" | "remove">("add");

  const [saving, setSaving] = useState(false);

  // ==========================================
  // FETCH PRODUCTS
  // ==========================================

  const fetchProducts = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setMessage("");

      const response = await fetch("/api/admin/products");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch inventory");
      }

      setProducts(data.data || []);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to fetch inventory",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ==========================================
  // INVENTORY STATISTICS
  // ==========================================

  const statistics = useMemo(() => {
    const totalProducts = products.length;

    const totalUnits = products.reduce(
      (total, product) => total + Number(product.stock || 0),
      0,
    );

    const lowStock = products.filter(
      (product) => product.stock > 0 && product.stock <= LOW_STOCK_LIMIT,
    ).length;

    const outOfStock = products.filter((product) => product.stock <= 0).length;

    const inventoryValue = products.reduce(
      (total, product) =>
        total + Number(product.price || 0) * Number(product.stock || 0),
      0,
    );

    return {
      totalProducts,
      totalUnits,
      lowStock,
      outOfStock,
      inventoryValue,
    };
  }, [products]);

  // ==========================================
  // FILTER PRODUCTS
  // ==========================================

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.category?.toLowerCase().includes(search.toLowerCase());

      let matchesFilter = true;

      if (filter === "in-stock") {
        matchesFilter = product.stock > LOW_STOCK_LIMIT;
      }

      if (filter === "low-stock") {
        matchesFilter = product.stock > 0 && product.stock <= LOW_STOCK_LIMIT;
      }

      if (filter === "out-of-stock") {
        matchesFilter = product.stock <= 0;
      }

      return matchesSearch && matchesFilter;
    });
  }, [products, search, filter]);

  // ==========================================
  // STOCK STATUS
  // ==========================================

  const getStockStatus = (stock: number) => {
    if (stock <= 0) {
      return {
        label: "Out of stock",
        className: "bg-red-50 text-red-700",
        icon: <XCircle size={14} />,
      };
    }

    if (stock <= LOW_STOCK_LIMIT) {
      return {
        label: "Low stock",
        className: "bg-amber-50 text-amber-700",
        icon: <AlertTriangle size={14} />,
      };
    }

    return {
      label: "In stock",
      className: "bg-emerald-50 text-emerald-700",
      icon: <CheckCircle2 size={14} />,
    };
  };

  // ==========================================
  // OPEN ADJUSTMENT
  // ==========================================

  const openAdjustment = (product: Product, mode: "add" | "remove") => {
    setAdjustingProduct(product);
    setAdjustmentMode(mode);
    setAdjustment(0);
    setMessage("");
  };

  const closeAdjustment = () => {
    if (saving) return;

    setAdjustingProduct(null);
    setAdjustment(0);
  };

  // ==========================================
  // UPDATE STOCK
  // ==========================================

  const handleStockUpdate = async () => {
    if (!adjustingProduct) return;

    if (!Number.isInteger(adjustment) || adjustment <= 0) {
      setMessage("Enter a valid quantity greater than 0.");
      return;
    }

    if (adjustmentMode === "remove" && adjustment > adjustingProduct.stock) {
      setMessage("You cannot remove more stock than available.");
      return;
    }

    const newStock =
      adjustmentMode === "add"
        ? adjustingProduct.stock + adjustment
        : adjustingProduct.stock - adjustment;

    try {
      setSaving(true);
      setMessage("");

      const response = await fetch(
        `/api/admin/products/${adjustingProduct._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            stock: newStock,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update stock");
      }

      setProducts((current) =>
        current.map((product) =>
          product._id === adjustingProduct._id
            ? {
                ...product,
                stock: newStock,
              }
            : product,
        ),
      );

      setMessage(
        `Stock updated successfully. ${
          adjustingProduct.name
        } now has ${newStock} units.`,
      );

      closeAdjustment();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to update stock",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* =====================================
          HEADER
      ====================================== */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Package size={16} />
            <span>Store</span>
            <span>/</span>
            <span className="text-slate-900">Inventory</span>
          </div>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            Inventory
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Monitor stock levels and manage product inventory.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchProducts(true)}
          disabled={refreshing}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw size={17} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* =====================================
          MESSAGE
      ====================================== */}

      {message && (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm">
          {message}
        </div>
      )}

      {/* =====================================
          STATISTICS
      ====================================== */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <InventoryStat
          title="Total products"
          value={statistics.totalProducts.toLocaleString()}
          description="Products being managed"
          icon={<Box size={20} />}
        />

        <InventoryStat
          title="Total units"
          value={statistics.totalUnits.toLocaleString()}
          description="Units currently in stock"
          icon={<Package size={20} />}
        />

        <InventoryStat
          title="Low stock"
          value={statistics.lowStock.toLocaleString()}
          description={`At or below ${LOW_STOCK_LIMIT} units`}
          icon={<AlertTriangle size={20} />}
          warning
        />

        <InventoryStat
          title="Inventory value"
          value={formatCurrency(statistics.inventoryValue)}
          description="Estimated current value"
          icon={<RefreshCw size={20} />}
        />
      </div>

      {/* =====================================
          ALERT
      ====================================== */}

      {statistics.outOfStock > 0 && (
        <div className="flex flex-col gap-4 rounded-2xl border border-red-100 bg-red-50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-red-600">
              <AlertTriangle size={20} />
            </div>

            <div>
              <p className="font-semibold text-red-900">
                Out-of-stock products
              </p>

              <p className="mt-1 text-sm text-red-700">
                {statistics.outOfStock}{" "}
                {statistics.outOfStock === 1 ? "product is" : "products are"}{" "}
                currently out of stock.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setFilter("out-of-stock")}
            className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-red-700 shadow-sm transition hover:bg-red-100"
          >
            View products
          </button>
        </div>
      )}

      {/* =====================================
          FILTERS
      ====================================== */}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products or categories..."
              className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            />
          </div>

          <div className="relative">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as StockFilter)}
              className="h-11 appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-10 text-sm font-medium text-slate-700 outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            >
              <option value="all">All products</option>

              <option value="in-stock">In stock</option>

              <option value="low-stock">Low stock</option>

              <option value="out-of-stock">Out of stock</option>
            </select>

            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* =====================================
          INVENTORY TABLE
      ====================================== */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="font-semibold text-slate-900">Stock inventory</h2>

            <p className="mt-1 text-sm text-slate-500">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1 ? "product" : "products"}{" "}
              displayed.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
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
                    className="px-6 py-14 text-center text-sm text-slate-500"
                  >
                    Loading inventory...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-14 text-center">
                    <Package size={32} className="mx-auto text-slate-300" />

                    <p className="mt-3 text-sm font-semibold text-slate-700">
                      No products found
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Try changing your search or filter.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const status = getStockStatus(product.stock);

                  return (
                    <tr
                      key={product._id}
                      className="transition hover:bg-slate-50"
                    >
                      {/* PRODUCT */}

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-12 w-12 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                              <Package size={20} />
                            </div>
                          )}

                          <div>
                            <p className="max-w-[230px] truncate text-sm font-semibold text-slate-900">
                              {product.name}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              ID: {product._id}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* CATEGORY */}

                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">
                          {product.category || "Uncategorized"}
                        </span>
                      </td>

                      {/* PRICE */}

                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-slate-900">
                          {formatCurrency(product.price)}
                        </span>
                      </td>

                      {/* STOCK */}

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-lg font-bold ${
                              product.stock <= 0
                                ? "text-red-600"
                                : product.stock <= LOW_STOCK_LIMIT
                                  ? "text-amber-600"
                                  : "text-slate-900"
                            }`}
                          >
                            {product.stock}
                          </span>

                          <span className="text-xs text-slate-400">units</span>
                        </div>
                      </td>

                      {/* STATUS */}

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${status.className}`}
                        >
                          {status.icon}
                          {status.label}
                        </span>
                      </td>

                      {/* ACTIONS */}

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openAdjustment(product, "add")}
                            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                          >
                            <ArrowUp size={14} />
                            Add
                          </button>

                          <button
                            type="button"
                            disabled={product.stock <= 0}
                            onClick={() => openAdjustment(product, "remove")}
                            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <ArrowDown size={14} />
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* =====================================
          STOCK ADJUSTMENT MODAL
      ====================================== */}

      {adjustingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="font-bold text-slate-900">Adjust inventory</h2>

                <p className="mt-1 text-sm text-slate-500">
                  {adjustingProduct.name}
                </p>
              </div>

              <button
                type="button"
                onClick={closeAdjustment}
                disabled={saving}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            {/* CONTENT */}

            <div className="space-y-5 p-6">
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Current stock</span>

                  <span className="text-lg font-bold text-slate-900">
                    {adjustingProduct.stock}
                  </span>
                </div>
              </div>

              {/* MODE */}

              <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setAdjustmentMode("add")}
                  className={`flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition ${
                    adjustmentMode === "add"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500"
                  }`}
                >
                  <ArrowUp size={15} />
                  Add stock
                </button>

                <button
                  type="button"
                  onClick={() => setAdjustmentMode("remove")}
                  className={`flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition ${
                    adjustmentMode === "remove"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500"
                  }`}
                >
                  <ArrowDown size={15} />
                  Remove stock
                </button>
              </div>

              {/* QUANTITY */}

              <div>
                <label
                  htmlFor="stock-adjustment"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Quantity
                </label>

                <input
                  id="stock-adjustment"
                  type="number"
                  min="1"
                  step="1"
                  value={adjustment === 0 ? "" : adjustment}
                  onChange={(e) => setAdjustment(Number(e.target.value))}
                  placeholder="Enter quantity"
                  className="h-12 w-full rounded-xl border border-slate-200 px-4 text-lg font-semibold outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                />
              </div>

              {/* PREVIEW */}

              <div className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">New stock</span>

                  <span className="text-xl font-bold text-slate-900">
                    {Math.max(
                      0,
                      adjustmentMode === "add"
                        ? adjustingProduct.stock + adjustment
                        : adjustingProduct.stock - adjustment,
                    )}
                  </span>
                </div>
              </div>

              {/* ACTIONS */}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeAdjustment}
                  disabled={saving}
                  className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleStockUpdate}
                  disabled={saving}
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      Update stock
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ==========================================
   STAT CARD
========================================== */

function InventoryStat({
  title,
  value,
  description,
  icon,
  warning = false,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  warning?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <p
            className={`mt-2 text-2xl font-bold tracking-tight ${
              warning ? "text-amber-600" : "text-slate-900"
            }`}
          >
            {value}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${
            warning
              ? "bg-amber-50 text-amber-600"
              : "bg-slate-100 text-slate-700"
          }`}
        >
          {icon}
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-400">{description}</p>
    </div>
  );
}

/* ==========================================
   CURRENCY
========================================== */

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}
