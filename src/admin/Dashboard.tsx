import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Box,
  CheckCircle2,
  Clock3,
  CreditCard,
  DollarSign,
  Package,
  RefreshCw,
  ShoppingCart,
  Truck,
  Users,
  XCircle,
} from "lucide-react";

import API from "../services/Api";

// =========================================================
// TYPES
// =========================================================

type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

type ShippingStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded";

interface DashboardCustomer {
  _id?: string;
  name?: string;
  phone?: string;
  email?: string;
}

interface DashboardProduct {
  _id?: string;
  name?: string;
  price?: number;
  stock?: number;
  quantity?: number;
  image?: string;
}

interface DashboardOrderItem {
  product?: {
    _id?: string;
    name?: string;
    image?: string;
  };

  name?: string;
  price?: number;
  quantity?: number;
  total?: number;
}

interface DashboardOrder {
  _id: string;

  customer?: DashboardCustomer;
  user?: DashboardCustomer;

  items?: DashboardOrderItem[];

  subtotal?: number;
  deliveryFee?: number;
  total?: number;

  status?: OrderStatus;
  shippingStatus?: ShippingStatus;
  paymentStatus?: PaymentStatus;
  paymentMethod?: string;

  createdAt?: string;
  updatedAt?: string;
}

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  positive?: boolean;
  icon: React.ReactNode;
}

// =========================================================
// HELPERS
// =========================================================

const formatCurrency = (value: number) => {
  return `₦${Number(value || 0).toLocaleString()}`;
};

const getResponseData = <T,>(response: any): T | null => {
  return response?.data?.data ?? response?.data ?? null;
};

const getOrderNumber = (id: string) => {
  return id.slice(-8).toUpperCase();
};

