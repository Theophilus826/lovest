import { useEffect, useMemo, useState } from "react";
import API from "../services/Api";

import {
  AlertCircle,
  Calendar,
  Check,
  ChevronDown,
  Clock,
  Copy,
  Edit3,
  Loader2,
  Percent,
  Plus,
  RefreshCw,
  Search,
  Tag,
  Trash2,
  X,
} from "lucide-react";

interface Discount {
  _id: string;
  code: string;
  description?: string;

  type: "percentage" | "fixed";
  value: number;

  minimumPurchase?: number;
  maxDiscount?: number;

  startDate?: string;
  endDate?: string;

  usageLimit?: number;
  usageCount?: number;

  active?: boolean;

  createdAt?: string;
  updatedAt?: string;
}

type StatusFilter =
  | "all"
  | "active"
  | "inactive"
  | "expired";

export default function AdminDiscounts() {
  const [discounts, setDiscounts] =
    useState<Discount[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");

  const [showModal, setShowModal] =
    useState(false);

  const [editingDiscount, setEditingDiscount] =
    useState<Discount | null>(null);

  // ==========================================
  // FETCH DISCOUNTS
  // ==========================================

  const fetchDiscounts = async (
    showRefresh = false
  ) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response =
        await API.get("/admin/discounts");

      console.log(
        "ADMIN DISCOUNTS:",
        response.data
      );

      const discountData =
        response.data?.data;

      setDiscounts(
        Array.isArray(discountData)
          ? discountData
          : []
      );
    } catch (error: any) {
      console.error(
        "FAILED TO LOAD DISCOUNTS:",
        error
      );

      console.error(
        "DISCOUNT ERROR RESPONSE:",
        error?.response?.data
      );

      setDiscounts([]);

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch discounts"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  // ==========================================
  // STATUS
  // ==========================================

  const getStatus = (
    discount: Discount
  ): "active" | "inactive" | "expired" => {
    if (discount.active === false) {
      return "inactive";
    }

    if (
      discount.endDate &&
      new Date(discount.endDate) < new Date()
    ) {
      return "expired";
    }

    return "active";
  };

  // ==========================================
  // STATISTICS
  // ==========================================

  const statistics = useMemo(() => {
    const active = discounts.filter(
      (discount) =>
        getStatus(discount) === "active"
    ).length;

    const expired = discounts.filter(
      (discount) =>
        getStatus(discount) === "expired"
    ).length;

    const inactive = discounts.filter(
      (discount) =>
        getStatus(discount) === "inactive"
    ).length;

    const totalUsage =
      discounts.reduce(
        (sum, discount) =>
          sum +
          Number(
            discount.usageCount || 0
          ),
        0
      );

    return {
      total: discounts.length,
      active,
      expired,
      inactive,
      totalUsage,
    };
  }, [discounts]);

  // ==========================================
  // FILTER
  // ==========================================

  const filteredDiscounts =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      return discounts.filter(
        (discount) => {
          const matchesSearch =
            !query ||
            discount.code
              .toLowerCase()
              .includes(query) ||
            discount.description
              ?.toLowerCase()
              .includes(query);

          const status =
            getStatus(discount);

          const matchesStatus =
            statusFilter === "all" ||
            status === statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      discounts,
      search,
      statusFilter,
    ]);

  // ==========================================
  // DELETE
  // ==========================================

  const deleteDiscount = async (
    discount: Discount
  ) => {
    const confirmed =
      window.confirm(
        `Delete discount "${discount.code}"?`
      );

    if (!confirmed) return;

    try {
      setError("");

      await API.delete(
        `/admin/discounts/${discount._id}`
      );

      setDiscounts(
        (current) =>
          current.filter(
            (item) =>
              item._id !== discount._id
          )
      );
    } catch (error: any) {
      console.error(
        "DELETE DISCOUNT ERROR:",
        error
      );

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to delete discount"
      );
    }
  };

  // ==========================================
  // TOGGLE
  // ==========================================

  const toggleDiscount = async (
    discount: Discount
  ) => {
    if (
      getStatus(discount) === "expired"
    ) {
      return;
    }

    try {
      setError("");

      const newActive =
        discount.active === false;

      const response =
        await API.patch(
          `/admin/discounts/${discount._id}/status`,
          {
            active: newActive,
          }
        );

      const updatedDiscount =
        response.data?.data;

      setDiscounts(
        (current) =>
          current.map((item) =>
            item._id === discount._id
              ? updatedDiscount || {
                  ...item,
                  active: newActive,
                }
              : item
          )
      );
    } catch (error: any) {
      console.error(
        "TOGGLE DISCOUNT ERROR:",
        error
      );

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update discount"
      );
    }
  };

  // ==========================================
  // COPY
  // ==========================================

  const copyCode = async (
    code: string
  ) => {
    try {
      await navigator.clipboard.writeText(
        code
      );
    } catch {
      setError(
        "Unable to copy discount code"
      );
    }
  };

  // ==========================================
  // CREATE
  // ==========================================

  const openCreate = () => {
    setEditingDiscount(null);
    setShowModal(true);
    setError("");
  };

  // ==========================================
  // EDIT
  // ==========================================

  const openEdit = (
    discount: Discount
  ) => {
    setEditingDiscount(discount);
    setShowModal(true);
    setError("");
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Tag size={16} />

            <span>Marketing</span>

            <span>/</span>

            <span className="text-slate-900">
              Discounts
            </span>
          </div>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            Discounts
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Create and manage promotional
            discount codes.
          </p>
        </div>

        <div className="flex gap-3">

          <button
            type="button"
            onClick={() =>
              fetchDiscounts(true)
            }
            disabled={refreshing}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
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

          <button
            type="button"
            onClick={openCreate}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            <Plus size={18} />

            Create discount
          </button>

        </div>
      </div>

      {/* ERROR */}

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <AlertCircle size={18} />

          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            className="ml-auto"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* STATISTICS */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          title="Total discounts"
          value={statistics.total}
          description="All discount codes"
          icon={<Tag size={20} />}
        />

        <StatCard
          title="Active"
          value={statistics.active}
          description="Currently available"
          icon={<Check size={20} />}
        />

        <StatCard
          title="Expired"
          value={statistics.expired}
          description="Past their end date"
          icon={<Clock size={20} />}
        />

        <StatCard
          title="Total usage"
          value={statistics.totalUsage}
          description="Times discounts used"
          icon={<Percent size={20} />}
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
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search discount codes..."
              className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-4 text-sm outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            />

          </div>

          <div className="relative">

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target
                    .value as StatusFilter
                )
              }
              className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-10 text-sm font-medium text-slate-700 outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100 sm:w-48"
            >
              <option value="all">
                All discounts
              </option>

              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>

              <option value="expired">
                Expired
              </option>
            </select>

            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

          </div>

        </div>
      </div>

      {/* TABLE */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-100 px-6 py-5">

          <h2 className="font-semibold text-slate-900">
            Discount codes
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {filteredDiscounts.length} discount
            {filteredDiscounts.length === 1
              ? ""
              : "s"} found.
          </p>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1000px]">

            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Code
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Discount
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Minimum
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Usage
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Validity
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
                      Loading discounts...
                    </p>
                  </td>
                </tr>

              ) : filteredDiscounts.length === 0 ? (

                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-14 text-center"
                  >
                    <Tag
                      size={32}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 text-sm font-semibold text-slate-700">
                      No discounts found
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Create a discount or
                      change your filters.
                    </p>
                  </td>
                </tr>

              ) : (

                filteredDiscounts.map(
                  (discount) => {

                    const status =
                      getStatus(discount);

                    return (
                      <tr
                        key={discount._id}
                        className="transition hover:bg-slate-50"
                      >

                        {/* CODE */}

                        <td className="px-6 py-4">

                          <div className="flex items-center gap-2">

                            <span className="rounded-lg bg-slate-100 px-3 py-2 font-mono text-sm font-bold tracking-wide text-slate-800">
                              {discount.code}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                copyCode(
                                  discount.code
                                )
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                              title="Copy code"
                            >
                              <Copy size={14} />
                            </button>

                          </div>

                          {discount.description && (
                            <p className="mt-2 max-w-[230px] truncate text-xs text-slate-400">
                              {discount.description}
                            </p>
                          )}

                        </td>

                        {/* DISCOUNT */}

                        <td className="px-6 py-4">
                          <span className="font-semibold text-slate-900">
                            {formatDiscount(
                              discount
                            )}
                          </span>
                        </td>

                        {/* MINIMUM */}

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {discount.minimumPurchase
                            ? formatCurrency(
                                discount.minimumPurchase
                              )
                            : "None"}
                        </td>

                        {/* USAGE */}

                        <td className="px-6 py-4">

                          <div className="min-w-[120px]">

                            <div className="flex items-center justify-between text-xs">

                              <span className="font-semibold text-slate-700">
                                {discount.usageCount ||
                                  0}
                              </span>

                              <span className="text-slate-400">
                                {discount.usageLimit ||
                                  "∞"}
                              </span>

                            </div>

                            {discount.usageLimit && (
                              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">

                                <div
                                  className="h-full rounded-full bg-slate-800"
                                  style={{
                                    width: `${Math.min(
                                      100,
                                      ((discount.usageCount ||
                                        0) /
                                        discount.usageLimit) *
                                        100
                                    )}%`,
                                  }}
                                />

                              </div>
                            )}

                          </div>

                        </td>

                        {/* VALIDITY */}

                        <td className="px-6 py-4">

                          <div className="flex items-center gap-2">

                            <Calendar
                              size={15}
                              className="text-slate-400"
                            />

                            <div>

                              <p className="text-xs font-medium text-slate-700">
                                {discount.startDate
                                  ? formatDate(
                                      discount.startDate
                                    )
                                  : "No start"}
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                to{" "}
                                {discount.endDate
                                  ? formatDate(
                                      discount.endDate
                                    )
                                  : "No expiry"}
                              </p>

                            </div>

                          </div>

                        </td>

                        {/* STATUS */}

                        <td className="px-6 py-4">
                          <StatusBadge
                            status={status}
                          />
                        </td>

                        {/* ACTIONS */}

                        <td className="px-6 py-4">

                          <div className="flex justify-end gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                toggleDiscount(
                                  discount
                                )
                              }
                              disabled={
                                status ===
                                "expired"
                              }
                              className={`inline-flex h-9 items-center rounded-lg border px-3 text-xs font-semibold transition ${
                                discount.active ===
                                false
                                  ? "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                  : "border-amber-200 text-amber-700 hover:bg-amber-50"
                              }`}
                            >
                              {discount.active ===
                              false
                                ? "Activate"
                                : "Deactivate"}
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                openEdit(
                                  discount
                                )
                              }
                              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                            >
                              <Edit3 size={14} />
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                deleteDiscount(
                                  discount
                                )
                              }
                              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-red-200 px-3 text-xs font-semibold text-red-600 hover:bg-red-50"
                            >
                              <Trash2 size={14} />
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

      {/* MODAL */}

      {showModal && (
        <DiscountModal
          discount={editingDiscount}
          onClose={() =>
            setShowModal(false)
          }
          onSaved={() => {
            setShowModal(false);
            fetchDiscounts();
          }}
          onError={(message) =>
            setError(message)
          }
        />
      )}

    </div>
  );
}

