import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaEye,
  FaSearch,
  FaSync,
} from "react-icons/fa";

import API from "../services/Api";

interface User {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
}

interface Product {
  _id: string;
  name: string;
  image?: string;
}

interface ReceivingPayment {
  _id: string;
  amount: number;
  paymentMethod: string;
  reference?: string;
  receivedAt: string;
}

interface Receiving {
  totalReceived: number;
  remainingAmount: number;
  status: "PENDING" | "PARTIAL" | "PAID" | "COMPLETED";
  payments: ReceivingPayment[];
}

interface PurchaseOrder {
  _id: string;

  user: User;

  product: Product;

  quantity: number;

  unitPrice: number;

  totalAmount: number;

  purchaseType:
    | "FULL_PAYMENT"
    | "CONTRIBUTION"
    | "LOAN"
    | "RESELL";

  status: string;

  receiving?: Receiving;

  createdAt: string;
}

const PURCHASE_TYPE_LABELS: Record<
  PurchaseOrder["purchaseType"],
  string
> = {
  FULL_PAYMENT: "Full Payment",
  CONTRIBUTION: "Contribution",
  LOAN: "Loan",
  RESELL: "Buy to Resell",
};

const formatMoney = (amount: number) => {
  return `₦${Number(amount || 0).toLocaleString()}`;
};