const formatStatus = (status?: string) => {
  if (!status) return "Unknown";

  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const getCustomerName = (order: DashboardOrder) => {
  return (
    order.customer?.name ||
    order.user?.name ||
    "Unknown customer"
  );
};

// =========================================================
// STAT CARD
// =========================================================

function StatCard({
  title,
  value,
  change,
  positive = true,
  icon,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </h3>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          {icon}
        </div>
      </div>

      {change && (
        <div className="mt-4 flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold ${
              positive
                ? "text-emerald-600"
                : "text-red-600"
            }`}
          >
            {positive ? (
              <ArrowUpRight size={14} />
            ) : (
              <ArrowDownRight size={14} />
            )}

            {change}
          </span>

          <span className="text-xs text-slate-400">
            current data
          </span>
        </div>
      )}
    </div>
  );
}

// =========================================================
// ORDER STATUS
// =========================================================

function OrderStatus({
  label,
  value,
  percentage,
  width,
  icon,
}: {
  label: string;
  value: string;
  percentage: string;
  width: string;
  icon: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">
            {icon}
          </span>

          <span className="text-sm font-medium text-slate-600">
            {label}
          </span>
        </div>

        <span className="text-sm font-semibold text-slate-900">
          {value}
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-slate-900 transition-all duration-500"
          style={{
            width: width || "0%",
          }}
        />
      </div>

      <p className="mt-1 text-right text-xs text-slate-400">
        {percentage}
      </p>
    </div>
  );
}

// =========================================================
// RECENT ORDER
// =========================================================

function RecentOrder({
  id,
  customer,
  amount,
  status,
  paymentStatus,
}: {
  id: string;
  customer: string;
  amount: string;
  status: string;
  paymentStatus: string;
}) {
  const statusClasses: Record<string, string> = {
    Pending:
      "bg-amber-50 text-amber-700",

    Confirmed:
      "bg-blue-50 text-blue-700",

    Processing:
      "bg-purple-50 text-purple-700",

    Shipped:
      "bg-indigo-50 text-indigo-700",

    Delivered:
      "bg-emerald-50 text-emerald-700",

    Cancelled:
      "bg-red-50 text-red-700",
  };

  return (
    <tr className="transition hover:bg-slate-50">
      <td className="px-6 py-4">
        <span className="text-sm font-semibold text-slate-900">
          #{id}
        </span>
      </td>

      <td className="px-6 py-4">
        <span className="text-sm text-slate-600">
          {customer}
        </span>
      </td>

      <td className="px-6 py-4">
        <span className="text-sm font-semibold text-slate-900">
          {amount}
        </span>
      </td>

      <td className="px-6 py-4">
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
            statusClasses[status] ||
            "bg-slate-100 text-slate-600"
          }`}
        >
          {status}
        </span>
      </td>

      <td className="px-6 py-4">
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
            paymentStatus === "Paid"
              ? "bg-emerald-50 text-emerald-700"
              : paymentStatus === "Failed"
                ? "bg-red-50 text-red-700"
                : paymentStatus === "Refunded"
                  ? "bg-purple-50 text-purple-700"
                  : "bg-amber-50 text-amber-700"
          }`}
        >
          {paymentStatus}
        </span>
      </td>
    </tr>
  );
}

// =========================================================
// TOP PRODUCT
// =========================================================

function TopProduct({
  name,
  sales,
  revenue,
  rank,
}: {
  name: string;
  sales: string;
  revenue: string;
  rank: string;
}) {
  return (
    <div className="flex items-center gap-3 px-6 py-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500">
        {rank}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900">
          {name}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          {sales}
        </p>
      </div>

      <span className="text-sm font-semibold text-slate-900">
        {revenue}
      </span>
    </div>
  );
}

// =========================================================
// MINI STAT
// =========================================================

function MiniStat({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
        {icon}
      </div>

      <div>
        <p className="text-xs font-medium text-slate-500">
          {title}
        </p>

        <p className="mt-1 text-lg font-bold text-slate-900">
          {value}
        </p>
      </div>
    </div>
  );
}

// =========================================================
// DASHBOARD
// =========================================================

export default function AdminDashboard() {
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [products, setProducts] = useState<
    DashboardProduct[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [message, setMessage] = useState("");

  // =======================================================
  // FETCH DASHBOARD DATA
  // =======================================================

  const fetchDashboard = useCallback(async () => {
    try {
      setMessage("");

      const [ordersResponse, productsResponse] =
        await Promise.all([
          API.get("/admin/orders"),
          API.get("/products"),
        ]);

      const ordersData =
        getResponseData<DashboardOrder[]>(
          ordersResponse,
        );

      const productsData =
        getResponseData<DashboardProduct[]>(
          productsResponse,
        );

      setOrders(
        Array.isArray(ordersData)
          ? ordersData
          : [],
      );

      setProducts(
        Array.isArray(productsData)
          ? productsData
          : [],
      );
    } catch (error: any) {
      console.error(
        "FAILED TO LOAD DASHBOARD:",
        error,
      );

      setMessage(
        error?.response?.data?.message ||
          "Failed to load dashboard data.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // =======================================================
  // INITIAL LOAD
  // =======================================================

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // =======================================================
  // REFRESH
  // =======================================================

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboard();
  };

  // =======================================================
  // DASHBOARD CALCULATIONS
  // =======================================================

  const dashboard = useMemo(() => {
    const totalOrders = orders.length;

    const paidOrders = orders.filter(
      (order) =>
        order.paymentStatus === "paid",
    );

    const revenue = paidOrders.reduce(
      (sum, order) =>
        sum + Number(order.total || 0),
      0,
    );

    const pendingPayments = orders
      .filter(
        (order) =>
          order.paymentStatus === "pending",
      )
      .reduce(
        (sum, order) =>
          sum + Number(order.total || 0),
        0,
      );

    const completedOrders = orders.filter(
      (order) =>
        order.status === "delivered" ||
        order.shippingStatus === "delivered",
    ).length;

    const processingOrders = orders.filter(
      (order) =>
        order.status === "processing" ||
        order.shippingStatus === "processing",
    ).length;

    const pendingOrders = orders.filter(
      (order) =>
        order.status === "pending" ||
        order.shippingStatus === "pending",
    ).length;

    const cancelledOrders = orders.filter(
      (order) =>
        order.status === "cancelled" ||
        order.shippingStatus === "cancelled",
    ).length;

    const confirmedOrders = orders.filter(
      (order) =>
        order.status === "confirmed",
    ).length;

    const shippedOrders = orders.filter(
      (order) =>
        order.shippingStatus === "shipped",
    ).length;

    const totalCustomers = new Set(
      orders
        .map(
          (order) =>
            order.user?._id ||
            order.customer?._id ||
            order.user?.email ||
            order.customer?.email ||
            order.user?.phone ||
            order.customer?.phone,
        )
        .filter(Boolean),
    ).size;

    const totalItemsSold = orders.reduce(
      (sum, order) =>
        sum +
        (order.items || []).reduce(
          (itemSum, item) =>
            itemSum +
            Number(item.quantity || 0),
          0,
        ),
      0,
    );

    const statusTotal =
      completedOrders +
      processingOrders +
      pendingOrders +
      cancelledOrders;

    const percentage = (value: number) => {
      if (!statusTotal) return 0;

      return Math.round(
        (value / statusTotal) * 100,
      );
    };

    return {
      totalOrders,
      revenue,
      pendingPayments,
      completedOrders,
      processingOrders,
      pendingOrders,
      cancelledOrders,
      confirmedOrders,
      shippedOrders,
      totalCustomers,
      totalItemsSold,
      statusTotal,

      completedPercentage:
        percentage(completedOrders),

      processingPercentage:
        percentage(processingOrders),

      pendingPercentage:
        percentage(pendingOrders),

      cancelledPercentage:
        percentage(cancelledOrders),
    };
  }, [orders]);

  // =======================================================
  // RECENT ORDERS
  // =======================================================

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => {
        const first = new Date(
          a.createdAt || 0,
        ).getTime();

        const second = new Date(
          b.createdAt || 0,
        ).getTime();

        return second - first;
      })
      .slice(0, 5);
  }, [orders]);

  // =======================================================
  // TOP PRODUCTS
  // =======================================================

  const topProducts = useMemo(() => {
    const productMap = new Map<
      string,
      {
        name: string;
        quantity: number;
        revenue: number;
      }
    >();

    orders.forEach((order) => {
      (order.items || []).forEach((item) => {
        const productId =
          item.product?._id ||
          item.name ||
          "unknown";

        const existing =
          productMap.get(productId);

        const quantity = Number(
          item.quantity || 0,
        );

        const revenue = Number(
          item.total ??
            Number(item.price || 0) *
              quantity,
        );

        if (existing) {
          existing.quantity += quantity;
          existing.revenue += revenue;
        } else {
          productMap.set(productId, {
            name:
              item.name ||
              item.product?.name ||
              "Product",
            quantity,
            revenue,
          });
        }
      });
    });

    return Array.from(
      productMap.values(),
    )
      .sort(
        (a, b) =>
          b.quantity - a.quantity,
      )
      .slice(0, 5);
  }, [orders]);

  // =======================================================
  // WEEKLY SALES
  // =======================================================

  const weeklySales = useMemo(() => {
    const now = new Date();

    const days = Array.from(
      { length: 7 },
      (_, index) => {
        const date = new Date(now);

        date.setDate(
          now.getDate() -
            (6 - index),
        );

        date.setHours(
          0,
          0,
          0,
          0,
        );

        return date;
      },
    );

    return days.map((day) => {
      const nextDay = new Date(day);

      nextDay.setDate(
        day.getDate() + 1,
      );

      const value = orders
        .filter((order) => {
          if (
            order.paymentStatus !==
            "paid"
          ) {
            return false;
          }

          if (!order.createdAt) {
            return false;
          }

          const createdAt =
            new Date(
              order.createdAt,
            );

          return (
            createdAt >= day &&
            createdAt < nextDay
          );
        })
        .reduce(
          (sum, order) =>
            sum +
            Number(order.total || 0),
          0,
        );

      return {
        day: day.toLocaleDateString(
          "en-US",
          {
            weekday: "short",
          },
        ),
        value,
      };
    });
  }, [orders]);

  const maximumWeeklySales = Math.max(
    ...weeklySales.map(
      (item) => item.value,
    ),
    1,
  );

  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <RefreshCw
            size={28}
            className="mx-auto animate-spin text-orange-500"
          />

          <p className="mt-3 text-sm text-slate-500">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Overview
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Monitor your store performance and activity.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={16}
            className={
              refreshing
                ? "animate-spin"
                : ""
            }
          />

          {refreshing
            ? "Refreshing..."
            : "Refresh"}
        </button>
      </div>

      {/* ERROR */}

      {message && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {message}
        </div>
      )}

      {/* STAT CARDS */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(
            dashboard.revenue,
          )}
          change={`${dashboard.totalOrders} orders`}
          icon={<DollarSign size={21} />}
        />

        <StatCard
          title="Orders"
          value={dashboard.totalOrders.toLocaleString()}
          change={`${dashboard.completedOrders} completed`}
          icon={<ShoppingCart size={21} />}
        />

        <StatCard
          title="Customers"
          value={dashboard.totalCustomers.toLocaleString()}
          change={`${dashboard.confirmedOrders} confirmed`}
          icon={<Users size={21} />}
        />

        <StatCard
          title="Products"
          value={products.length.toLocaleString()}
          change={`${dashboard.totalItemsSold} items sold`}
          icon={<Package size={21} />}
        />
      </div>

      {/* MAIN GRID */}

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        {/* SALES */}

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">
                Sales overview
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Paid revenue over the last 7 days.
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-500">
              <BarChart3 size={17} />

              <span>Weekly</span>
            </div>
          </div>

          <div className="p-6">
            {dashboard.totalOrders === 0 ? (
              <div className="flex h-64 items-center justify-center text-sm text-slate-400">
                No sales data yet.
              </div>
            ) : (
              <div className="flex h-64 items-end gap-3 sm:gap-5">
                {weeklySales.map(
                  (item) => {
                    const height =
                      item.value === 0
                        ? 0
                        : Math.max(
                            (item.value /
                              maximumWeeklySales) *
                              100,
                            5,
                          );

                    return (
                      <div
                        key={item.day}
                        className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                      >
                        <span className="text-[10px] font-medium text-slate-400 sm:text-xs">
                          {formatCurrency(
                            item.value,
                          )}
                        </span>

                        <div className="flex h-full w-full items-end">
                          <div
                            className="w-full rounded-t-lg bg-slate-900 transition-all hover:bg-slate-700"
                            style={{
                              height: `${height}%`,
                            }}
                          />
                        </div>

                        <span className="text-xs font-medium text-slate-400">
                          {item.day}
                        </span>
                      </div>
                    );
                  },
                )}
              </div>
            )}
          </div>
        </section>

        {/* ORDER SUMMARY */}

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="font-semibold text-slate-900">
              Order summary
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Current order status.
            </p>
          </div>

          <div className="space-y-5 p-6">
            <OrderStatus
              label="Completed"
              value={dashboard.completedOrders.toLocaleString()}
              percentage={`${dashboard.completedPercentage}%`}
              width={`${dashboard.completedPercentage}%`}
              icon={
                <CheckCircle2 size={16} />
              }
            />

            <OrderStatus
              label="Processing"
              value={dashboard.processingOrders.toLocaleString()}
              percentage={`${dashboard.processingPercentage}%`}
              width={`${dashboard.processingPercentage}%`}
              icon={
                <Clock3 size={16} />
              }
            />

            <OrderStatus
              label="Pending"
              value={dashboard.pendingOrders.toLocaleString()}
              percentage={`${dashboard.pendingPercentage}%`}
              width={`${dashboard.pendingPercentage}%`}
              icon={
                <Clock3 size={16} />
              }
            />

            <OrderStatus
              label="Cancelled"
              value={dashboard.cancelledOrders.toLocaleString()}
              percentage={`${dashboard.cancelledPercentage}%`}
              width={`${dashboard.cancelledPercentage}%`}
              icon={
                <XCircle size={16} />
              }
            />
          </div>

          <div className="border-t border-slate-100 px-6 py-5">
            <a
              href="/admin/orders"
              className="text-sm font-semibold text-slate-700 hover:text-slate-900"
            >
              View all orders →
            </a>
          </div>
        </section>
      </div>

      {/* LOWER GRID */}

      <div className="grid gap-6 xl:grid-cols-3">
        {/* RECENT ORDERS */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <div>
              <h2 className="font-semibold text-slate-900">
                Recent orders
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Latest customer purchases.
              </p>
            </div>

            <a
              href="/admin/orders"
              className="text-sm font-semibold text-slate-600 hover:text-slate-900"
            >
              View all
            </a>
          </div>

          {recentOrders.length === 0 ? (
            <div className="flex min-h-40 items-center justify-center text-sm text-slate-400">
              No orders yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Order
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Customer
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Amount
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Payment
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {recentOrders.map(
                    (order) => (
                      <RecentOrder
                        key={order._id}
                        id={getOrderNumber(
                          order._id,
                        )}
                        customer={getCustomerName(
                          order,
                        )}
                        amount={formatCurrency(
                          Number(
                            order.total || 0,
                          ),
                        )}
                        status={formatStatus(
                          order.status,
                        )}
                        paymentStatus={formatStatus(
                          order.paymentStatus,
                        )}
                      />
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* TOP PRODUCTS */}

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <div>
              <h2 className="font-semibold text-slate-900">
                Top products
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Best performing products.
              </p>
            </div>

            <Box
              size={18}
              className="text-slate-400"
            />
          </div>

          {topProducts.length === 0 ? (
            <div className="flex min-h-60 items-center justify-center px-6 text-center text-sm text-slate-400">
              No product sales yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {topProducts.map(
                (product, index) => (
                  <TopProduct
                    key={`${product.name}-${index}`}
                    name={product.name}
                    sales={`${product.quantity.toLocaleString()} sold`}
                    revenue={formatCurrency(
                      product.revenue,
                    )}
                    rank={String(
                      index + 1,
                    ).padStart(2, "0")}
                  />
                ),
              )}
            </div>
          )}
        </section>
      </div>

      {/* QUICK STATS */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MiniStat
          title="Pending Payments"
          value={formatCurrency(
            dashboard.pendingPayments,
          )}
          icon={
            <CreditCard size={19} />
          }
        />

        <MiniStat
          title="Shipped Orders"
          value={dashboard.shippedOrders.toLocaleString()}
          icon={<Truck size={19} />}
        />

        <MiniStat
          title="Low Stock Items"
          value={products
            .filter(
              (product) =>
                Number(
                  product.stock ??
                    product.quantity ??
                    0,
                ) <= 5,
            )
            .length.toLocaleString()}
          icon={<Package size={19} />}
        />

        <MiniStat
          title="Total Items Sold"
          value={dashboard.totalItemsSold.toLocaleString()}
          icon={
            <ShoppingCart size={19} />
          }
        />
      </div>
    </div>
  );
}