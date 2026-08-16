
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Clock3,
  ExternalLink,
  Eye,
  Loader2,
  MapPin,
  Package,
  RefreshCw,
  Search,
  Truck,
  X,
} from "lucide-react";


interface ShippingAddress {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
}

interface OrderItem {
  name?: string;
  product?: {
    name?: string;
    image?: string;
  };
  quantity?: number;
}

interface Order {
  _id: string;

  user?: {
    name?: string;
    email?: string;
  };

  customer?: {
    name?: string;
    email?: string;
  };

  items?: OrderItem[];

  total?: number;
  totalAmount?: number;

  status?: string;
  paymentStatus?: string;

  shippingStatus?: string;

  trackingNumber?: string;
  tracking?: string;

  carrier?: string;
  shippingCarrier?: string;

  shippingAddress?: ShippingAddress;

  createdAt: string;
  updatedAt?: string;
}

type ShippingFilter =
  | "all"
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

const SHIPPING_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

const CARRIERS = [
  "DHL",
  "FedEx",
  "UPS",
  "USPS",
  "GIG Logistics",
  "Other",
];

export default function AdminShipping() {
  const [orders, setOrders] = useState<Order[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ShippingFilter>("all");

  const [error, setError] = useState("");

  const [selectedOrder, setSelectedOrder] =
    useState<Order | null>(null);

  const [editingShipment, setEditingShipment] =
    useState<Order | null>(null);

  const [status, setStatus] =
    useState<string>("pending");

  const [carrier, setCarrier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");

  const [saving, setSaving] = useState(false);

  // ==========================================
  // FETCH ORDERS / SHIPPING
  // ==========================================

  const fetchShipping = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await fetch("/api/admin/orders");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch shipping orders"
        );
      }

      setOrders(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch shipping orders"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchShipping();
  }, []);

  // ==========================================
  // HELPERS
  // ==========================================

  const getShippingStatus = (order: Order) => {
    return (
      order.shippingStatus ||
      order.status ||
      "pending"
    ).toLowerCase();
  };

  const getTrackingNumber = (order: Order) => {
    return (
      order.trackingNumber ||
      order.tracking ||
      ""
    );
  };

  const getCarrier = (order: Order) => {
    return (
      order.carrier ||
      order.shippingCarrier ||
      ""
    );
  };

  const getCustomer = (order: Order) => {
    return order.user || order.customer;
  };

  // ==========================================
  // STATISTICS
  // ==========================================

  const statistics = useMemo(() => {
    const countStatus = (value: string) =>
      orders.filter(
        (order) => getShippingStatus(order) === value
      ).length;

    return {
      total: orders.length,
      pending: countStatus("pending"),
      processing: countStatus("processing"),
      shipped: countStatus("shipped"),
      delivered: countStatus("delivered"),
      cancelled: countStatus("cancelled"),
      withTracking: orders.filter(
        (order) => Boolean(getTrackingNumber(order))
      ).length,
    };
  }, [orders]);

  // ==========================================
  // FILTER
  // ==========================================

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const customer = getCustomer(order);

      const customerName =
        customer?.name?.toLowerCase() || "";

      const customerEmail =
        customer?.email?.toLowerCase() || "";

      const tracking =
        getTrackingNumber(order).toLowerCase();

      const orderId =
        order._id?.toLowerCase() || "";

      const matchesSearch =
        !query ||
        orderId.includes(query) ||
        customerName.includes(query) ||
        customerEmail.includes(query) ||
        tracking.includes(query);

      const shippingStatus =
        getShippingStatus(order);

      const matchesFilter =
        filter === "all" ||
        shippingStatus === filter;

      return matchesSearch && matchesFilter;
    });
  }, [orders, search, filter]);

  // ==========================================
  // OPEN EDIT MODAL
  // ==========================================

  const openEditShipment = (order: Order) => {
    setEditingShipment(order);

    setStatus(getShippingStatus(order));
    setCarrier(getCarrier(order));
    setTrackingNumber(getTrackingNumber(order));

    setError("");
  };

  const closeEditShipment = () => {
    if (saving) return;

    setEditingShipment(null);
    setStatus("pending");
    setCarrier("");
    setTrackingNumber("");
  };

  // ==========================================
  // UPDATE SHIPPING
  // ==========================================

  const updateShipping = async () => {
    if (!editingShipment) return;

    const normalizedStatus =
      status.trim().toLowerCase();

    if (
      !SHIPPING_STATUSES.includes(
        normalizedStatus as (typeof SHIPPING_STATUSES)[number]
      )
    ) {
      setError("Please select a valid shipping status.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      /*
       * IMPORTANT:
       *
       * Shipping status is intentionally sent separately
       * from the order status.
       *
       * This allows the admin to manually change:
       *
       * pending
       * processing
       * shipped
       * delivered
       * cancelled
       *
       * without automatically changing the main order status.
       */

      const response = await fetch(
        `/api/admin/orders/${editingShipment._id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            shippingStatus: normalizedStatus,
            carrier: carrier.trim(),
            trackingNumber: trackingNumber.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update shipping information"
        );
      }

      /*
       * Prefer the updated order returned by the backend.
       * This keeps the frontend synchronized with the database.
       */
      const updatedOrder =
        data.data || data.order;

      setOrders((currentOrders) =>
        currentOrders.map((order) => {
          if (
            order._id !== editingShipment._id
          ) {
            return order;
          }

          return {
            ...order,

            ...(updatedOrder || {
              shippingStatus: normalizedStatus,
              carrier: carrier.trim(),
              shippingCarrier: carrier.trim(),
              trackingNumber:
                trackingNumber.trim(),
              tracking:
                trackingNumber.trim(),
            }),
          };
        })
      );

      /*
       * If the backend does not return the updated
       * order, the local state is still updated manually.
       */
      if (!updatedOrder) {
        setOrders((currentOrders) =>
          currentOrders.map((order) =>
            order._id === editingShipment._id
              ? {
                  ...order,
                  shippingStatus: normalizedStatus,
                  carrier: carrier.trim(),
                  shippingCarrier: carrier.trim(),
                  trackingNumber:
                    trackingNumber.trim(),
                  tracking:
                    trackingNumber.trim(),
                }
              : order
          )
        );
      }

      setEditingShipment(null);
      setStatus("pending");
      setCarrier("");
      setTrackingNumber("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update shipping information"
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // TRACKING LINK
  // ==========================================

  const getTrackingUrl = (order: Order) => {
    return getCarrierTrackingUrl(
      getCarrier(order),
      getTrackingNumber(order)
    );
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Truck size={16} />

            <span>Store</span>
            <span>/</span>

            <span className="text-slate-900">
              Shipping
            </span>
          </div>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            Shipping
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage shipments, carriers and tracking information.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchShipping(true)}
          disabled={refreshing}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw
            size={17}
            className={
              refreshing ? "animate-spin" : ""
            }
          />

          Refresh
        </button>
      </div>

      {/* ERROR */}

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* STATISTICS */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ShippingStat
          title="Total shipments"
          value={statistics.total}
          description="All orders"
          icon={<Package size={20} />}
        />

        <ShippingStat
          title="Awaiting shipment"
          value={
            statistics.pending +
            statistics.processing
          }
          description="Needs fulfillment"
          icon={<Clock3 size={20} />}
        />

        <ShippingStat
          title="In transit"
          value={statistics.shipped}
          description="Currently shipping"
          icon={<Truck size={20} />}
        />

        <ShippingStat
          title="Delivered"
          value={statistics.delivered}
          description="Successfully delivered"
          icon={<CheckCircle2 size={20} />}
        />
      </div>

      {/* SHIPPING STATUS */}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <ShippingFilterButton
          label="Pending"
          count={statistics.pending}
          active={filter === "pending"}
          onClick={() => setFilter("pending")}
        />

        <ShippingFilterButton
          label="Processing"
          count={statistics.processing}
          active={filter === "processing"}
          onClick={() => setFilter("processing")}
        />

        <ShippingFilterButton
          label="Shipped"
          count={statistics.shipped}
          active={filter === "shipped"}
          onClick={() => setFilter("shipped")}
        />

        <ShippingFilterButton
          label="Delivered"
          count={statistics.delivered}
          active={filter === "delivered"}
          onClick={() => setFilter("delivered")}
        />

        <ShippingFilterButton
          label="Cancelled"
          count={statistics.cancelled}
          active={filter === "cancelled"}
          onClick={() => setFilter("cancelled")}
        />
      </div>

      {/* FILTERS */}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-lg">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search order, customer or tracking number..."
              className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            />
          </div>

          <div className="relative">
            <select
              value={filter}
              onChange={(event) =>
                setFilter(
                  event.target.value as ShippingFilter
                )
              }
              className="h-11 appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-10 text-sm font-medium text-slate-700 outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            >
              <option value="all">
                All shipments
              </option>

              {SHIPPING_STATUSES.map(
                (shippingStatus) => (
                  <option
                    key={shippingStatus}
                    value={shippingStatus}
                  >
                    {capitalize(shippingStatus)}
                  </option>
                )
              )}
            </select>

            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* SHIPPING TABLE */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="font-semibold text-slate-900">
              Shipments
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {filteredOrders.length} shipment
              {filteredOrders.length === 1
                ? ""
                : "s"} displayed.
            </p>
          </div>

          <div className="hidden items-center gap-2 text-xs text-slate-400 sm:flex">
            <Truck size={15} />

            <span>
              {statistics.withTracking} with tracking
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Order
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Customer
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Destination
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Carrier
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Tracking
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
                    colSpan={7}
                    className="px-6 py-14 text-center"
                  >
                    <Loader2
                      size={24}
                      className="mx-auto animate-spin text-slate-400"
                    />

                    <p className="mt-3 text-sm text-slate-500">
                      Loading shipments...
                    </p>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-14 text-center"
                  >
                    <Truck
                      size={32}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 text-sm font-semibold text-slate-700">
                      No shipments found
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Try changing your search or filter.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const customer =
                    getCustomer(order);

                  const address =
                    order.shippingAddress;

                  const currentStatus =
                    getShippingStatus(order);

                  const tracking =
                    getTrackingNumber(order);

                  const currentCarrier =
                    getCarrier(order);

                  const trackingUrl =
                    getTrackingUrl(order);

                  return (
                    <tr
                      key={order._id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            #{order._id.slice(-8)}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {customer?.name ||
                              "Guest customer"}
                          </p>

                          <p className="mt-1 max-w-[170px] truncate text-xs text-slate-400">
                            {customer?.email ||
                              "No email"}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {address ? (
                          <div className="flex items-start gap-2">
                            <MapPin
                              size={15}
                              className="mt-0.5 shrink-0 text-slate-400"
                            />

                            <div>
                              <p className="text-sm font-medium text-slate-700">
                                {address.city ||
                                  "Unknown city"}
                              </p>

                              <p className="mt-1 max-w-[150px] truncate text-xs text-slate-400">
                                {[
                                  address.state,
                                  address.country,
                                ]
                                  .filter(Boolean)
                                  .join(", ")}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">
                            No address
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {currentCarrier ? (
                          <span className="text-sm font-semibold text-slate-700">
                            {currentCarrier}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">
                            Not assigned
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {tracking ? (
                          <div className="flex items-center gap-2">
                            <span className="max-w-[130px] truncate text-xs font-medium text-slate-700">
                              {tracking}
                            </span>

                            {trackingUrl && (
                              <a
                                href={trackingUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-slate-400 transition hover:text-slate-900"
                                title="Track shipment"
                              >
                                <ExternalLink size={14} />
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">
                            No tracking
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <ShippingStatusBadge
                          status={currentStatus}
                        />
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedOrder(order)
                            }
                            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                          >
                            <Eye size={14} />
                            View
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              openEditShipment(order)
                            }
                            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-slate-900 px-3 text-xs font-semibold text-white transition hover:bg-slate-800"
                          >
                            <Truck size={14} />
                            Update
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

      {/* DETAILS MODAL */}

      {selectedOrder && (
        <ShippingDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onEdit={() => {
            setSelectedOrder(null);
            openEditShipment(selectedOrder);
          }}
        />
      )}

      {/* EDIT MODAL */}

      {editingShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="font-bold text-slate-900">
                  Update shipment
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Order #{editingShipment._id.slice(-8)}
                </p>
              </div>

              <button
                type="button"
                onClick={closeEditShipment}
                disabled={saving}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5 p-6">
              {/* STATUS */}

              <div>
                <label
                  htmlFor="shipping-status"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Shipping status
                </label>

                <div className="relative">
                  <select
                    id="shipping-status"
                    value={status}
                    onChange={(event) =>
                      setStatus(event.target.value)
                    }
                    className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm font-medium text-slate-700 outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                  >
                    {SHIPPING_STATUSES.map(
                      (shippingStatus) => (
                        <option
                          key={shippingStatus}
                          value={shippingStatus}
                        >
                          {capitalize(shippingStatus)}
                        </option>
                      )
                    )}
                  </select>

                  <ChevronDown
                    size={17}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>

              {/* CARRIER */}

              <div>
                <label
                  htmlFor="shipping-carrier"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Carrier
                </label>

                <div className="relative">
                  <select
                    id="shipping-carrier"
                    value={carrier}
                    onChange={(event) =>
                      setCarrier(event.target.value)
                    }
                    className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm font-medium text-slate-700 outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                  >
                    <option value="">
                      Select carrier
                    </option>

                    {CARRIERS.map((carrierName) => (
                      <option
                        key={carrierName}
                        value={carrierName}
                      >
                        {carrierName}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={17}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>

              {/* TRACKING */}

              <div>
                <label
                  htmlFor="tracking-number"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Tracking number
                </label>

                <input
                  id="tracking-number"
                  type="text"
                  value={trackingNumber}
                  onChange={(event) =>
                    setTrackingNumber(event.target.value)
                  }
                  placeholder="Enter tracking number"
                  className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                />
              </div>

              {/* SUMMARY */}

              <div className="rounded-xl bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Shipping status
                  </span>

                  <span className="text-sm font-semibold text-slate-900">
                    {capitalize(status)}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Carrier
                  </span>

                  <span className="text-sm font-semibold text-slate-900">
                    {carrier || "Not assigned"}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Tracking
                  </span>

                  <span className="max-w-[180px] truncate text-sm font-semibold text-slate-900">
                    {trackingNumber || "Not added"}
                  </span>
                </div>
              </div>

              {/* ACTIONS */}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeEditShipment}
                  disabled={saving}
                  className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={updateShipping}
                  disabled={saving}
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
                >
                  {saving && (
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  )}

                  {saving
                    ? "Saving..."
                    : "Save shipment"}
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

function ShippingStat({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {value.toLocaleString()}
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

/* ==========================================
   FILTER BUTTON
========================================== */

function ShippingFilterButton({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-between rounded-xl border px-4 py-3 transition ${
        active
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      }`}
    >
      <span className="text-sm font-semibold">
        {label}
      </span>

      <span
        className={`rounded-full px-2 py-0.5 text-xs font-bold ${
          active
            ? "bg-white/15 text-white"
            : "bg-slate-100 text-slate-600"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

/* ==========================================
   STATUS BADGE
========================================== */

function ShippingStatusBadge({
  status,
}: {
  status: string;
}) {
  const styles: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700",
    processing: "bg-blue-50 text-blue-700",
    shipped: "bg-violet-50 text-violet-700",
    delivered: "bg-emerald-50 text-emerald-700",
    cancelled: "bg-red-50 text-red-700",
  };

  const icons: Record<string, React.ReactNode> = {
    pending: <Clock3 size={14} />,
    processing: <Package size={14} />,
    shipped: <Truck size={14} />,
    delivered: <CheckCircle2 size={14} />,
    cancelled: <AlertCircle size={14} />,
  };

  const normalized =
    status?.toLowerCase() || "pending";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
        styles[normalized] ||
        "bg-slate-100 text-slate-600"
      }`}
    >
      {icons[normalized]}

      {capitalize(normalized)}
    </span>
  );
}

/* ==========================================
   DETAILS MODAL
========================================== */

function ShippingDetailsModal({
  order,
  onClose,
  onEdit,
}: {
  order: Order;
  onClose: () => void;
  onEdit: () => void;
}) {
  const customer =
    order.user || order.customer;

  const address =
    order.shippingAddress;

  const tracking =
    order.trackingNumber ||
    order.tracking ||
    "";

  const carrier =
    order.carrier ||
    order.shippingCarrier ||
    "";

  const shippingStatus =
    order.shippingStatus ||
    order.status ||
    "pending";

  const trackingUrl = tracking
    ? getCarrierTrackingUrl(
        carrier,
        tracking
      )
    : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5">
          <div>
            <h2 className="font-bold text-slate-900">
              Shipment details
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Order #{order._id.slice(-8)}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <DetailsBox
              title="Customer"
              value={
                customer?.name ||
                "Guest customer"
              }
              description={
                customer?.email ||
                "No email"
              }
            />

            <DetailsBox
              title="Shipping status"
              value={capitalize(
                shippingStatus
              )}
              description={formatDate(
                order.createdAt
              )}
            />
          </div>

          <div className="rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-2">
              <Truck
                size={18}
                className="text-slate-700"
              />

              <h3 className="font-semibold text-slate-900">
                Shipment
              </h3>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <DetailsBox
                title="Carrier"
                value={
                  carrier || "Not assigned"
                }
                description="Shipping provider"
              />

              <DetailsBox
                title="Tracking number"
                value={
                  tracking ||
                  "Not available"
                }
                description={
                  tracking
                    ? "Shipment tracking"
                    : "Tracking has not been added"
                }
              />
            </div>

            {trackingUrl && (
              <a
                href={trackingUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-900 hover:underline"
              >
                Track shipment
                <ExternalLink size={15} />
              </a>
            )}
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2">
              <MapPin
                size={18}
                className="text-slate-700"
              />

              <h3 className="font-semibold text-slate-900">
                Delivery address
              </h3>
            </div>

            <div className="rounded-xl bg-slate-50 p-5 text-sm leading-6 text-slate-600">
              {address ? (
                <>
                  {address.name && (
                    <p className="font-semibold text-slate-900">
                      {address.name}
                    </p>
                  )}

                  {address.address && (
                    <p>{address.address}</p>
                  )}

                  <p>
                    {[
                      address.city,
                      address.state,
                      address.postalCode,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>

                  {address.country && (
                    <p>{address.country}</p>
                  )}

                  {address.phone && (
                    <p className="mt-2">
                      {address.phone}
                    </p>
                  )}
                </>
              ) : (
                <p>
                  No shipping address available.
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Close
            </button>

            <button
              type="button"
              onClick={onEdit}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Truck size={16} />
              Update shipment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================
   DETAILS BOX
========================================== */

function DetailsBox({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <p className="text-xs font-medium text-slate-400">
        {title}
      </p>

      <p className="mt-2 break-words text-sm font-semibold text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>
    </div>
  );
}

/* ==========================================
   HELPERS
========================================== */

function capitalize(value: string) {
  if (!value) return "";

  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
}

function formatDate(date: string) {
  if (!date) return "Unknown date";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(parsedDate);
}

/* ==========================================
   CARRIER TRACKING URL
========================================== */

function getCarrierTrackingUrl(
  carrier: string,
  tracking: string
) {
  const normalized =
    carrier.toLowerCase().trim();

  const encoded =
    encodeURIComponent(tracking.trim());

  if (!encoded) return "";

  if (normalized.includes("dhl")) {
    return `https://www.dhl.com/global-en/home/tracking.html?tracking-id=${encoded}`;
  }

  if (normalized.includes("fedex")) {
    return `https://www.fedex.com/fedextrack/?trknbr=${encoded}`;
  }

  if (normalized.includes("ups")) {
    return `https://www.ups.com/track?tracknum=${encoded}`;
  }

  if (normalized.includes("usps")) {
    return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${encoded}`;
  }

  return "";
}
