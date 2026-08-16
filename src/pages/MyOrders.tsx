import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaBoxOpen,
  FaCheckCircle,
  FaClock,
  FaTruck,
  FaTimesCircle,
  FaArrowRight,
  FaCreditCard,
  FaSync,
} from "react-icons/fa";
import API from "../services/Api";

interface OrderItem {
  _id?: string;

  product?: {
    _id: string;
    name: string;
    image?: string;
  };

  name: string;
  image?: string;
  originalPrice?: number;
  price: number;
  quantity: number;
  total: number;
}

type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded";

interface Order {
  _id: string;

  customer?: {
    name: string;
    phone: string;
    email?: string;
  };

  deliveryAddress?: {
    address: string;
    city: string;
    state: string;
  };

  items: OrderItem[];

  subtotal: number;
  deliveryFee: number;
  total: number;

  status: OrderStatus;

  paymentStatus: PaymentStatus;

  paymentMethod:
    | "cash_on_delivery"
    | "bank_transfer"
    | "online"
    | string;

  createdAt: string;
  updatedAt?: string;
  // UI flag when this entry is actually a purchase mapped into orders list
  isPurchase?: boolean;
}

export default function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // LOAD CUSTOMER ORDERS
  // ==========================================

  const loadOrders = async (
    showLoading = true,
  ) => {
    try {
      if (showLoading) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      // Load orders and purchases in parallel and merge
      const [ordersResp, purchasesResp] = await Promise.all([
        API.get("/orders/my-orders"),
        API.get("/purchase/my"),
      ]);

      const ordersData = ordersResp.data?.data || [];
      const purchasesData = purchasesResp.data?.data || [];

      // Map purchases into the same Order shape used here
      const mappedPurchases: Order[] = Array.isArray(purchasesData)
        ? purchasesData.map((p: any) => ({
            _id: p._id,
            customer: { name: "" , phone: ""},
            deliveryAddress: { address: "", city: "", state: "" },
            items: [
              {
                _id: p._id,
                product: p.product
                  ? {
                      _id: p.product._id,
                      name: p.product.name,
                      image: p.product.image,
                    }
                  : undefined,
                name: p.product?.name || "Product",
                image: p.product?.image,
                originalPrice: undefined,
                price: Number(p.unitPrice || p.product?.price || 0),
                quantity: Number(p.quantity || 1),
                total: Number(p.totalAmount || 0),
              },
            ],
            subtotal: Number(p.totalAmount || 0),
            deliveryFee: 0,
            total: Number(p.totalAmount || 0),
            status: (p.status || "pending").toLowerCase(),
            paymentStatus: (p.payment?.status || "pending") as
              | "pending"
              | "paid"
              | "failed"
              | "refunded",
            paymentMethod: "bank_transfer",
            createdAt: p.createdAt || new Date().toISOString(),
            updatedAt: p.updatedAt || new Date().toISOString(),
            // mark as purchase for rendering
            ...(true as any),
          }))
        : [];

      // Combine and sort by date (newest first)
      const combined = [
        ...(Array.isArray(ordersData) ? ordersData : []),
        ...mappedPurchases,
      ].sort((a: any, b: any) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime(),
      );

      // Attach a flag to purchases so we can link correctly in the UI
      const normalized = combined.map((item: any) => ({
        ...item,
        isPurchase: (purchasesData || []).some(
          (p: any) => p._id === item._id,
        ),
      }));

      setOrders(Array.isArray(normalized) ? (normalized as Order[]) : []);
    } catch (error: any) {
      console.error(
        "LOAD MY ORDERS ERROR:",
        error,
      );

      setError(
        error?.response?.data?.message ||
          "Failed to load your orders.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    loadOrders(true);
  }, []);

  // ==========================================
  // MANUAL REFRESH
  // ==========================================

  const handleRefresh = () => {
    loadOrders(false);
  };

  // ==========================================
  // STATUS ICON
  // ==========================================

  const getStatusIcon = (
    status: OrderStatus,
  ) => {
    switch (status) {
      case "pending":
        return (
          <FaClock className="text-amber-500" />
        );

      case "confirmed":
        return (
          <FaCheckCircle className="text-blue-500" />
        );

      case "processing":
        return (
          <FaBoxOpen className="text-purple-500" />
        );

      case "shipped":
        return (
          <FaTruck className="text-indigo-500" />
        );

      case "delivered":
        return (
          <FaCheckCircle className="text-green-500" />
        );

      case "cancelled":
        return (
          <FaTimesCircle className="text-red-500" />
        );

      default:
        return (
          <FaClock className="text-gray-500" />
        );
    }
  };

  // ==========================================
  // STATUS TEXT
  // ==========================================

  const getStatusText = (
    status: OrderStatus,
  ) => {
    switch (status) {
      case "pending":
        return "Order received";

      case "confirmed":
        return "Order confirmed";

      case "processing":
        return "We're preparing your order";

      case "shipped":
        return "Your order is on the way";

      case "delivered":
        return "Order delivered";

      case "cancelled":
        return "Order cancelled";

      default:
        return "Order update";
    }
  };

  // ==========================================
  // STATUS STYLE
  // ==========================================

  const getStatusStyle = (
    status: OrderStatus,
  ) => {
    switch (status) {
      case "pending":
        return "bg-amber-50 text-amber-700";

      case "confirmed":
        return "bg-blue-50 text-blue-700";

      case "processing":
        return "bg-purple-50 text-purple-700";

      case "shipped":
        return "bg-indigo-50 text-indigo-700";

      case "delivered":
        return "bg-green-50 text-green-700";

      case "cancelled":
        return "bg-red-50 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // ==========================================
  // PAYMENT STYLE
  // ==========================================

  const getPaymentStyle = (
    status: PaymentStatus,
  ) => {
    switch (status) {
      case "paid":
        return "bg-green-50 text-green-700";

      case "failed":
        return "bg-red-50 text-red-700";

      case "refunded":
        return "bg-blue-50 text-blue-700";

      case "pending":
      default:
        return "bg-amber-50 text-amber-700";
    }
  };

  // ==========================================
  // PAYMENT METHOD
  // ==========================================

  const formatPaymentMethod = (
    method: string,
  ) => {
    if (!method) return "Unknown";

    return method
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase(),
      );
  };

  // ==========================================
  // FORMAT ORDER ID
  // ==========================================

  const formatOrderId = (
    id: string,
  ) => {
    if (!id) return "";

    return id.length > 12
      ? `#${id.slice(-8).toUpperCase()}`
      : `#${id}`;
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="border-b border-gray-100 bg-white">
          <div className="mx-auto flex h-16 max-w-4xl items-center gap-3 px-4">
            <Link
              to="/"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-100"
            >
              <FaArrowLeft />
            </Link>

            <h1 className="text-xl font-bold text-gray-900">
              My Orders
            </h1>
          </div>
        </header>

        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <FaBoxOpen className="mx-auto animate-pulse text-4xl text-orange-400" />

            <p className="mt-3 text-sm text-gray-500">
              Loading your orders...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="border-b border-gray-100 bg-white">
          <div className="mx-auto flex h-16 max-w-4xl items-center gap-3 px-4">
            <Link
              to="/"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-100"
            >
              <FaArrowLeft />
            </Link>

            <h1 className="text-xl font-bold text-gray-900">
              My Orders
            </h1>
          </div>
        </header>

        <main className="mx-auto max-w-2xl p-5">
          <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
            <FaTimesCircle className="mx-auto text-4xl text-red-400" />

            <h2 className="mt-4 font-bold text-gray-900">
              Unable to load orders
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                loadOrders(true)
              }
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600"
            >
              <FaSync />
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ==========================================
  // EMPTY
  // ==========================================

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="border-b border-gray-100 bg-white">
          <div className="mx-auto flex h-16 max-w-4xl items-center justify-between gap-3 px-4">
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-100"
              >
                <FaArrowLeft />
              </Link>

              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  My Orders
                </h1>

                <p className="text-xs text-gray-500">
                  0 orders
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
            >
              <FaSync
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              <span className="hidden sm:inline">
                Refresh
              </span>
            </button>
          </div>
        </header>

        <main className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-orange-50">
            <FaBoxOpen className="text-4xl text-orange-400" />
          </div>

          <h2 className="mt-6 text-xl font-bold text-gray-900">
            No orders yet
          </h2>

          <p className="mt-2 max-w-xs text-sm leading-6 text-gray-500">
            You haven't placed an order yet.
            Start shopping to see your
            orders here.
          </p>

          <Link
            to="/"
            className="mt-6 rounded-xl bg-orange-500 px-8 py-3 font-semibold text-white transition hover:bg-orange-600"
          >
            Start Shopping
          </Link>
        </main>
      </div>
    );
  }

  // ==========================================
  // ORDERS
  // ==========================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}

      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between gap-3 px-4">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-100"
            >
              <FaArrowLeft />
            </Link>

            <div>
              <h1 className="text-xl font-bold text-gray-900">
                My Orders
              </h1>

              <p className="text-xs text-gray-500">
                {orders.length}{" "}
                {orders.length === 1
                  ? "order"
                  : "orders"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FaSync
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            <span className="hidden sm:inline">
              Refresh
            </span>
          </button>
        </div>
      </header>

      {/* CONTENT */}

      <main className="mx-auto max-w-4xl space-y-4 p-4 sm:p-6">
        {orders.map((order) => {
          const orderDate = new Date(
            order.createdAt,
          ).toLocaleDateString(
            undefined,
            {
              day: "numeric",
              month: "short",
              year: "numeric",
            },
          );

          const itemCount =
            (order.items || []).reduce(
              (total, item) =>
                total +
                Number(item.quantity || 0),
              0,
            );

          return (
            <Link
              key={order._id}
              to={order.isPurchase ? `/purchases/${order._id}` : `/order/${order._id}`}
              className="block rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6"
            >
              {/* TOP */}

              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                      order.status ===
                      "processing"
                        ? "bg-purple-50"
                        : order.status ===
                          "shipped"
                        ? "bg-indigo-50"
                        : order.status ===
                          "delivered"
                        ? "bg-green-50"
                        : "bg-gray-50"
                    } text-lg`}
                  >
                    {getStatusIcon(
                      order.status,
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs text-gray-400">
                      {order.isPurchase ? "Purchase" : "Order"}
                    </p>

                    <p className="truncate text-sm font-bold text-gray-900">
                      {formatOrderId(
                        order._id,
                      )}
                    </p>
                  </div>
                </div>

                <span
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${getStatusStyle(
                    order.status,
                  )}`}
                >
                  {order.status}
                </span>
              </div>

              {/* STATUS */}

              <div className="mt-5">
                <p className="font-semibold text-gray-900">
                  {getStatusText(
                    order.status,
                  )}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Placed on {orderDate}
                </p>
              </div>

              {/* STATUS MESSAGE */}

              {order.status ===
                "processing" && (
                <div className="mt-4 rounded-xl bg-purple-50 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <FaBoxOpen className="text-purple-500" />

                    <p className="text-sm font-medium text-purple-700">
                      Payment confirmed.
                      Your order is being
                      prepared.
                    </p>
                  </div>
                </div>
              )}

              {order.status ===
                "shipped" && (
                <div className="mt-4 rounded-xl bg-indigo-50 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <FaTruck className="text-indigo-500" />

                    <p className="text-sm font-medium text-indigo-700">
                      Your order has been
                      shipped and is on the
                      way.
                    </p>
                  </div>
                </div>
              )}

              {order.status ===
                "delivered" && (
                <div className="mt-4 rounded-xl bg-green-50 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <FaCheckCircle className="text-green-500" />

                    <p className="text-sm font-medium text-green-700">
                      Your order has been
                      delivered successfully.
                    </p>
                  </div>
                </div>
              )}

              {order.status ===
                "cancelled" && (
                <div className="mt-4 rounded-xl bg-red-50 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <FaTimesCircle className="text-red-500" />

                    <p className="text-sm font-medium text-red-700">
                      This order has been
                      cancelled.
                    </p>
                  </div>
                </div>
              )}

              {/* ITEMS */}

              <div className="mt-5 flex items-center justify-between gap-4 border-t border-gray-100 pt-4">
                <div>
                  <p className="text-xs text-gray-400">
                    Items
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {itemCount}{" "}
                    {itemCount === 1
                      ? "item"
                      : "items"}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-gray-400">
                    Total
                  </p>

                  <p className="mt-1 text-lg font-bold text-orange-500">
                    ₦
                    {Number(
                      order.total || 0,
                    ).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* FOOTER */}

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
                <span className="flex items-center gap-2 text-xs text-gray-400">
                  <FaCreditCard />

                  Payment:

                  <span
                    className={`rounded-full px-2.5 py-1 font-medium capitalize ${getPaymentStyle(
                      order.paymentStatus,
                    )}`}
                  >
                    {order.paymentStatus}
                  </span>
                </span>

                <span className="flex items-center gap-1 text-sm font-semibold text-orange-500">
                  {order.isPurchase ? "View Purchase" : "View Order"}
                  <FaArrowRight size={12} />
                </span>
              </div>

              {/* PAYMENT METHOD */}

              <div className="mt-3 text-xs text-gray-400">
                Method:{" "}
                <span className="font-medium text-gray-600">
                  {formatPaymentMethod(
                    order.paymentMethod,
                  )}
                </span>
              </div>
            </Link>
          );
        })}
      </main>
    </div>
  );
}