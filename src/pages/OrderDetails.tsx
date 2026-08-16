import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaClock,
  FaBoxOpen,
  FaTruck,
  FaTimesCircle,
  FaSync,
  FaMapMarkerAlt,
} from "react-icons/fa";
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

interface Shipping {
  courier: string;
  trackingNumber: string;
  shippedAt?: string | null;
  estimatedDeliveryDate?: string | null;
  deliveredAt?: string | null;
  notes?: string;
}

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

interface Order {
  _id: string;

  customer: {
    name: string;
    phone: string;
    email?: string;
  };

  user?: {
    _id?: string;
    name?: string;
    phone?: string;
    email?: string;
  };

  deliveryAddress: {
    name?: string;
    address: string;
    city: string;
    state: string;
    country?: string;
    postalCode?: string;
    phone?: string;
  };

  shippingAddress?: Order["deliveryAddress"];

  items: OrderItem[];

  subtotal: number;
  deliveryFee: number;
  total: number;

  status: OrderStatus;

  shippingStatus?: ShippingStatus;

  paymentStatus:
    | "pending"
    | "paid"
    | "failed"
    | "refunded";

  paymentMethod: string;

  shipping?: Shipping;

  carrier?: string;
  shippingCarrier?: string;
  trackingNumber?: string;
  tracking?: string;

  // Customer receipt confirmation
  customerConfirmed?: boolean;
  customerConfirmedAt?: string | null;

  // Compatibility aliases
  receiptConfirmed?: boolean;
  receiptConfirmedAt?: string | null;

  deliveryConfirmed?: boolean;
  deliveryConfirmedAt?: string | null;

  createdAt: string;
  updatedAt: string;
}

// =========================================================
// STATUS ARRAYS
// =========================================================

const orderStatuses: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
];

const shippingStatuses: ShippingStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
];

// =========================================================
// COMPONENT
// =========================================================

