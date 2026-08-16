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
} from "lucide-react";

import API from "../services/Api";

// =========================================================
// TYPES
// =========================================================

interface OrderItem {
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
// API RESPONSE TYPES
// =========================================================

interface ApiError {
  response?: {
    status?: number;
    data?: {
      message?: string;
      error?: string;
      data?: any;
      order?: Order;
    };
  };

  message?: string;
}

// =========================================================
// HELPERS
// =========================================================

const formatCurrency = (value?: number) => {
  return `₦${Number(value || 0).toLocaleString()}`;
};

const formatPaymentMethod = (value?: string) => {
  if (!value) return "Unknown";

  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const formatDate = (value?: string | null) => {
  if (!value) return "Not provided";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not provided";
  }

  return date.toLocaleString();
};

const formatDateOnly = (value?: string | null) => {
  if (!value) return "Not provided";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not provided";
  }

  return date.toLocaleDateString();
};

/**
 * Handles:
 *
 * { data: [...] }
 * { data: { data: [...] } }
 * { data: { order: {...} } }
 * { order: {...} }
 * direct object/array
 */
const getResponseData = <T,>(response: any): T | null => {
  const body = response?.data;

  if (body?.data !== undefined) {
    return body.data as T;
  }

  if (body?.order !== undefined) {
    return body.order as T;
  }

  if (body !== undefined) {
    return body as T;
  }

  return null;
};

const getErrorMessage = (error: ApiError, fallback: string) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
};

const getOrderNumber = (orderId: string) => {
  if (!orderId) return "UNKNOWN";

  return orderId.slice(-8).toUpperCase();
};