const getReceivingStatusClass = (
  status?: Receiving["status"]
) => {
  switch (status) {
    case "PAID":
    case "COMPLETED":
      return "bg-green-50 text-green-700";

    case "PARTIAL":
      return "bg-yellow-50 text-yellow-700";

    case "PENDING":
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const getPurchaseStatusClass = (
  status: string
) => {
  switch (status) {
    case "COMPLETED":
    case "DELIVERED":
      return "bg-green-50 text-green-700";

    case "CANCELLED":
      return "bg-red-50 text-red-700";

    case "CONTRIBUTION_ACTIVE":
    case "LOAN_APPROVED":
      return "bg-blue-50 text-blue-700";

    case "PENDING_PAYMENT":
    case "PENDING_LOAN_APPROVAL":
      return "bg-yellow-50 text-yellow-700";

    default:
      return "bg-gray-100 text-gray-600";
  }
};

export default function PurchaseOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState<
    PurchaseOrder[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState("ALL");

  // ==========================================
  // FETCH PURCHASE ORDERS
  // ==========================================

  const fetchPurchaseOrders = async (
    showRefresh = false
  ) => {
    try {
      setError("");

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await API.get(
        "/purchases"
      );

      const data =
        response.data?.data || [];

      setOrders(
        Array.isArray(data) ? data : []
      );
    } catch (error: any) {
      console.error(
        "Failed to fetch purchase orders:",
        error
      );

      setError(
        error?.response?.data?.message ||
          "Failed to load purchase orders."
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
    fetchPurchaseOrders();
  }, []);

  // ==========================================
  // FILTER
  // ==========================================

  const filteredOrders = orders.filter(
    (order) => {
      const customerName =
        order.user?.name || "";

      const customerEmail =
        order.user?.email || "";

      const productName =
        order.product?.name || "";

      const orderId =
        order._id || "";

      const searchText =
        search.toLowerCase();

      const matchesSearch =
        customerName
          .toLowerCase()
          .includes(searchText) ||
        customerEmail
          .toLowerCase()
          .includes(searchText) ||
        productName
          .toLowerCase()
          .includes(searchText) ||
        orderId
          .toLowerCase()
          .includes(searchText);

      const matchesFilter =
        filter === "ALL" ||
        order.purchaseType === filter;

      return (
        matchesSearch &&
        matchesFilter
      );
    }
  );

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-orange-500" />

          <p className="mt-3 text-sm text-gray-500">
            Loading purchase orders...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">

        {/* =====================================
            HEADER
        ====================================== */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Purchase Orders
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage customer purchases and
              received payments.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              fetchPurchaseOrders(true)
            }
            disabled={refreshing}
            className="flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:border-orange-300 hover:text-orange-500 disabled:opacity-60"
          >
            <FaSync
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>
        </div>

        {/* =====================================
            ERROR
        ====================================== */}

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* =====================================
            FILTERS
        ====================================== */}

        <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row">

            {/* SEARCH */}

            <div className="relative flex-1">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400" />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search customer, product or order ID..."
                className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-50"
              />
            </div>

            {/* PURCHASE TYPE */}

            <select
              value={filter}
              onChange={(e) =>
                setFilter(e.target.value)
              }
              className="h-11 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm font-medium text-gray-700 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50"
            >
              <option value="ALL">
                All Purchase Types
              </option>

              <option value="FULL_PAYMENT">
                Full Payment
              </option>

              <option value="CONTRIBUTION">
                Contribution
              </option>

              <option value="LOAN">
                Loan
              </option>

              <option value="RESELL">
                Buy to Resell
              </option>
            </select>
          </div>
        </div>

        {/* =====================================
            DESKTOP TABLE
        ====================================== */}

        <div className="hidden overflow-hidden rounded-2xl bg-white shadow-sm lg:block">

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left">
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                    Customer
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                    Product
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                    Type
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                    Total
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                    Received
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                    Remaining
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                    Receiving
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                    Order
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map(
                  (order) => {
                    const receiving =
                      order.receiving;

                    const received =
                      Number(
                        receiving?.totalReceived ||
                          0
                      );

                    const remaining =
                      Number(
                        receiving?.remainingAmount ??
                          Math.max(
                            order.totalAmount -
                              received,
                            0
                          )
                      );

                    return (
                      <tr
                        key={order._id}
                        className="border-b border-gray-50 transition hover:bg-gray-50"
                      >
                        {/* CUSTOMER */}

                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-gray-900">
                            {order.user?.name ||
                              "Unknown customer"}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {order.user?.email ||
                              order.user?.phone ||
                              ""}
                          </p>
                        </td>

                        {/* PRODUCT */}

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {order.product
                              ?.image ? (
                              <img
                                src={
                                  order
                                    .product
                                    .image
                                }
                                alt={
                                  order
                                    .product
                                    .name
                                }
                                className="h-10 w-10 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-lg bg-gray-100" />
                            )}

                            <div>
                              <p className="max-w-[180px] truncate text-sm font-medium text-gray-900">
                                {
                                  order
                                    .product
                                    ?.name
                                }
                              </p>

                              <p className="text-xs text-gray-500">
                                Qty:{" "}
                                {
                                  order.quantity
                                }
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* TYPE */}

                        <td className="px-5 py-4">
                          <span className="rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-600">
                            {
                              PURCHASE_TYPE_LABELS[
                                order
                                  .purchaseType
                              ]
                            }
                          </span>
                        </td>

                        {/* TOTAL */}

                        <td className="px-5 py-4 text-sm font-bold text-gray-900">
                          {formatMoney(
                            order.totalAmount
                          )}
                        </td>

                        {/* RECEIVED */}

                        <td className="px-5 py-4 text-sm font-bold text-green-600">
                          {formatMoney(
                            received
                          )}
                        </td>

                        {/* REMAINING */}

                        <td className="px-5 py-4 text-sm font-bold text-red-500">
                          {formatMoney(
                            remaining
                          )}
                        </td>

                        {/* RECEIVING STATUS */}

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${getReceivingStatusClass(
                              receiving?.status
                            )}`}
                          >
                            {receiving?.status ||
                              "PENDING"}
                          </span>
                        </td>

                        {/* ORDER STATUS */}

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${getPurchaseStatusClass(
                              order.status
                            )}`}
                          >
                            {order.status.replace(
                              /_/g,
                              " "
                            )}
                          </span>
                        </td>

                        {/* ACTION */}

                        <td className="px-5 py-4">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/admin/purchases/${order._id}`
                              )
                            }
                            className="flex h-9 items-center gap-2 rounded-lg bg-orange-500 px-3 text-xs font-semibold text-white transition hover:bg-orange-600"
                          >
                            <FaEye />

                            View
                          </button>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>

          {/* EMPTY */}

          {filteredOrders.length === 0 && (
            <div className="px-6 py-16 text-center">
              <p className="text-sm font-semibold text-gray-700">
                No purchase orders found
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Try changing your search or
                filter.
              </p>
            </div>
          )}
        </div>

        {/* =====================================
            MOBILE CARDS
        ====================================== */}

        <div className="space-y-4 lg:hidden">
          {filteredOrders.map(
            (order) => {
              const receiving =
                order.receiving;

              const received =
                Number(
                  receiving?.totalReceived ||
                    0
                );

              const remaining =
                Number(
                  receiving?.remainingAmount ??
                    Math.max(
                      order.totalAmount -
                        received,
                      0
                    )
                );

              return (
                <div
                  key={order._id}
                  className="rounded-2xl bg-white p-4 shadow-sm"
                >
                  {/* PRODUCT */}

                  <div className="flex gap-3">
                    {order.product?.image ? (
                      <img
                        src={
                          order.product
                            .image
                        }
                        alt={
                          order.product
                            .name
                        }
                        className="h-14 w-14 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="h-14 w-14 rounded-xl bg-gray-100" />
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-gray-900">
                        {
                          order.product
                            ?.name
                        }
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {
                          order.user?.name
                        }
                      </p>

                      <span className="mt-2 inline-block rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-semibold text-orange-600">
                        {
                          PURCHASE_TYPE_LABELS[
                            order
                              .purchaseType
                          ]
                        }
                      </span>
                    </div>
                  </div>

                  {/* MONEY */}

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="text-[10px] uppercase text-gray-400">
                        Total
                      </p>

                      <p className="mt-1 text-xs font-bold text-gray-900">
                        {formatMoney(
                          order.totalAmount
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl bg-green-50 p-3">
                      <p className="text-[10px] uppercase text-green-600">
                        Received
                      </p>

                      <p className="mt-1 text-xs font-bold text-green-700">
                        {formatMoney(
                          received
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl bg-red-50 p-3">
                      <p className="text-[10px] uppercase text-red-500">
                        Remaining
                      </p>

                      <p className="mt-1 text-xs font-bold text-red-600">
                        {formatMoney(
                          remaining
                        )}
                      </p>
                    </div>
                  </div>

                  {/* STATUS */}

                  <div className="mt-4 flex items-center justify-between">
                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${getReceivingStatusClass(
                        receiving?.status
                      )}`}
                    >
                      {receiving?.status ||
                        "PENDING"}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${getPurchaseStatusClass(
                        order.status
                      )}`}
                    >
                      {order.status.replace(
                        /_/g,
                        " "
                      )}
                    </span>
                  </div>

                  {/* VIEW */}

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/admin/purchases/${order._id}`
                      )
                    }
                    className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-orange-500 text-sm font-bold text-white transition hover:bg-orange-600"
                  >
                    <FaEye />

                    View Purchase
                  </button>
                </div>
              );
            }
          )}

          {/* EMPTY */}

          {filteredOrders.length === 0 && (
            <div className="rounded-2xl bg-white px-6 py-16 text-center shadow-sm">
              <p className="text-sm font-semibold text-gray-700">
                No purchase orders found
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Try changing your search or
                filter.
              </p>
            </div>
          )}
        </div>

        {/* =====================================
            COUNT
        ====================================== */}

        <p className="mt-4 text-xs text-gray-400">
          Showing {filteredOrders.length} of{" "}
          {orders.length} purchase orders
        </p>
      </div>
    </div>
  );
}