/* ==========================================
   STAT CARD
========================================== */

function StatCard({
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

          <p className="mt-2 text-2xl font-bold text-slate-900">
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
   STATUS BADGE
========================================== */

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const config: Record<
    string,
    {
      className: string;
      icon: React.ReactNode;
    }
  > = {
    active: {
      className:
        "bg-emerald-50 text-emerald-700",
      icon: <Check size={14} />,
    },

    inactive: {
      className:
        "bg-slate-100 text-slate-600",
      icon: <X size={14} />,
    },

    expired: {
      className:
        "bg-red-50 text-red-700",
      icon: <Clock size={14} />,
    },
  };

  const current =
    config[status] ||
    config.inactive;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${current.className}`}
    >
      {current.icon}

      {capitalize(status)}
    </span>
  );
}

/* ==========================================
   DISCOUNT MODAL
========================================== */

function DiscountModal({
  discount,
  onClose,
  onSaved,
  onError,
}: {
  discount: Discount | null;
  onClose: () => void;
  onSaved: () => void;
  onError: (message: string) => void;
}) {
  const [form, setForm] = useState({
    code: discount?.code || "",

    description:
      discount?.description || "",

    type:
      discount?.type || "percentage",

    value:
      discount?.value !== undefined
        ? String(discount.value)
        : "",

    minimumPurchase:
      discount?.minimumPurchase !==
      undefined
        ? String(
            discount.minimumPurchase
          )
        : "",

    maxDiscount:
      discount?.maxDiscount !==
      undefined
        ? String(
            discount.maxDiscount
          )
        : "",

    startDate:
      discount?.startDate
        ? formatInputDate(
            discount.startDate
          )
        : "",

    endDate:
      discount?.endDate
        ? formatInputDate(
            discount.endDate
          )
        : "",

    usageLimit:
      discount?.usageLimit !==
      undefined
        ? String(
            discount.usageLimit
          )
        : "",

    active:
      discount?.active !== false,
  });

  const [saving, setSaving] =
    useState(false);

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    onError("");

    if (!form.code.trim()) {
      onError(
        "Discount code is required."
      );
      return;
    }

    if (!form.value) {
      onError(
        "Discount value is required."
      );
      return;
    }

    const value = Number(form.value);

    if (value <= 0) {
      onError(
        "Discount value must be greater than 0."
      );
      return;
    }

    if (
      form.type === "percentage" &&
      value > 100
    ) {
      onError(
        "Percentage discount cannot exceed 100%."
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        code: form.code
          .trim()
          .toUpperCase(),

        description:
          form.description.trim(),

        type: form.type,

        value,

        minimumPurchase:
          form.minimumPurchase
            ? Number(
                form.minimumPurchase
              )
            : 0,

        maxDiscount:
          form.type === "percentage" &&
          form.maxDiscount
            ? Number(
                form.maxDiscount
              )
            : undefined,

        startDate:
          form.startDate || undefined,

        endDate:
          form.endDate || undefined,

        usageLimit:
          form.usageLimit
            ? Number(
                form.usageLimit
              )
            : undefined,

        active: form.active,
      };

      let response;

      if (discount) {
        response =
          await API.put(
            `/admin/discounts/${discount._id}`,
            payload
          );
      } else {
        response =
          await API.post(
            "/admin/discounts",
            payload
          );
      }

      console.log(
        "DISCOUNT SAVED:",
        response.data
      );

      onSaved();

    } catch (error: any) {
      console.error(
        "SAVE DISCOUNT ERROR:",
        error
      );

      console.error(
        "SAVE ERROR RESPONSE:",
        error?.response?.data
      );

      onError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to save discount"
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // UPDATE FORM
  // ==========================================

  const updateField = (
    field: keyof typeof form,
    value: string | boolean
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">

      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

        {/* HEADER */}

        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5">

          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {discount
                ? "Edit discount"
                : "Create discount"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Configure your promotional
              discount code.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>

        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 p-6"
        >

          {/* CODE */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Discount code
            </label>

            <input
              value={form.code}
              onChange={(event) =>
                updateField(
                  "code",
                  event.target.value
                )
              }
              placeholder="SUMMER20"
              className="h-11 w-full rounded-xl border border-slate-200 px-4 font-mono text-sm font-semibold uppercase outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
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
                updateField(
                  "description",
                  event.target.value
                )
              }
              rows={3}
              placeholder="20% off summer collection"
              className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            />
          </div>

          {/* TYPE + VALUE */}

          <div className="grid gap-4 sm:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Discount type
              </label>

              <select
                value={form.type}
                onChange={(event) =>
                  updateField(
                    "type",
                    event.target.value
                  )
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none"
              >
                <option value="percentage">
                  Percentage
                </option>

                <option value="fixed">
                  Fixed amount
                </option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Value
              </label>

              <div className="relative">

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.value}
                  onChange={(event) =>
                    updateField(
                      "value",
                      event.target.value
                    )
                  }
                  placeholder={
                    form.type ===
                    "percentage"
                      ? "20"
                      : "1000"
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 px-4 pr-12 text-sm outline-none"
                />

                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                  {form.type ===
                  "percentage"
                    ? "%"
                    : "₦"}
                </span>

              </div>
            </div>

          </div>

          {/* MIN + MAX */}

          <div className="grid gap-4 sm:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Minimum purchase
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={
                  form.minimumPurchase
                }
                onChange={(event) =>
                  updateField(
                    "minimumPurchase",
                    event.target.value
                  )
                }
                placeholder="0"
                className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Maximum discount
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={
                  form.maxDiscount
                }
                onChange={(event) =>
                  updateField(
                    "maxDiscount",
                    event.target.value
                  )
                }
                placeholder="Optional"
                disabled={
                  form.type === "fixed"
                }
                className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none disabled:bg-slate-50"
              />
            </div>

          </div>

          {/* DATES */}

          <div className="grid gap-4 sm:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Start date
              </label>

              <input
                type="date"
                value={form.startDate}
                onChange={(event) =>
                  updateField(
                    "startDate",
                    event.target.value
                  )
                }
                className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                End date
              </label>

              <input
                type="date"
                value={form.endDate}
                onChange={(event) =>
                  updateField(
                    "endDate",
                    event.target.value
                  )
                }
                className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none"
              />
            </div>

          </div>

          {/* USAGE */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Usage limit
            </label>

            <input
              type="number"
              min="1"
              value={form.usageLimit}
              onChange={(event) =>
                updateField(
                  "usageLimit",
                  event.target.value
                )
              }
              placeholder="Unlimited"
              className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none"
            />

            <p className="mt-1.5 text-xs text-slate-400">
              Leave empty for unlimited
              usage.
            </p>
          </div>

          {/* ACTIVE */}

          <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 p-4">

            <div>
              <p className="text-sm font-semibold text-slate-800">
                Discount active
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Allow customers to use
                this discount.
              </p>
            </div>

            <input
              type="checkbox"
              checked={form.active}
              onChange={(event) =>
                updateField(
                  "active",
                  event.target.checked
                )
              }
              className="h-5 w-5 rounded border-slate-300"
            />

          </label>

          {/* ACTIONS */}

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">

            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >

              {saving ? (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <Check size={17} />
              )}

              {discount
                ? "Save changes"
                : "Create discount"}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

/* ==========================================
   HELPERS
========================================== */

function formatDiscount(
  discount: Discount
) {
  if (
    discount.type === "percentage"
  ) {
    return `${discount.value}% OFF`;
  }

  return `${formatCurrency(
    discount.value
  )} OFF`;
}

function formatCurrency(
  value: number
) {
  return new Intl.NumberFormat(
    "en-NG",
    {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 2,
    }
  ).format(value);
}

function formatDate(
  date: string
) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  ).format(new Date(date));
}

function formatInputDate(
  date: string
) {
  const parsed = new Date(date);

  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return "";
  }

  const year =
    parsed.getFullYear();

  const month = String(
    parsed.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    parsed.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function capitalize(
  value: string
) {
  if (!value) return "";

  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
}