// =========================================================
// COMPONENT
// =========================================================

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [message, setMessage] = useState("");

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [loadingOrder, setLoadingOrder] = useState(false);

  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [confirmingPayment, setConfirmingPayment] = useState(false);

  const [shippingOrder, setShippingOrder] = useState(false);

  const [deliveringOrder, setDeliveringOrder] = useState(false);

  // =========================================================
  // UPDATE ORDER IN STATE
  // =========================================================

  const updateOrderInState = useCallback((updatedOrder: Order) => {
    if (!updatedOrder?._id) {
      console.error("Invalid updated order:", updatedOrder);
      return;
    }

    // ==========================================
    // UPDATE SELECTED ORDER / MODAL
    // ==========================================

    setSelectedOrder((currentOrder) => {
      if (!currentOrder) {
        return updatedOrder;
      }

      if (currentOrder._id !== updatedOrder._id) {
        return currentOrder;
      }

      return {
        ...currentOrder,
        ...updatedOrder,
      };
    });

    // ==========================================
    // UPDATE ORDERS LIST
    // ==========================================

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
  // =========================================================
  // FETCH ALL ORDERS
  // =========================================================

  const fetchOrders = useCallback(async () => {
    try {
      setMessage("");

      const response = await API.get("/admin/orders");

      const data = getResponseData<Order[]>(response);

      if (Array.isArray(data)) {
        setOrders(data);
      } else {
        setOrders([]);
      }
    } catch (error: any) {
      console.error("FAILED TO FETCH ORDERS:", error);

      console.error("STATUS:", error?.response?.status);

      console.error("SERVER RESPONSE:", error?.response?.data);

      setMessage(getErrorMessage(error, "Failed to load orders."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Listen for order updates coming from other parts of the app
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

  // =========================================================
  // REFRESH
  // =========================================================

  const handleRefresh = async () => {
    setRefreshing(true);

    await fetchOrders();
  };

  // =========================================================
  // VIEW ORDER
  // =========================================================
  //
  // IMPORTANT:
  //
  // The detail endpoint is:
  //
  // /orders/admin/:id
  //
  // NOT:
  //
  // /admin/orders/:id
  //
  // =========================================================

  const handleViewOrder = async (orderId: string) => {
    try {
      setMessage("");

      setLoadingOrder(true);

      const response = await API.get(`/orders/admin/${orderId}`);

      console.log("ADMIN ORDER DETAIL RESPONSE:", response.data);

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

  // =========================================================
  // CLOSE MODAL
  // =========================================================

  const handleCloseModal = () => {
    if (
      updatingStatus ||
      confirmingPayment ||
      shippingOrder ||
      deliveringOrder
    ) {
      return;
    }

    setSelectedOrder(null);
  };

  // =========================================================
  // UPDATE ORDER STATUS
  // =========================================================

  const handleStatusChange = async (status: OrderStatus) => {
    if (!selectedOrder) return;

    if (selectedOrder.status === status) {
      return;
    }

    // Prevent manually changing a shipped order to
    // delivered. Use the dedicated delivery endpoint.
    if (status === "delivered" && selectedOrder.status === "shipped") {
      setMessage(
        "Use the Mark as Delivered button to complete a shipped order.",
      );

      return;
    }

    // Prevent manually changing to shipped.
    // Shipping should go through the shipping endpoint
    // so courier and tracking are saved.
    if (status === "shipped" && selectedOrder.status !== "shipped") {
      setMessage(
        "Use the Ship Order section to ship this order and add courier/tracking information.",
      );

      return;
    }

    if (status === "cancelled") {
      const confirmed = window.confirm(
        "Are you sure you want to cancel this order?",
      );

      if (!confirmed) {
        return;
      }
    }

    try {
      setUpdatingStatus(true);

      setMessage("");

      const response = await API.patch(
        `/orders/admin/${selectedOrder._id}/status`,
        {
          status,
        },
      );

      console.log("STATUS UPDATE RESPONSE:", response.data);

      const updatedOrder = getResponseData<Order>(response);

      if (!updatedOrder) {
        throw new Error("Updated order was not returned by the server.");
      }

      updateOrderInState(updatedOrder);
    } catch (error: any) {
      console.error("FAILED TO UPDATE ORDER STATUS:", error);

      console.error("STATUS:", error?.response?.status);

      console.error("SERVER RESPONSE:", error?.response?.data);

      setMessage(getErrorMessage(error, "Failed to update order status."));
    } finally {
      setUpdatingStatus(false);
    }
  };

  // =========================================================
  // CONFIRM PAYMENT
  // =========================================================

  const handleConfirmPayment = async () => {
    if (!selectedOrder) return;

    if (selectedOrder.paymentStatus === "paid") {
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

    if (!confirmed) {
      return;
    }

    try {
      setConfirmingPayment(true);

      setMessage("");

      const response = await API.patch(
        `/orders/admin/${selectedOrder._id}/confirm-payment`,
      );

      console.log("CONFIRM PAYMENT RESPONSE:", response.data);

      const updatedOrder = getResponseData<Order>(response);

      if (!updatedOrder) {
        throw new Error("Updated order was not returned by the server.");
      }

      updateOrderInState(updatedOrder);

      setMessage("");
    } catch (error: any) {
      console.error("FAILED TO CONFIRM PAYMENT:", error);

      console.error("STATUS:", error?.response?.status);

      console.error("SERVER RESPONSE:", error?.response?.data);

      setMessage(getErrorMessage(error, "Failed to confirm payment."));
    } finally {
      setConfirmingPayment(false);
    }
  };

  // =========================================================
  // SHIP ORDER
  // =========================================================

  const handleShipOrder = async () => {
    if (!selectedOrder) return;

    if (selectedOrder.status === "cancelled") {
      setMessage("Cancelled orders cannot be shipped.");

      return;
    }

    if (selectedOrder.paymentStatus !== "paid") {
      setMessage("Payment must be confirmed before shipping.");

      return;
    }

    if (selectedOrder.status !== "processing") {
      setMessage("Only processing orders can be shipped.");

      return;
    }

    const courier =
      window.prompt(
        "Enter courier name:",
        selectedOrder.shipping?.courier || "",
      ) || "";

    if (!courier.trim()) {
      setMessage("Courier is required to ship the order.");

      return;
    }

    const trackingNumber =
      window.prompt(
        "Enter tracking number:",
        selectedOrder.shipping?.trackingNumber || "",
      ) || "";

    if (!trackingNumber.trim()) {
      setMessage("Tracking number is required to ship the order.");

      return;
    }

    const estimatedDeliveryDate =
      window.prompt(
        "Estimated delivery date (YYYY-MM-DD):",
        selectedOrder.shipping?.estimatedDeliveryDate
          ? new Date(selectedOrder.shipping.estimatedDeliveryDate)
              .toISOString()
              .split("T")[0]
          : "",
      ) || "";

    const notes =
      window.prompt(
        "Shipping notes (optional):",
        selectedOrder.shipping?.notes || "",
      ) || "";

    const confirmed = window.confirm(
      `Ship order #${getOrderNumber(
        selectedOrder._id,
      )} with ${courier.trim()} and tracking number ${trackingNumber.trim()}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setShippingOrder(true);

      setMessage("");

      const response = await API.patch(
        `/orders/admin/${selectedOrder._id}/ship`,
        {
          shippingStatus: "shipped",
          courier: courier.trim(),
          trackingNumber: trackingNumber.trim(),
          estimatedDeliveryDate: estimatedDeliveryDate || null,
          notes: notes.trim(),
        },
      );

      console.log("SHIP ORDER RESPONSE:", response.data);

      const updatedOrder = getResponseData<Order>(response);

      if (!updatedOrder) {
        throw new Error(
          "Updated shipped order was not returned by the server.",
        );
      }

      updateOrderInState(updatedOrder);
    } catch (error: any) {
      console.error("FAILED TO SHIP ORDER:", error);

      console.error("STATUS:", error?.response?.status);

      console.error("SERVER RESPONSE:", error?.response?.data);

      setMessage(getErrorMessage(error, "Failed to ship order."));
    } finally {
      setShippingOrder(false);
    }
  };

  // =========================================================
  // MARK ORDER DELIVERED
  // =========================================================

  const handleDeliverOrder = async () => {
    if (!selectedOrder) return;

    if (selectedOrder.status !== "shipped") {
      setMessage("Only shipped orders can be marked as delivered.");

      return;
    }

    const confirmed = window.confirm(
      `Mark order #${getOrderNumber(selectedOrder._id)} as delivered?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeliveringOrder(true);

      setMessage("");

      const response = await API.patch(
        `/orders/admin/${selectedOrder._id}/deliver`,
      );

      console.log("DELIVER ORDER RESPONSE:", response.data);

      const updatedOrder = getResponseData<Order>(response);

      if (!updatedOrder) {
        throw new Error(
          "Updated delivered order was not returned by the server.",
        );
      }

      updateOrderInState(updatedOrder);
    } catch (error: any) {
      console.error("FAILED TO DELIVER ORDER:", error);

      console.error("STATUS:", error?.response?.status);

      console.error("SERVER RESPONSE:", error?.response?.data);

      setMessage(getErrorMessage(error, "Failed to mark order as delivered."));
    } finally {
      setDeliveringOrder(false);
    }
  };

  // =========================================================
  // STATUS STYLE
  // =========================================================

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
        return "bg-gray-100 text-gray-600";
    }
  };

  // =========================================================
  // STATUS ICON
  // =========================================================

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

  // =========================================================
  // PAYMENT STYLE
  // =========================================================

  const getPaymentStyle = (paymentStatus: PaymentStatus) => {
    switch (paymentStatus) {
      case "paid":
        return "bg-emerald-50 text-emerald-700";

      case "failed":
        return "bg-red-50 text-red-700";

      case "refunded":
        return "bg-purple-50 text-purple-700";

      default:
        return "bg-amber-50 text-amber-700";
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

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

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="space-y-6">
      {/* =====================================================
          HEADER
      ====================================================== */}

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
            View customer orders and manage payments, shipping and order status.
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

      {/* =====================================================
          MESSAGE
      ====================================================== */}

      {message && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <span>{message}</span>

          <button
            type="button"
            onClick={() => setMessage("")}
            className="shrink-0 text-red-500 hover:text-red-700"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* =====================================================
          EMPTY
      ====================================================== */}

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

      {/* =====================================================
          ORDERS TABLE
      ====================================================== */}

      {orders.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left">
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
                    Shipping
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
                        {formatDateOnly(order.createdAt)}
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
                        {(order.items || [])
                          .map((item) => `${item.name} × ${item.quantity}`)
                          .join(", ")}
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

                    {/* SHIPPING */}

                    <td className="px-6 py-5">
                      {order.status === "shipped" ||
                      order.status === "delivered" ? (
                        <div>
                          <p className="font-medium text-slate-900">
                            {order.shipping?.courier || "Courier not provided"}
                          </p>

                          <p className="mt-1 max-w-[140px] truncate text-xs text-slate-500">
                            {order.shipping?.trackingNumber ||
                              "Tracking not provided"}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">
                          Not shipped
                        </span>
                      )}
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

      {/* =====================================================
          ORDER DETAILS MODAL
      ====================================================== */}

      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={(event) => {
            if (
              event.target === event.currentTarget &&
              !updatingStatus &&
              !confirmingPayment &&
              !shippingOrder &&
              !deliveringOrder
            ) {
              handleCloseModal();
            }
          }}
        >
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            {/* =================================================
                MODAL HEADER
            ================================================== */}

            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Order #{getOrderNumber(selectedOrder._id)}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {formatDate(selectedOrder.createdAt)}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                disabled={
                  updatingStatus ||
                  confirmingPayment ||
                  shippingOrder ||
                  deliveringOrder
                }
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-6 p-5">
              {/* =================================================
                  ORDER SUMMARY
              ================================================== */}

              <section>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      <Hash size={14} />
                      Order
                    </div>

                    <p className="mt-2 font-bold text-slate-900">
                      #{getOrderNumber(selectedOrder._id)}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      <CalendarDays size={14} />
                      Created
                    </div>

                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {formatDateOnly(selectedOrder.createdAt)}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Status
                    </div>

                    <span
                      className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${getStatusStyle(
                        selectedOrder.status,
                      )}`}
                    >
                      {getStatusIcon(selectedOrder.status)}

                      {selectedOrder.status}
                    </span>
                  </div>
                </div>
              </section>

              {/* =================================================
                  CUSTOMER
              ================================================== */}

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

                        {selectedOrder.customer.phone}
                      </p>
                    )}

                    {selectedOrder.customer?.email && (
                      <p className="flex items-center gap-2 break-all">
                        <Mail size={15} />

                        {selectedOrder.customer.email}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* =================================================
                  DELIVERY ADDRESS
              ================================================== */}

              <section>
                <h3 className="mb-3 text-sm font-bold text-slate-900">
                  Delivery Address
                </h3>

                <div className="flex gap-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                  <MapPin
                    size={18}
                    className="mt-0.5 shrink-0 text-orange-500"
                  />

                  <div>
                    <p>
                      {selectedOrder.deliveryAddress?.address ||
                        "No address provided"}
                    </p>

                    <p>
                      {selectedOrder.deliveryAddress?.city || "Unknown city"},{" "}
                      {selectedOrder.deliveryAddress?.state || "Unknown state"}
                    </p>
                  </div>
                </div>
              </section>

              {/* =================================================
                  PRODUCTS
              ================================================== */}

              <section>
                <h3 className="mb-3 text-sm font-bold text-slate-900">
                  Ordered Products
                </h3>

                <div className="space-y-3">
                  {(selectedOrder.items || []).map((item, index) => (
                    <div
                      key={`${item.product?._id || item.name}-${index}`}
                      className="flex gap-3 rounded-xl border border-slate-100 p-3"
                    >
                      {item.image || item.product?.image ? (
                        <img
                          src={item.image || item.product?.image}
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
                      </div>

                      <p className="whitespace-nowrap font-bold text-slate-900">
                        {formatCurrency(item.total)}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* =================================================
                  TOTAL
              ================================================== */}

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
              ================================================== */}

              <section>
                <h3 className="mb-3 text-sm font-bold text-slate-900">
                  Payment
                </h3>

                <div
                  className={`rounded-xl border p-4 ${
                    selectedOrder.paymentStatus === "paid"
                      ? "border-emerald-200 bg-emerald-50"
                      : selectedOrder.paymentStatus === "failed"
                        ? "border-red-200 bg-red-50"
                        : selectedOrder.paymentStatus === "refunded"
                          ? "border-purple-200 bg-purple-50"
                          : "border-amber-200 bg-amber-50"
                  }`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          selectedOrder.paymentStatus === "paid"
                            ? "bg-emerald-100 text-emerald-600"
                            : selectedOrder.paymentStatus === "failed"
                              ? "bg-red-100 text-red-600"
                              : selectedOrder.paymentStatus === "refunded"
                                ? "bg-purple-100 text-purple-600"
                                : "bg-amber-100 text-amber-600"
                        }`}
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
                  SHIPPING / TRACKING
              ================================================== */}

              <section>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
                  <Truck size={17} className="text-orange-500" />
                  Shipping & Tracking
                </h3>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  {/* EXISTING SHIPPING INFO */}

                  {(selectedOrder.status === "shipped" ||
                    selectedOrder.status === "delivered") && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-lg bg-slate-50 p-3">
                        <p className="text-xs text-slate-400">Courier</p>

                        <p className="mt-1 font-semibold text-slate-900">
                          {selectedOrder.shipping?.courier || "Not provided"}
                        </p>
                      </div>

                      <div className="rounded-lg bg-slate-50 p-3">
                        <p className="text-xs text-slate-400">
                          Tracking Number
                        </p>

                        <p className="mt-1 break-all font-semibold text-slate-900">
                          {selectedOrder.shipping?.trackingNumber ||
                            "Not provided"}
                        </p>
                      </div>

                      <div className="rounded-lg bg-slate-50 p-3">
                        <p className="text-xs text-slate-400">Shipped At</p>

                        <p className="mt-1 text-sm font-semibold text-slate-900">
                          {formatDate(selectedOrder.shipping?.shippedAt)}
                        </p>
                      </div>

                      <div className="rounded-lg bg-slate-50 p-3">
                        <p className="text-xs text-slate-400">
                          Estimated Delivery
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-900">
                          {formatDateOnly(
                            selectedOrder.shipping?.estimatedDeliveryDate,
                          )}
                        </p>
                      </div>

                      {selectedOrder.shipping?.deliveredAt && (
                        <div className="rounded-lg bg-emerald-50 p-3">
                          <p className="text-xs text-emerald-500">
                            Delivered At
                          </p>

                          <p className="mt-1 text-sm font-semibold text-emerald-700">
                            {formatDate(selectedOrder.shipping.deliveredAt)}
                          </p>
                        </div>
                      )}

                      {selectedOrder.shipping?.notes && (
                        <div className="rounded-lg bg-slate-50 p-3 sm:col-span-2">
                          <p className="text-xs text-slate-400">
                            Shipping Notes
                          </p>

                          <p className="mt-1 text-sm text-slate-700">
                            {selectedOrder.shipping.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* NOT SHIPPED */}

                  {selectedOrder.status !== "shipped" &&
                    selectedOrder.status !== "delivered" &&
                    selectedOrder.status !== "cancelled" && (
                      <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
                        This order has not been shipped yet.
                      </div>
                    )}

                  {/* SHIP BUTTON */}

                  {selectedOrder.status === "processing" && (
                    <button
                      type="button"
                      onClick={handleShipOrder}
                      disabled={
                        shippingOrder || selectedOrder.paymentStatus !== "paid"
                      }
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3.5 text-sm font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {shippingOrder ? (
                        <>
                          <RefreshCw size={17} className="animate-spin" />
                          Shipping Order...
                        </>
                      ) : (
                        <>
                          <Truck size={17} />
                          Ship Order
                        </>
                      )}
                    </button>
                  )}

                  {selectedOrder.status === "processing" &&
                    selectedOrder.paymentStatus !== "paid" && (
                      <p className="mt-2 text-xs text-orange-600">
                        Payment must be confirmed before this order can be
                        shipped.
                      </p>
                    )}

                  {/* DELIVER BUTTON */}

                  {selectedOrder.status === "shipped" && (
                    <button
                      type="button"
                      onClick={handleDeliverOrder}
                      disabled={deliveringOrder}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {deliveringOrder ? (
                        <>
                          <RefreshCw size={17} className="animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={17} />
                          Mark as Delivered
                        </>
                      )}
                    </button>
                  )}

                  {/* DELIVERED */}

                  {selectedOrder.status === "delivered" && (
                    <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-emerald-100 px-4 py-3 text-sm font-bold text-emerald-700">
                      <CheckCircle2 size={17} />
                      Order Delivered
                    </div>
                  )}

                  {/* CANCELLED */}

                  {selectedOrder.status === "cancelled" && (
                    <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-center text-sm font-semibold text-red-600">
                      This order has been cancelled.
                    </div>
                  )}
                </div>
              </section>

              {/* =================================================
                  ORDER STATUS
              ================================================== */}

              <section>
                <h3 className="mb-3 text-sm font-bold text-slate-900">
                  Order Status
                </h3>

                <select
                  value={selectedOrder.status}
                  disabled={
                    updatingStatus ||
                    selectedOrder.status === "shipped" ||
                    selectedOrder.status === "delivered"
                  }
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

                {selectedOrder.status === "shipped" && (
                  <p className="mt-2 text-xs text-slate-400">
                    Use the delivery button above to mark a shipped order as
                    delivered.
                  </p>
                )}

                {selectedOrder.status === "delivered" && (
                  <p className="mt-2 text-xs text-emerald-600">
                    This order has already been delivered.
                  </p>
                )}

                {updatingStatus && (
                  <p className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                    <RefreshCw size={12} className="animate-spin" />
                    Updating order status...
                  </p>
                )}
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
