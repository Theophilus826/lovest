import { useCallback, useEffect, useState } from "react";
import {
  Package,
  Eye,
  RefreshCw,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  X,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  CalendarDays,
  Hash,
  MapPinned,
} from "lucide-react";

import API from "../services/Api";

// =========================================================
// TYPES
// =========================================================

interface OrderProduct {
  _id: string;
  name?: string;
  image?: string;
}

interface OrderItem {
  product?: OrderProduct | string | null;
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

type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

interface OrderCustomer {
  name: string;
  phone: string;
  email?: string;
}

interface DeliveryAddress {
  address: string;
  city: string;
  state: string;
  postalCode?: string;
}

interface Shipping {
  courier?: string;
  trackingNumber?: string;
  shippedAt?: string | null;
  estimatedDeliveryDate?: string | null;
  deliveredAt?: string | null;
  notes?: string;
}

interface Order {
  _id: string;
  customer: OrderCustomer;
  deliveryAddress: DeliveryAddress;
  items: OrderItem[];

  subtotal: number;
  deliveryFee: number;
  total: number;

  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;

  shipping?: Shipping;

  createdAt: string;
  updatedAt?: string;
}

// =========================================================
// HELPERS
// =========================================================

const formatCurrency = (value?: number) => {
  const amount = Number(value ?? 0);

  return `₦${amount.toLocaleString("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

const formatPaymentMethod = (value?: string) => {
  if (!value) return "Unknown";

  return value
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const formatDate = (value?: string | null) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const getResponseData = <T,>(response: any): T | null => {
  return response?.data?.data ?? response?.data ?? null;
};

const getOrderNumber = (orderId: string) => {
  if (!orderId) return "UNKNOWN";

  return orderId.slice(-8).toUpperCase();
};

const getErrorMessage = (error: any, fallback: string) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
};

const getProductImage = (item: OrderItem) => {
  if (item.image) {
    return item.image;
  }

  if (item.product && typeof item.product === "object" && item.product.image) {
    return item.product.image;
  }

  return undefined;
};

// =========================================================
// COMPONENT
// =========================================================

export default function Orders() {
  // =======================================================
  // STATE
  // =======================================================

  const [orders, setOrders] = useState<Order[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [message, setMessage] = useState("");

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [loadingOrder, setLoadingOrder] = useState(false);

  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [confirmingPayment, setConfirmingPayment] = useState(false);

  // =======================================================
  // UPDATE ORDER IN STATE
  // =======================================================

  const updateOrderInState = useCallback((updatedOrder: Order) => {
    if (!updatedOrder?._id) {
      console.error("Invalid updated order:", updatedOrder);
      return;
    }

    setSelectedOrder((currentOrder) =>
      currentOrder?._id === updatedOrder._id
        ? {
            ...currentOrder,
            ...updatedOrder,
          }
        : updatedOrder,
    );

    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order._id === updatedOrder._id
          ? {
              ...order,
              ...updatedOrder,
            }
          : order,
      ),
    );
  }, []);

  // =======================================================
  // FETCH ALL ORDERS
  // =======================================================

  const fetchOrders = useCallback(async () => {
    try {
      setMessage("");

      const response = await API.get("/admin/orders");

      const data = getResponseData<Order[]>(response);

      setOrders(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error("FAILED TO FETCH ORDERS:", error);

      setMessage(getErrorMessage(error, "Failed to load orders."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // =======================================================
  // INITIAL LOAD
  // =======================================================

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Listen for order updates from other parts of the app
  useEffect(() => {
    const handler = (e: Event) => {
      try {
        const custom = e as CustomEvent;

        const updatedOrder = custom.detail as Order | undefined;

        if (!updatedOrder || !updatedOrder._id) return;

        updateOrderInState(updatedOrder);
      } catch (err) {
        // ignore
      }
    };

    window.addEventListener("orderUpdated", handler as EventListener);

    return () => {
      window.removeEventListener("orderUpdated", handler as EventListener);
    };
  }, [updateOrderInState]);

  // =======================================================
  // REFRESH
  // =======================================================

  const handleRefresh = async () => {
    if (refreshing) return;

    setRefreshing(true);

    await fetchOrders();
  };

  // =======================================================
  // VIEW ORDER
  // =======================================================

  const handleViewOrder = async (orderId: string) => {
    if (!orderId || loadingOrder) return;

    try {
      setMessage("");
      setLoadingOrder(true);

      /*
       * IMPORTANT:
       * This uses the admin order-details endpoint.
       *
       * GET /orders/admin/:orderId
       */
      const response = await API.get(`/orders/admin/${orderId}`);

      const order = getResponseData<Order>(response);

      if (!order) {
        throw new Error("Order data was not returned by the server.");
      }

      setSelectedOrder(order);
    } catch (error: any) {
      console.error("FAILED TO FETCH ORDER:", error);

      console.error("STATUS:", error?.response?.status);

      console.error("SERVER RESPONSE:", error?.response?.data);

      setMessage(getErrorMessage(error, "Failed to load order details."));
    } finally {
      setLoadingOrder(false);
    }
  };

  // =======================================================
  // CLOSE MODAL
  // =======================================================

  const handleCloseModal = () => {
    if (updatingStatus || confirmingPayment) {
      return;
    }

    setSelectedOrder(null);
  };

  // =======================================================
  // UPDATE ORDER STATUS
  // =======================================================

  const handleStatusChange = async (status: OrderStatus) => {
    if (!selectedOrder) return;

    if (selectedOrder.status === status) {
      return;
    }

    try {
      setUpdatingStatus(true);
      setMessage("");

      const response = await API.patch(
        `/admin/orders/${selectedOrder._id}/status`,
        {
          status,
        },
      );

      const updatedOrder = getResponseData<Order>(response);

      if (!updatedOrder) {
        throw new Error("Updated order was not returned by the server.");
      }

      updateOrderInState(updatedOrder);
    } catch (error: any) {
      console.error("FAILED TO UPDATE ORDER STATUS:", error);

      setMessage(getErrorMessage(error, "Failed to update order status."));
    } finally {
      setUpdatingStatus(false);
    }
  };

  // =======================================================
  // CONFIRM PAYMENT
  // =======================================================

  const handleConfirmPayment = async () => {
    if (!selectedOrder) return;

    if (selectedOrder.paymentStatus === "paid") {
      return;
    }

    if (selectedOrder.paymentStatus === "refunded") {
      setMessage("A refunded payment cannot be confirmed again.");

      return;
    }

    if (selectedOrder.status === "cancelled") {
      setMessage("Cancelled orders cannot be paid.");

      return;
    }

    const confirmed = window.confirm(
      `Confirm payment of ${formatCurrency(
        selectedOrder.total,
      )} for order #${getOrderNumber(selectedOrder._id)}?`,
    );

