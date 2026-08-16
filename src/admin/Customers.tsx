
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Eye,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  Search,
  ShoppingBag,
  User,
  Users,
  X,
} from "lucide-react";

interface Customer {
  _id: string;
  name?: string;
  email: string;
  phone?: string;

  active?: boolean;
  isActive?: boolean;

  role?: string;

  createdAt: string;
  updatedAt?: string;

  orders?: number;
  orderCount?: number;

  totalSpent?: number;
  totalOrders?: number;

  address?: {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
}

type CustomerFilter =
  | "all"
  | "active"
  | "inactive";

export default function AdminCustomers() {
  const [customers, setCustomers] =
    useState<Customer[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState<CustomerFilter>("all");

  const [selectedCustomer, setSelectedCustomer] =
    useState<Customer | null>(null);

  // ==========================================
  // FETCH CUSTOMERS
  // ==========================================

  const fetchCustomers = async (
    showRefresh = false
  ) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await fetch(
        "/api/admin/customers"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch customers"
        );
      }

      setCustomers(data.data || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch customers"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // ==========================================
  // HELPERS
  // ==========================================

  const isCustomerActive = (
    customer: Customer
  ) => {
    if (
      customer.active !== undefined
    ) {
      return customer.active;
    }

    if (
      customer.isActive !== undefined
    ) {
      return customer.isActive;
    }

    return true;
  };

  const getOrderCount = (
    customer: Customer
  ) => {
    return (
      customer.orderCount ??
      customer.orders ??
      customer.totalOrders ??
      0
    );
  };

  const getTotalSpent = (
    customer: Customer
  ) => {
    return customer.totalSpent ?? 0;
  };

  // ==========================================
  // STATISTICS
  // ==========================================

  const statistics = useMemo(() => {
    const active = customers.filter(
      (customer) =>
        isCustomerActive(customer)
    ).length;

    const inactive = customers.filter(
      (customer) =>
        !isCustomerActive(customer)
    ).length;

    const totalOrders =
      customers.reduce(
        (sum, customer) =>
          sum + getOrderCount(customer),
        0
      );

    const totalRevenue =
      customers.reduce(
        (sum, customer) =>
          sum +
          getTotalSpent(customer),
        0
      );

    return {
      total: customers.length,
      active,
      inactive,
      totalOrders,
      totalRevenue,
    };
  }, [customers]);

  // ==========================================
  // FILTER CUSTOMERS
  // ==========================================

  const filteredCustomers = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return customers.filter(
      (customer) => {
        const matchesSearch =
          !query ||
          customer.name
            ?.toLowerCase()
            .includes(query) ||
          customer.email
            .toLowerCase()
            .includes(query) ||
          customer.phone
            ?.toLowerCase()
            .includes(query);

        const active =
          isCustomerActive(customer);

        const matchesFilter =
          filter === "all" ||
          (filter === "active" &&
            active) ||
          (filter === "inactive" &&
            !active);

        return (
          matchesSearch &&
          matchesFilter
        );
      }
    );
  }, [
    customers,
    search,
    filter,
  ]);

  // ==========================================
  // TOGGLE CUSTOMER STATUS
  // ==========================================