export default function OrderDetails() {
  const { id } = useParams<{ id: string }>();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // Receipt confirmation state
  const [confirmingReceipt, setConfirmingReceipt] =
    useState(false);

  const [receiptMessage, setReceiptMessage] =
    useState("");

  // =========================================================
  // FETCH ORDER
  // =========================================================

  const loadOrder = async (showLoading = true) => {
    if (!id) {
      setError("Order ID is missing.");
      setLoading(false);
      return;
    }

    try {
      if (showLoading) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      // Try loading a purchase first to avoid a noisy 404 when the id is a purchase
      try {
        const purchaseResponse = await API.get(`/purchase/${id}`);

        const p = purchaseResponse.data?.data;

        // Map purchase to order-like shape used by this page
        const mapped: Order = {
          _id: p._id,
          customer: {
            name: p.user?.name || "",
            phone: "",
            email: "",
          },
          user: {
            _id: p.user || undefined,
          },
          deliveryAddress: {
            address: "",
            city: "",
            state: "",
          },
          items: [
            {
              product: p.product
                ? {
                    _id: p.product._id,
                    name: p.product.name,
                    image: p.product.image,
                  }
                : undefined,
              name: p.product?.name || p.product || "",
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
          status: (p.status || "pending").toLowerCase() as OrderStatus,
          shippingStatus: undefined,
          paymentStatus: (p.payment?.status || "pending") as
            | "pending"
            | "paid"
            | "failed"
            | "refunded",
          paymentMethod: "bank",
          createdAt: p.createdAt || new Date().toISOString(),
          updatedAt: p.updatedAt || new Date().toISOString(),
        };

        setOrder(mapped);
      } catch (err: any) {
        if (err?.response?.status === 404) {
          // Not a purchase; load as an order
          const response = await API.get(`/orders/${id}`);

          console.log("CUSTOMER ORDER DETAILS:", response.data);

          const updatedOrder = response.data?.data;

          if (!updatedOrder) {
            setOrder(null);
            setError("Order data was not returned.");
            return;
          }

          setOrder(updatedOrder);
        } else {
          throw err;
        }
      }
    } catch (error: any) {
      console.error(
        "Failed to fetch order:",
        error,
      );

      setError(
        error?.response?.data?.message ||
          "Failed to load order.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadOrder(true);
  }, [id]);

  // =========================================================
  // AUTO REFRESH
  // =========================================================

  useEffect(() => {
    if (!id || !order) return;

    const orderFinished =
      order.status === "cancelled" ||
      order.status === "delivered";

    const shippingFinished =
      order.shippingStatus === "cancelled" ||
      order.shippingStatus === "delivered";

    if (orderFinished && shippingFinished) {
      return;
    }

    const interval = setInterval(() => {
      loadOrder(false);
    }, 15000);

    return () => clearInterval(interval);
  }, [
    id,
    order?.status,
    order?.shippingStatus,
  ]);

  // =========================================================
  // MANUAL REFRESH
  // =========================================================

  const handleRefresh = () => {
    loadOrder(false);
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" />

          <p className="mt-4 text-sm text-gray-500">
            Loading order...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR / NOT FOUND
  // =========================================================

  if (error || !order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <FaTimesCircle className="text-3xl text-red-500" />
          </div>

          <h1 className="mt-5 text-xl font-bold text-gray-900">
            Order Not Found
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            {error ||
              "We couldn't find this order."}
          </p>

          <Link
            to="/"
            className="mt-6 inline-block rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600"
          >
            Back to Shopping
          </Link>
        </div>
      </div>
    );
  }

  // =========================================================
  // SAFE SHIPPING STATUS
  // =========================================================

  const shippingStatus: ShippingStatus =
    (order.status === "delivered"
      ? "delivered"
      : (order.shippingStatus || order.status || "pending")) as ShippingStatus;

  // =========================================================
  // CUSTOMER RECEIPT CONFIRMATION
  // =========================================================

  const customerConfirmed =
    order.customerConfirmed === true ||
    order.receiptConfirmed === true ||
    order.deliveryConfirmed === true;

  const customerConfirmedAt =
    order.customerConfirmedAt ||
    order.receiptConfirmedAt ||
    order.deliveryConfirmedAt ||
    null;

  // =========================================================
  // ORDER STATUS ICON
  // =========================================================

  const getStatusIcon = () => {
    switch (order.status) {
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

  // =========================================================
  // ORDER STATUS TEXT
  // =========================================================

  const getStatusText = () => {
    switch (order.status) {
      case "pending":
        return "Order received";

      case "confirmed":
        return "Order confirmed";

      case "processing":
        return "Preparing your order";

      case "shipped":
        return "Order is on the way";

      case "delivered":
        return "Order delivered";

      case "cancelled":
        return "Order cancelled";

      default:
        return order.status;
    }
  };

  // =========================================================
  // ORDER STATUS DESCRIPTION
  // =========================================================

  const getStatusDescription = () => {
    switch (order.status) {
      case "pending":
        return "Your order has been received and is waiting for confirmation.";

      case "confirmed":
        return "Your order has been confirmed and will be prepared soon.";

      case "processing":
        return "Your order is currently being prepared.";

      case "shipped":
        return "Your order has been shipped and is on the way to you.";

      case "delivered":
        return "Your order has been delivered successfully.";

      case "cancelled":
        return "This order has been cancelled.";

      default:
        return "";
    }
  };

  // =========================================================
  // SHIPPING STATUS TEXT
  // =========================================================

  const getShippingStatusText = () => {
    switch (shippingStatus) {
      case "pending":
        return "Shipment pending";

      case "processing":
        return "Preparing shipment";

      case "shipped":
        return "Shipment is on the way";

      case "delivered":
        return "Shipment delivered";

      case "cancelled":
        return "Shipment cancelled";

      default:
        return "Shipment pending";
    }
  };

  // =========================================================
  // SHIPPING STATUS DESCRIPTION
  // =========================================================

  const getShippingStatusDescription = () => {
    switch (shippingStatus) {
      case "pending":
        return "Your order is waiting to be shipped.";

      case "processing":
        return "Your order is being prepared for shipment.";

      case "shipped":
        return "Your package has been shipped and is on the way to you.";

      case "delivered":
        return "Your package has been marked as delivered.";

      case "cancelled":
        return "The shipment for this order has been cancelled.";

      default:
        return "";
    }
  };

  // =========================================================
  // DATE
  // =========================================================

  const orderDate = new Date(
    order.createdAt,
  ).toLocaleString();

  const formatDate = (
    date?: string | null,
  ) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleDateString(
      undefined,
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      },
    );
  };

  // =========================================================
  // PAYMENT METHOD
  // =========================================================

  const paymentMethod = (
    order.paymentMethod || "unknown"
  )
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );

  // =========================================================
  // ORDER PROGRESS
  // =========================================================

  const currentStatusIndex =
    orderStatuses.indexOf(order.status);

  // =========================================================
  // SHIPPING PROGRESS
  // =========================================================

  const currentShippingIndex =
    shippingStatuses.indexOf(
      shippingStatus,
    );

  // =========================================================
  // SHIPPING
  // =========================================================

  const shipping = order.shipping;

  const hasShipping =
    shippingStatus === "processing" ||
    shippingStatus === "shipped" ||
    shippingStatus === "delivered";

  // =========================================================
  // CONFIRM CUSTOMER RECEIPT
  // =========================================================

  const handleConfirmReceipt = async () => {
    if (!id || !order || confirmingReceipt) {
      return;
    }
    const previousOrder = order;

    try {
      // If shipment is only "shipped" allow the customer to
      // optionally mark it delivered and confirm receipt.
      if (shippingStatus === "shipped") {
        const ok = window.confirm(
          "This order is marked as shipped. Mark it as delivered and confirm you received it?",
        );

        if (!ok) return;
      }

      setConfirmingReceipt(true);
      setReceiptMessage("");

      // Optimistic UI: hide the button immediately by marking
      // the order as confirmed locally so the button condition
      // (`!customerConfirmed`) becomes false.
      const now = new Date().toISOString();

      const optimisticOrder = {
        ...order,
        customerConfirmed: true,
        customerConfirmedAt: now,
        receiptConfirmed: true,
        receiptConfirmedAt: now,
        deliveryConfirmed: true,
        deliveryConfirmedAt: now,
        // If the order was only 'shipped' treat it as delivered
        status: order.status === "shipped" ? "delivered" : order.status,
        shippingStatus: "delivered",
        shipping: {
          ...(order.shipping || {}),
          deliveredAt: order.shipping?.deliveredAt || now,
          customerConfirmed: true,
          customerConfirmedAt: now,
        },
      } as Order;

      setOrder(optimisticOrder);

      const response = await API.patch(
        `/orders/${id}/confirm-receipt`,
      );

      console.log(
        "CONFIRM RECEIPT RESPONSE:",
        response.data,
      );

      if (response.data?.success) {
        const updatedOrder = response.data?.data || optimisticOrder;

        setOrder(updatedOrder);

        // Notify other app parts (e.g., admin orders) that this order changed
        try {
          window.dispatchEvent(
            new CustomEvent("orderUpdated", { detail: updatedOrder }),
          );
        } catch (e) {
          // Ignore if CustomEvent isn't supported (very old browsers)
        }

        setReceiptMessage(
          "You have confirmed that you received this order.",
        );
      } else {
        // Revert optimistic update
        setOrder(previousOrder);

        setReceiptMessage(
          response.data?.message ||
            "Failed to confirm receipt.",
        );
      }
    } catch (error: any) {
      console.error(
        "CONFIRM RECEIPT ERROR:",
        error,
      );

      // Revert optimistic update on error
      setOrder(previousOrder);

      setReceiptMessage(
        error?.response?.data?.message ||
          "Failed to confirm receipt.",
      );
    } finally {
      setConfirmingReceipt(false);
    }
  };

  // =========================================================
  // RETURN
  // =========================================================

  return (
    <div className="min-h-screen bg-gray-50">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between gap-3 px-4">

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-100"
              aria-label="Back to home"
            >
              <FaArrowLeft />
            </Link>

            <div>
              <h1 className="text-lg font-bold text-gray-900">
                Order Details
              </h1>

              <p className="text-xs text-gray-500">
                #{order._id}
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

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <main className="mx-auto max-w-4xl space-y-5 p-4 sm:p-6">

        {/* ==================================================
            ORDER STATUS
        =================================================== */}

        <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">

          <div className="flex items-start gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-50 text-xl">
              {getStatusIcon()}
            </div>

            <div className="min-w-0 flex-1">

              <h2 className="text-lg font-bold text-gray-900">
                {getStatusText()}
              </h2>

              <p className="mt-1 text-sm leading-6 text-gray-500">
                {getStatusDescription()}
              </p>

              <p className="mt-2 text-xs text-gray-400">
                Order placed on {orderDate}
              </p>
            </div>

            <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold capitalize text-gray-700">
              {order.status}
            </span>
          </div>

          {order.status === "cancelled" && (
            <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
              This order has been cancelled.
            </div>
          )}

          {order.status !== "cancelled" && (
            <div className="mt-8">

              <div className="grid grid-cols-5 gap-2">

                {orderStatuses.map(
                  (status, index) => {
                    const active =
                      index <= currentStatusIndex;

                    const isCurrent =
                      status === order.status;

                    return (
                      <div
                        key={status}
                        className="min-w-0"
                      >
                        <div
                          className={`h-1.5 rounded-full ${
                            active
                              ? "bg-orange-500"
                              : "bg-gray-100"
                          }`}
                        />

                        <div className="mt-2 flex items-center gap-1">

                          {isCurrent && (
                            <FaCheckCircle className="shrink-0 text-[9px] text-orange-500" />
                          )}

                          <p
                            className={`truncate text-[10px] capitalize sm:text-xs ${
                              active
                                ? "font-semibold text-gray-900"
                                : "text-gray-400"
                            }`}
                          >
                            {status}
                          </p>
                        </div>
                      </div>
                    );
                  },
                )}

              </div>
            </div>
          )}

          {order.status !== "delivered" &&
            order.status !== "cancelled" && (
              <p className="mt-5 text-center text-xs text-gray-400">
                Order status updates automatically.
              </p>
            )}
        </section>

        {/* ==================================================
            SHIPPING STATUS
        =================================================== */}

        {order.status !== "cancelled" && (
          <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-50">
                <FaTruck className="text-xl text-indigo-500" />
              </div>

              <div>
                <h2 className="font-bold text-gray-900">
                  Shipping Status
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  {getShippingStatusDescription()}
                </p>
              </div>

              <span className="ml-auto rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold capitalize text-indigo-700">
                {getShippingStatusText()}
              </span>
            </div>

            {/* SHIPPING PROGRESS */}

            {shippingStatus !== "cancelled" && (
              <div className="mt-6">

                <div className="grid grid-cols-4 gap-2">

                  {shippingStatuses.map(
                    (status, index) => {
                      const active =
                        index <=
                        currentShippingIndex;

                      const isCurrent =
                        status ===
                        shippingStatus;

                      return (
                        <div
                          key={status}
                          className="min-w-0"
                        >
                          <div
                            className={`h-1.5 rounded-full ${
                              active
                                ? "bg-indigo-500"
                                : "bg-gray-100"
                            }`}
                          />

                          <div className="mt-2 flex items-center gap-1">

                            {isCurrent && (
                              <FaCheckCircle className="shrink-0 text-[9px] text-indigo-500" />
                            )}

                            <p
                              className={`truncate text-[10px] capitalize sm:text-xs ${
                                active
                                  ? "font-semibold text-gray-900"
                                  : "text-gray-400"
                              }`}
                            >
                              {status}
                            </p>
                          </div>
                        </div>
                      );
                    },
                  )}

                </div>
              </div>
            )}

            {/* SHIPPING INFORMATION */}

            {hasShipping && (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">

                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs text-gray-400">
                    Courier
                  </p>

                  <p className="mt-1 font-semibold text-gray-900">
                    {shipping?.courier ||
                      order.shippingCarrier ||
                      order.carrier ||
                      "Not provided"}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs text-gray-400">
                    Tracking Number
                  </p>

                  <p className="mt-1 break-all font-semibold text-gray-900">
                    {shipping?.trackingNumber ||
                      order.trackingNumber ||
                      order.tracking ||
                      "Not provided"}
                  </p>
                </div>

                {shipping?.shippedAt && (
                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="text-xs text-gray-400">
                      Shipped On
                    </p>

                    <p className="mt-1 font-semibold text-gray-900">
                      {formatDate(
                        shipping.shippedAt,
                      )}
                    </p>
                  </div>
                )}

                {shipping?.estimatedDeliveryDate && (
                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="text-xs text-gray-400">
                      Estimated Delivery
                    </p>

                    <p className="mt-1 font-semibold text-gray-900">
                      {formatDate(
                        shipping.estimatedDeliveryDate,
                      )}
                    </p>
                  </div>
                )}

                {shipping?.deliveredAt && (
                  <div className="rounded-xl bg-green-50 p-4 sm:col-span-2">
                    <p className="text-xs text-green-600">
                      Delivered On
                    </p>

                    <p className="mt-1 font-semibold text-green-700">
                      {formatDate(
                        shipping.deliveredAt,
                      )}
                    </p>
                  </div>
                )}

              </div>
            )}

            {/* SHIPPING NOTES */}

            {shipping?.notes && (
              <div className="mt-4 rounded-xl border border-gray-100 bg-white p-4">

                <p className="text-xs text-gray-400">
                  Shipping Notes
                </p>

                <p className="mt-1 text-sm leading-6 text-gray-600">
                  {shipping.notes}
                </p>

              </div>
            )}

            {/* DELIVERY MESSAGE */}

            {shippingStatus === "delivered" && (
              <div className="mt-5 rounded-xl border border-green-100 bg-green-50 p-4">

                <div className="flex items-start gap-3">

                  <FaCheckCircle className="mt-0.5 shrink-0 text-green-600" />

                  <div>

                    <p className="font-semibold text-green-800">
                      Your order has been delivered
                    </p>

                    <p className="mt-1 text-sm leading-6 text-green-700">
                      Your package has been marked as
                      delivered. Please confirm once you
                      have received and checked your order.
                    </p>

                  </div>
                </div>
              </div>
            )}

          </section>
        )}

        {/* ==================================================
            CUSTOMER RECEIPT CONFIRMATION
        =================================================== */}

        {shippingStatus === "delivered" && (
          <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">

            <div className="flex items-start gap-4">

              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                  customerConfirmed
                    ? "bg-green-50"
                    : "bg-orange-50"
                }`}
              >
                <FaCheckCircle
                  className={
                    customerConfirmed
                      ? "text-xl text-green-500"
                      : "text-xl text-orange-500"
                  }
                />
              </div>

              <div className="min-w-0 flex-1">

                <h2 className="font-bold text-gray-900">
                  {customerConfirmed
                    ? "Receipt Confirmed"
                    : "Did you receive your order?"}
                </h2>

                <p className="mt-1 text-sm leading-6 text-gray-500">
                  {customerConfirmed
                    ? "You have confirmed that you received this order successfully."
                    : "Your order has been marked as delivered. Please confirm that you received it."}
                </p>

                {customerConfirmed &&
                  customerConfirmedAt && (
                    <p className="mt-2 text-xs text-gray-400">
                      Confirmed on{" "}
                      {formatDate(
                        customerConfirmedAt,
                      )}
                    </p>
                  )}

              </div>
            </div>

            {/* CONFIRM RECEIPT BUTTON */}

            {!customerConfirmed && (
              <div className="mt-5">

                <button
                  type="button"
                  onClick={handleConfirmReceipt}
                  disabled={confirmingReceipt}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {confirmingReceipt ? (
                    <>
                      <FaSync className="animate-spin" />
                      Confirming...
                    </>
                  ) : (
                    <>
                      <FaCheckCircle />
                      Confirm I Received This Order
                    </>
                  )}
                </button>

              </div>
            )}

            {/* RECEIPT MESSAGE */}

            {receiptMessage && (
              <div
                className={`mt-4 rounded-xl p-3 text-sm ${
                  customerConfirmed
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {receiptMessage}
              </div>
            )}

          </section>
        )}

        {/* ==================================================
            PRODUCTS
        =================================================== */}

        <section className="rounded-2xl bg-white shadow-sm">

          <div className="border-b border-gray-100 px-5 py-4 sm:px-6">

            <h2 className="font-bold text-gray-900">
              Ordered Products
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              {order.items.length}{" "}
              {order.items.length === 1
                ? "product"
                : "products"}
            </p>

          </div>

          <div className="divide-y divide-gray-100">

            {order.items.map((item, index) => {
              const image =
                item.image ||
                item.product?.image;

              return (
                <div
                  key={`${
                    item.product?._id ||
                    item.name
                  }-${index}`}
                  className="flex gap-4 p-5 sm:px-6"
                >

                  {image ? (
                    <img
                      src={image}
                      alt={item.name}
                      className="h-20 w-20 shrink-0 rounded-xl object-cover sm:h-24 sm:w-24"
                    />
                  ) : (
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-xs text-gray-400 sm:h-24 sm:w-24">
                      No image
                    </div>
                  )}

                  <div className="min-w-0 flex-1">

                    <h3 className="font-semibold text-gray-900">
                      {item.name}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      ₦
                      {Number(
                        item.price,
                      ).toLocaleString()}{" "}
                      × {item.quantity}
                    </p>

                    {item.originalPrice &&
                      item.originalPrice >
                        item.price && (
                        <p className="mt-1 text-xs text-gray-400 line-through">
                          ₦
                          {Number(
                            item.originalPrice,
                          ).toLocaleString()}
                        </p>
                      )}

                  </div>

                  <div className="text-right">

                    <p className="font-bold text-gray-900">
                      ₦
                      {Number(
                        item.total,
                      ).toLocaleString()}
                    </p>

                  </div>
                </div>
              );
            })}

          </div>
        </section>

        {/* ==================================================
            DELIVERY ADDRESS
        =================================================== */}

        <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">

          <h2 className="flex items-center gap-2 font-bold text-gray-900">
            <FaMapMarkerAlt className="text-orange-500" />
            Delivery Address
          </h2>

          <div className="mt-4 rounded-xl bg-gray-50 p-4">

            <p className="font-semibold text-gray-900">
              {order.deliveryAddress?.name ||
                order.customer.name}
            </p>

            <p className="mt-1 text-sm text-gray-600">
              {order.deliveryAddress.address}
            </p>

            <p className="text-sm text-gray-600">
              {order.deliveryAddress.city},{" "}
              {order.deliveryAddress.state}
            </p>

            {order.deliveryAddress.country && (
              <p className="text-sm text-gray-600">
                {order.deliveryAddress.country}
              </p>
            )}

            {order.deliveryAddress.postalCode && (
              <p className="text-sm text-gray-600">
                {order.deliveryAddress.postalCode}
              </p>
            )}

            <p className="mt-2 text-sm text-gray-600">
              {order.deliveryAddress.phone ||
                order.customer.phone}
            </p>

            {order.customer.email && (
              <p className="text-sm text-gray-600">
                {order.customer.email}
              </p>
            )}

          </div>
        </section>

        {/* ==================================================
            PAYMENT
        =================================================== */}

        <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">

          <h2 className="font-bold text-gray-900">
            Payment
          </h2>

          <div className="mt-4 space-y-3">

            <div className="flex justify-between gap-4 text-sm">
              <span className="text-gray-500">
                Payment method
              </span>

              <span className="text-right font-medium text-gray-900">
                {paymentMethod}
              </span>
            </div>

            <div className="flex justify-between gap-4 text-sm">

              <span className="text-gray-500">
                Payment status
              </span>

              <span
                className={`font-semibold capitalize ${
                  order.paymentStatus === "paid"
                    ? "text-green-600"
                    : order.paymentStatus ===
                        "failed"
                    ? "text-red-500"
                    : "text-amber-600"
                }`}
              >
                {order.paymentStatus}
              </span>

            </div>
          </div>
        </section>

        {/* ==================================================
            ORDER SUMMARY
        =================================================== */}

        <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">

          <h2 className="font-bold text-gray-900">
            Order Summary
          </h2>

          <div className="mt-4 space-y-3 text-sm">

            <div className="flex justify-between">

              <span className="text-gray-500">
                Subtotal
              </span>

              <span className="font-medium text-gray-900">
                ₦
                {Number(
                  order.subtotal,
                ).toLocaleString()}
              </span>

            </div>

            <div className="flex justify-between">

              <span className="text-gray-500">
                Delivery
              </span>

              <span className="font-medium text-gray-900">
                ₦
                {Number(
                  order.deliveryFee,
                ).toLocaleString()}
              </span>

            </div>

            <div className="border-t border-gray-100 pt-4">

              <div className="flex items-center justify-between">

                <span className="font-bold text-gray-900">
                  Total
                </span>

                <span className="text-xl font-bold text-orange-500">
                  ₦
                  {Number(
                    order.total,
                  ).toLocaleString()}
                </span>

              </div>
            </div>

          </div>
        </section>

        {/* ==================================================
            BACK TO SHOPPING
        =================================================== */}

        <Link
          to="/"
          className="block w-full rounded-xl bg-orange-500 py-4 text-center font-semibold text-white transition hover:bg-orange-600"
        >
          Continue Shopping
        </Link>

      </main>
    </div>
  );
}