    if (!confirmed) return;

    try {
      setConfirmingPayment(true);
      setMessage("");

      const response = await API.patch(
        `/admin/orders/${selectedOrder._id}/confirm-payment`,
      );

      const updatedOrder = getResponseData<Order>(response);

      if (!updatedOrder) {
        throw new Error("Updated order was not returned by the server.");
      }

      updateOrderInState(updatedOrder);
    } catch (error: any) {
      console.error("FAILED TO CONFIRM PAYMENT:", error);

      setMessage(getErrorMessage(error, "Failed to confirm payment."));
    } finally {
      setConfirmingPayment(false);
    }
  };

  // =======================================================
  // STATUS STYLE
  // =======================================================

  const getStatusStyle = (status: OrderStatus) => {
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
        return "bg-emerald-50 text-emerald-700";

      case "cancelled":
        return "bg-red-50 text-red-700";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  // =======================================================
  // STATUS ICON
  // =======================================================

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return <Clock size={14} />;

      case "confirmed":
        return <CheckCircle2 size={14} />;

      case "processing":
        return <Package size={14} />;

      case "shipped":
        return <Truck size={14} />;

      case "delivered":
        return <CheckCircle2 size={14} />;

      case "cancelled":
        return <XCircle size={14} />;

      default:
        return <Package size={14} />;
    }
  };

  // =======================================================
  // PAYMENT STYLE
  // =======================================================

  const getPaymentStyle = (paymentStatus: PaymentStatus) => {
    switch (paymentStatus) {
      case "paid":
        return "bg-emerald-50 text-emerald-700";

      case "failed":
        return "bg-red-50 text-red-700";

      case "refunded":
        return "bg-purple-50 text-purple-700";

      case "pending":
      default:
        return "bg-amber-50 text-amber-700";
    }
  };

  // =======================================================
  // PAYMENT CONTAINER STYLE
  // =======================================================

  const getPaymentContainerStyle = (paymentStatus: PaymentStatus) => {
    switch (paymentStatus) {
      case "paid":
        return "border-emerald-200 bg-emerald-50";

      case "failed":
        return "border-red-200 bg-red-50";

      case "refunded":
        return "border-purple-200 bg-purple-50";

      case "pending":
      default:
        return "border-amber-200 bg-amber-50";
    }
  };

  // =======================================================
  // PAYMENT ICON STYLE
  // =======================================================

  const getPaymentIconStyle = (paymentStatus: PaymentStatus) => {
    switch (paymentStatus) {
      case "paid":
        return "bg-emerald-100 text-emerald-600";

      case "failed":
        return "bg-red-100 text-red-600";

      case "refunded":
        return "bg-purple-100 text-purple-600";

      case "pending":
      default:
        return "bg-amber-100 text-amber-600";
    }
  };

  // =======================================================
  // LOADING SCREEN
  // =======================================================

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <RefreshCw
            className="mx-auto animate-spin text-orange-500"
            size={28}
          />

          <p className="mt-3 text-sm text-slate-500">Loading orders...</p>
        </div>
      </div>
    );
  }

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div className="space-y-6">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Package size={16} />

            <span>Store</span>

            <span>/</span>

            <span className="text-slate-900">Orders</span>
          </div>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            Orders
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View customer orders and manage payments and order status.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />

          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* =================================================
          MESSAGE
      ================================================= */}

      {message && (
        <div className="flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <span>{message}</span>

          <button
            type="button"
            onClick={() => setMessage("")}
            className="shrink-0 rounded-md p-1 transition hover:bg-red-100"
            aria-label="Dismiss message"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* =================================================
          EMPTY STATE
      ================================================= */}

      {orders.length === 0 && !message && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
            <Package size={24} />
          </div>

          <h2 className="mt-4 font-semibold text-slate-900">No orders yet</h2>

          <p className="mt-1 text-sm text-slate-500">
            Customer orders will appear here.
          </p>
        </div>
      )}

      {/* =================================================
          ORDERS TABLE
      ================================================= */}

      {orders.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left">
              <thead className="border-b border-slate-100 bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Order
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Customer
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Items
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Total
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Payment
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr key={order._id} className="transition hover:bg-slate-50">
                    {/* ORDER */}

                    <td className="px-6 py-5">
                      <p className="font-semibold text-slate-900">
                        #{getOrderNumber(order._id)}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {formatDate(order.createdAt)}
                      </p>
                    </td>

                    {/* CUSTOMER */}

                    <td className="px-6 py-5">
                      <p className="font-medium text-slate-900">
                        {order.customer?.name || "Unknown customer"}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {order.customer?.phone || "No phone"}
                      </p>
                    </td>

                    {/* ITEMS */}

                    <td className="px-6 py-5">
                      <p className="font-medium text-slate-900">
                        {order.items?.length || 0}{" "}
                        {(order.items?.length || 0) === 1
                          ? "product"
                          : "products"}
                      </p>

                      <p className="mt-1 max-w-[180px] truncate text-xs text-slate-500">
                        {order.items
                          ?.map((item) => `${item.name} × ${item.quantity}`)
                          .join(", ") || "No products"}
                      </p>
                    </td>

                    {/* TOTAL */}

                    <td className="px-6 py-5">
                      <p className="font-bold text-slate-900">
                        {formatCurrency(order.total)}
                      </p>
                    </td>

                    {/* STATUS */}

                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${getStatusStyle(
                          order.status,
                        )}`}
                      >
                        {getStatusIcon(order.status)}

                        {order.status}
                      </span>
                    </td>

                    {/* PAYMENT */}

                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${getPaymentStyle(
                          order.paymentStatus,
                        )}`}
                      >
                        {order.paymentStatus}
                      </span>

                      <p className="mt-1 text-xs capitalize text-slate-400">
                        {formatPaymentMethod(order.paymentMethod)}
                      </p>
                    </td>

                    {/* ACTION */}

                    <td className="px-6 py-5">
                      <button
                        type="button"
                        onClick={() => handleViewOrder(order._id)}
                        disabled={loadingOrder}
                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {loadingOrder ? (
                          <RefreshCw size={14} className="animate-spin" />
                        ) : (
                          <Eye size={14} />
                        )}

                        {loadingOrder ? "Loading..." : "View"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =================================================
          ORDER DETAILS MODAL
      ================================================= */}

      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"
          onClick={(event) => {
            if (
              event.target === event.currentTarget &&
              !updatingStatus &&
              !confirmingPayment
            ) {
              handleCloseModal();
            }
          }}
        >
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* =================================================
                MODAL HEADER
            ================================================= */}

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">
                    Order #{getOrderNumber(selectedOrder._id)}
                  </h2>

                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${getStatusStyle(
                      selectedOrder.status,
                    )}`}
                  >
                    {getStatusIcon(selectedOrder.status)}

                    {selectedOrder.status}
                  </span>
                </div>

                <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                  <CalendarDays size={13} />

                  {formatDateTime(selectedOrder.createdAt)}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                disabled={updatingStatus || confirmingPayment}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close order details"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-6 p-5">
              {/* =================================================
                  CUSTOMER
              ================================================= */}

              <section>
                <h3 className="mb-3 text-sm font-bold text-slate-900">
                  Customer
                </h3>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">
                    {selectedOrder.customer?.name || "Unknown customer"}
                  </p>

                  <div className="mt-3 space-y-2 text-sm text-slate-500">
                    {selectedOrder.customer?.phone && (
                      <p className="flex items-center gap-2">
                        <Phone size={15} />

                        <span>{selectedOrder.customer.phone}</span>
                      </p>
                    )}

                    {selectedOrder.customer?.email && (
                      <p className="flex items-center gap-2 break-all">
                        <Mail size={15} />

                        <span>{selectedOrder.customer.email}</span>
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* =================================================
                  DELIVERY ADDRESS
              ================================================= */}

              <section>
                <h3 className="mb-3 text-sm font-bold text-slate-900">
                  Delivery Address
                </h3>

                <div className="flex gap-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                  <MapPin
                    size={18}
                    className="mt-0.5 shrink-0 text-orange-500"
                  />

                  <div className="min-w-0">
                    <p className="font-medium text-slate-800">
                      {selectedOrder.deliveryAddress?.address ||
                        "No address provided"}
                    </p>

                    <p className="mt-1">
                      {selectedOrder.deliveryAddress?.city || "Unknown city"},{" "}
                      {selectedOrder.deliveryAddress?.state || "Unknown state"}
                    </p>

                    {selectedOrder.deliveryAddress?.postalCode && (
                      <p className="mt-1">
                        {selectedOrder.deliveryAddress.postalCode}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* =================================================
                  SHIPPING
              ================================================= */}

              <section>
                <h3 className="mb-3 text-sm font-bold text-slate-900">
                  Shipping
                </h3>

                <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                        <Truck size={17} />
                      </div>

                      <div>
                        <p className="text-xs font-medium text-slate-400">
                          Courier
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-900">
                          {selectedOrder.shipping?.courier || "Not assigned"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                        <Hash size={17} />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-400">
                          Tracking Number
                        </p>

                        <p className="mt-1 break-all text-sm font-semibold text-slate-900">
                          {selectedOrder.shipping?.trackingNumber ||
                            "Not available"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                        <CalendarDays size={17} />
                      </div>

                      <div>
                        <p className="text-xs font-medium text-slate-400">
                          Shipped At
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-900">
                          {formatDateTime(selectedOrder.shipping?.shippedAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                        <MapPinned size={17} />
                      </div>

                      <div>
                        <p className="text-xs font-medium text-slate-400">
                          Estimated Delivery
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-900">
                          {formatDate(
                            selectedOrder.shipping?.estimatedDeliveryDate,
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectedOrder.shipping?.deliveredAt && (
                    <div className="mt-4 border-t border-slate-100 pt-4">
                      <p className="text-xs font-medium text-slate-400">
                        Delivered At
                      </p>

                      <p className="mt-1 text-sm font-semibold text-emerald-700">
                        {formatDateTime(selectedOrder.shipping.deliveredAt)}
                      </p>
                    </div>
                  )}

                  {selectedOrder.shipping?.notes && (
                    <div className="mt-4 border-t border-slate-100 pt-4">
                      <p className="text-xs font-medium text-slate-400">
                        Shipping Notes
                      </p>

                      <p className="mt-1 text-sm text-slate-600">
                        {selectedOrder.shipping.notes}
                      </p>
                    </div>
                  )}
                </div>
              </section>

              {/* =================================================
                  PRODUCTS
              ================================================= */}

              <section>
                <h3 className="mb-3 text-sm font-bold text-slate-900">
                  Ordered Products
                </h3>

                <div className="space-y-3">
                  {selectedOrder.items?.length > 0 ? (
                    selectedOrder.items.map((item, index) => {
                      const image = getProductImage(item);

                      return (
                        <div
                          key={`${item.product && typeof item.product === "object" ? item.product._id : item.name}-${index}`}
                          className="flex gap-3 rounded-xl border border-slate-100 p-3"
                        >
                          {image ? (
                            <img
                              src={image}
                              alt={item.name}
                              className="h-16 w-16 shrink-0 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                              <Package size={20} className="text-slate-400" />
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-slate-900">
                              {item.name}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {formatCurrency(item.price)} × {item.quantity}
                            </p>

                            {item.originalPrice &&
                              item.originalPrice > item.price && (
                                <p className="mt-1 text-xs text-slate-400 line-through">
                                  {formatCurrency(item.originalPrice)}
                                </p>
                              )}
                          </div>

                          <p className="whitespace-nowrap font-bold text-slate-900">
                            {formatCurrency(item.total)}
                          </p>
                        </div>
                      );
                    })
                  ) : (
                    <div className="rounded-xl bg-slate-50 p-5 text-center text-sm text-slate-500">
                      No products found for this order.
                    </div>
                  )}
                </div>
              </section>

              {/* =================================================
                  ORDER TOTAL
              ================================================= */}

              <section className="rounded-xl bg-slate-50 p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Subtotal</span>

                    <span className="font-medium text-slate-900">
                      {formatCurrency(selectedOrder.subtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Delivery</span>

                    <span className="font-medium text-slate-900">
                      {formatCurrency(selectedOrder.deliveryFee)}
                    </span>
                  </div>

                  <div className="flex justify-between border-t border-slate-200 pt-3">
                    <span className="font-bold text-slate-900">Total</span>

                    <span className="text-lg font-bold text-orange-500">
                      {formatCurrency(selectedOrder.total)}
                    </span>
                  </div>
                </div>
              </section>

              {/* =================================================
                  PAYMENT
              ================================================= */}

              <section>
                <h3 className="mb-3 text-sm font-bold text-slate-900">
                  Payment
                </h3>

                <div
                  className={`rounded-xl border p-4 ${getPaymentContainerStyle(
                    selectedOrder.paymentStatus,
                  )}`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${getPaymentIconStyle(
                          selectedOrder.paymentStatus,
                        )}`}
                      >
                        <CreditCard size={20} />
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Payment Status
                        </p>

                        <p className="mt-1 font-bold capitalize text-slate-900">
                          {selectedOrder.paymentStatus}
                        </p>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="text-xs text-slate-500">Payment Method</p>

                      <p className="mt-1 font-semibold capitalize text-slate-900">
                        {formatPaymentMethod(selectedOrder.paymentMethod)}
                      </p>
                    </div>
                  </div>

                  {/* CONFIRM PAYMENT */}

                  {selectedOrder.paymentStatus === "pending" && (
                    <button
                      type="button"
                      onClick={handleConfirmPayment}
                      disabled={
                        confirmingPayment ||
                        selectedOrder.status === "cancelled"
                      }
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {confirmingPayment ? (
                        <>
                          <RefreshCw size={16} className="animate-spin" />
                          Confirming Payment...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={17} />
                          Confirm Payment
                        </>
                      )}
                    </button>
                  )}

                  {/* PAID */}

                  {selectedOrder.paymentStatus === "paid" && (
                    <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-emerald-100 px-4 py-3 text-sm font-bold text-emerald-700">
                      <CheckCircle2 size={17} />
                      Payment Confirmed
                    </div>
                  )}

                  {/* REFUNDED */}

                  {selectedOrder.paymentStatus === "refunded" && (
                    <div className="mt-4 rounded-xl bg-purple-100 px-4 py-3 text-center text-sm font-bold text-purple-700">
                      Payment Refunded
                    </div>
                  )}

                  {/* FAILED */}

                  {selectedOrder.paymentStatus === "failed" && (
                    <div className="mt-4 rounded-xl bg-red-100 px-4 py-3 text-center text-sm font-bold text-red-700">
                      Payment Failed
                    </div>
                  )}
                </div>
              </section>

              {/* =================================================
                  ORDER STATUS
              ================================================= */}

              <section>
                <h3 className="mb-3 text-sm font-bold text-slate-900">
                  Order Status
                </h3>

                <select
                  value={selectedOrder.status}
                  disabled={updatingStatus}
                  onChange={(event) =>
                    handleStatusChange(event.target.value as OrderStatus)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium capitalize outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                >
                  <option value="pending">Pending</option>

                  <option value="confirmed">Confirmed</option>

                  <option value="processing">Processing</option>

                  <option value="shipped">Shipped</option>

                  <option value="delivered">Delivered</option>

                  <option value="cancelled">Cancelled</option>
                </select>

                {updatingStatus && (
                  <p className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                    <RefreshCw size={12} className="animate-spin" />
                    Updating order status...
                  </p>
                )}
              </section>

              {/* =================================================
                  ORDER META
              ================================================= */}

              <section className="border-t border-slate-100 pt-5">
                <div className="grid gap-3 text-xs text-slate-400 sm:grid-cols-2">
                  <div>
                    <span>Order ID</span>

                    <p className="mt-1 break-all font-medium text-slate-600">
                      {selectedOrder._id}
                    </p>
                  </div>

                  {selectedOrder.updatedAt && (
                    <div className="sm:text-right">
                      <span>Last Updated</span>

                      <p className="mt-1 font-medium text-slate-600">
                        {formatDateTime(selectedOrder.updatedAt)}
                      </p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