  const toggleCustomerStatus = async (
    customer: Customer
  ) => {
    try {
      setError("");

      const newStatus =
        !isCustomerActive(customer);

      const response = await fetch(
        `/api/admin/customers/${customer._id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            active: newStatus,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update customer"
        );
      }

      setCustomers(
        (currentCustomers) =>
          currentCustomers.map(
            (item) =>
              item._id === customer._id
                ? {
                    ...item,
                    active:
                      newStatus,
                    isActive:
                      newStatus,
                  }
                : item
          )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update customer"
      );
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
            <Users size={16} />

            <span>Customers</span>

            <span>/</span>

            <span className="text-slate-900">
              All customers
            </span>
          </div>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            Customers
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage customer accounts and
            view customer activity.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            fetchCustomers(true)
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

      {/* =====================================
          ERROR
      ====================================== */}

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <AlertCircle size={18} />

          {error}
        </div>
      )}

      {/* =====================================
          STATISTICS
      ====================================== */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CustomerStat
          title="Total customers"
          value={statistics.total}
          description="Registered accounts"
          icon={<Users size={20} />}
        />

        <CustomerStat
          title="Active customers"
          value={statistics.active}
          description="Currently active"
          icon={
            <CheckCircle2 size={20} />
          }
        />

        <CustomerStat
          title="Total orders"
          value={statistics.totalOrders}
          description="Orders from customers"
          icon={
            <ShoppingBag size={20} />
          }
        />

        <CustomerStat
          title="Customer revenue"
          value={formatCurrency(
            statistics.totalRevenue
          )}
          description="Total customer spending"
          icon={
            <span className="text-lg font-bold">
              $
            </span>
          }
        />
      </div>

      {/* =====================================
          FILTERS
      ====================================== */}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* SEARCH */}

          <div className="relative w-full lg:max-w-lg">
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
              placeholder="Search customers by name, email or phone..."
              className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            />
          </div>

          {/* FILTER */}

          <div className="relative">
            <select
              value={filter}
              onChange={(event) =>
                setFilter(
                  event.target
                    .value as CustomerFilter
                )
              }
              className="h-11 appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-10 text-sm font-medium text-slate-700 outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            >
              <option value="all">
                All customers
              </option>

              <option value="active">
                Active customers
              </option>

              <option value="inactive">
                Inactive customers
              </option>
            </select>

            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* =====================================
          CUSTOMER TABLE
      ====================================== */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="font-semibold text-slate-900">
              Customer accounts
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {filteredCustomers.length}{" "}
              customer
              {filteredCustomers.length ===
              1
                ? ""
                : "s"} displayed.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Customer
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Contact
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Orders
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Spending
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Joined
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
                      size={25}
                      className="mx-auto animate-spin text-slate-400"
                    />

                    <p className="mt-3 text-sm text-slate-500">
                      Loading customers...
                    </p>
                  </td>
                </tr>
              ) : filteredCustomers.length ===
                0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-14 text-center"
                  >
                    <Users
                      size={32}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 text-sm font-semibold text-slate-700">
                      No customers found
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Try changing your
                      search or filter.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map(
                  (customer) => {
                    const active =
                      isCustomerActive(
                        customer
                      );

                    return (
                      <tr
                        key={customer._id}
                        className="transition hover:bg-slate-50"
                      >
                        {/* CUSTOMER */}

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <CustomerAvatar
                              name={
                                customer.name
                              }
                            />

                            <div>
                              <p className="text-sm font-semibold text-slate-900">
                                {customer.name ||
                                  "Unnamed customer"}
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                ID:{" "}
                                {customer._id.slice(
                                  -8
                                )}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* CONTACT */}

                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Mail
                                size={14}
                                className="text-slate-400"
                              />

                              <span className="max-w-[200px] truncate text-sm text-slate-700">
                                {
                                  customer.email
                                }
                              </span>
                            </div>

                            {customer.phone && (
                              <div className="flex items-center gap-2">
                                <Phone
                                  size={14}
                                  className="text-slate-400"
                                />

                                <span className="text-xs text-slate-400">
                                  {
                                    customer.phone
                                  }
                                </span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* ORDERS */}

                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-slate-800">
                            {getOrderCount(
                              customer
                            )}
                          </span>
                        </td>

                        {/* SPENDING */}

                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-slate-800">
                            {formatCurrency(
                              getTotalSpent(
                                customer
                              )
                            )}
                          </span>
                        </td>

                        {/* JOINED */}

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <CalendarDays
                              size={14}
                              className="text-slate-400"
                            />

                            <span className="text-sm text-slate-600">
                              {formatDate(
                                customer.createdAt
                              )}
                            </span>
                          </div>
                        </td>

                        {/* STATUS */}

                        <td className="px-6 py-4">
                          <CustomerStatus
                            active={active}
                          />
                        </td>

                        {/* ACTIONS */}

                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedCustomer(
                                  customer
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
                                toggleCustomerStatus(
                                  customer
                                )
                              }
                              className={`h-9 rounded-lg px-3 text-xs font-semibold transition ${
                                active
                                  ? "border border-red-200 text-red-600 hover:bg-red-50"
                                  : "bg-slate-900 text-white hover:bg-slate-800"
                              }`}
                            >
                              {active
                                ? "Disable"
                                : "Activate"}
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

      {/* =====================================
          CUSTOMER DETAILS MODAL
      ====================================== */}

      {selectedCustomer && (
        <CustomerDetailsModal
          customer={
            selectedCustomer
          }
          onClose={() =>
            setSelectedCustomer(null)
          }
          onToggle={() => {
            toggleCustomerStatus(
              selectedCustomer
            );
          }}
        />
      )}
    </div>
  );
}

/* ==========================================
   STAT CARD
========================================== */

function CustomerStat({
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
      <div className="flex items-start justify-between">
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

/* ==========================================
   AVATAR
========================================== */

function CustomerAvatar({
  name,
}: {
  name?: string;
}) {
  const initial =
    name?.trim().charAt(0).toUpperCase() ||
    "U";

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700">
      {initial}
    </div>
  );
}

/* ==========================================
   STATUS
========================================== */

function CustomerStatus({
  active,
}: {
  active: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-500"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active
            ? "bg-emerald-500"
            : "bg-slate-400"
        }`}
      />

      {active
        ? "Active"
        : "Inactive"}
    </span>
  );
}

/* ==========================================
   DETAILS MODAL
========================================== */

function CustomerDetailsModal({
  customer,
  onClose,
  onToggle,
}: {
  customer: Customer;
  onClose: () => void;
  onToggle: () => void;
}) {
  const active =
    customer.active ??
    customer.isActive ??
    true;

  const orderCount =
    customer.orderCount ??
    customer.orders ??
    customer.totalOrders ??
    0;

  const totalSpent =
    customer.totalSpent ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        {/* HEADER */}

        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5">
          <div className="flex items-center gap-3">
            <CustomerAvatar
              name={customer.name}
            />

            <div>
              <h2 className="font-bold text-slate-900">
                {customer.name ||
                  "Unnamed customer"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Customer account
              </p>
            </div>
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
          {/* SUMMARY */}

          <div className="grid gap-4 sm:grid-cols-3">
            <CustomerDetailStat
              title="Orders"
              value={orderCount}
              icon={
                <ShoppingBag size={17} />
              }
            />

            <CustomerDetailStat
              title="Spent"
              value={formatCurrency(
                totalSpent
              )}
              icon={
                <span className="font-bold">
                  $
                </span>
              }
            />

            <CustomerDetailStat
              title="Status"
              value={
                active
                  ? "Active"
                  : "Inactive"
              }
              icon={
                <CheckCircle2 size={17} />
              }
            />
          </div>

          {/* CONTACT */}

          <div className="rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-900">
              Contact information
            </h3>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <InfoRow
                icon={<Mail size={16} />}
                label="Email"
                value={
                  customer.email ||
                  "No email"
                }
              />

              <InfoRow
                icon={<Phone size={16} />}
                label="Phone"
                value={
                  customer.phone ||
                  "No phone number"
                }
              />

              <InfoRow
                icon={<User size={16} />}
                label="Role"
                value={
                  customer.role ||
                  "Customer"
                }
              />

              <InfoRow
                icon={
                  <CalendarDays
                    size={16}
                  />
                }
                label="Joined"
                value={formatDate(
                  customer.createdAt
                )}
              />
            </div>
          </div>

          {/* ADDRESS */}

          {customer.address && (
            <div className="rounded-xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-900">
                Address
              </h3>

              <div className="mt-3 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                {customer.address
                  .address && (
                  <p>
                    {
                      customer.address
                        .address
                    }
                  </p>
                )}

                <p>
                  {[
                    customer.address
                      .city,
                    customer.address
                      .state,
                    customer.address
                      .postalCode,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>

                {customer.address
                  .country && (
                  <p>
                    {
                      customer.address
                        .country
                    }
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ACCOUNT STATUS */}

          <div className="rounded-xl bg-slate-50 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-slate-900">
                  Account status
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {active
                    ? "This customer can access their account."
                    : "This customer is currently disabled."}
                </p>
              </div>

              <CustomerStatus
                active={active}
              />
            </div>
          </div>

          {/* ACTIONS */}

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
              onClick={onToggle}
              className={`h-11 rounded-xl px-5 text-sm font-semibold transition ${
                active
                  ? "border border-red-200 text-red-600 hover:bg-red-50"
                  : "bg-slate-900 text-white hover:bg-slate-800"
              }`}
            >
              {active
                ? "Disable customer"
                : "Activate customer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================
   CUSTOMER DETAIL STAT
========================================== */

function CustomerDetailStat({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="flex items-center gap-2 text-slate-400">
        {icon}

        <span className="text-xs font-medium">
          {title}
        </span>
      </div>

      <p className="mt-2 text-lg font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

/* ==========================================
   INFO ROW
========================================== */

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
        {icon}

        {label}
      </div>

      <p className="mt-1 break-words text-sm font-semibold text-slate-700">
        {value}
      </p>
    </div>
  );
}

/* ==========================================
   HELPERS
========================================== */

function formatCurrency(
  amount: number
) {
  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency: "USD",
    }
  ).format(amount);
}

function formatDate(date: string) {
  if (!date) return "Unknown date";

  return new Intl.DateTimeFormat(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  ).format(new Date(date));
}

