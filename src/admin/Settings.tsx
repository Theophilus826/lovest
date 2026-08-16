import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Search,
  Shield,
  ShieldCheck,
  ShieldOff,
  User,
  Users,
  X,
} from "lucide-react";

import API from "../services/Api";

// ==========================================
// TYPES
// ==========================================

type UserRole = "user" | "admin";

interface UserAccount {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string | null;

  // Backend source of truth
  isAdmin?: boolean;

  // UI-friendly role
  role?: UserRole;

  active?: boolean;
  online?: boolean;
  isVerified?: boolean;

  createdAt?: string;
  updatedAt?: string;
}

// ==========================================
// COMPONENT
// ==========================================

export default function AdminSettings() {
  const [users, setUsers] = useState<UserAccount[]>([]);

  const [loading, setLoading] = useState(true);

  const [updating, setUpdating] = useState<string | null>(null);

  const [search, setSearch] = useState("");

  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // ==========================================
  // CURRENT USER
  // ==========================================

  const currentUserId = localStorage.getItem("userId");

  // ==========================================
  // FETCH USERS
  // ==========================================

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/admin/users");

      console.log("ADMIN USERS RESPONSE:", response.data);

      const data = response.data;

      const fetchedUsers = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.users)
            ? data.users
            : [];

      setUsers(fetchedUsers);
    } catch (err: any) {
      console.error("Failed to fetch users:", err);

      setError(err?.response?.data?.message || "Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOAD USERS
  // ==========================================

  useEffect(() => {
    fetchUsers();
  }, []);

  // ==========================================
  // SEARCH
  // ==========================================

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return users;
    }

    return users.filter((user) => {
      const name = user.name?.toLowerCase() || "";

      const email = user.email?.toLowerCase() || "";

      const phone = user.phone?.toLowerCase() || "";

      return (
        name.includes(query) || email.includes(query) || phone.includes(query)
      );
    });
  }, [users, search]);

  // ==========================================
  // ROLE HELPER
  // ==========================================

  const isUserAdmin = (user: UserAccount) => {
    return user.isAdmin === true || user.role === "admin";
  };

  // ==========================================
  // STATISTICS
  // ==========================================

  const totalUsers = users.length;

  const totalAdmins = users.filter(isUserAdmin).length;

  const normalUsers = totalUsers - totalAdmins;

  // ==========================================
  // CHANGE ROLE
  // ==========================================

  const changeRole = async (user: UserAccount, role: UserRole) => {
    // Never allow an admin to change themselves
    if (user._id === currentUserId) {
      setError("You cannot change your own administrator role.");

      setSelectedUser(null);

      return;
    }

    try {
      setUpdating(user._id);

      setError("");
      setSuccess("");

      /*
       * API automatically attaches:
       *
       * Authorization: Bearer <token>
       */

      const response = await API.patch(`/admin/users/${user._id}/role`, {
        role,
      });

      const responseData = response.data;

      /*
       * Backend may return:
       *
       * { user: {...} }
       * { data: {...} }
       * {...}
       */

      const updatedUser = responseData?.user || responseData?.data || null;

      const newIsAdmin = role === "admin";

      setUsers((currentUsers) =>
        currentUsers.map((item) => {
          if (item._id !== user._id) {
            return item;
          }

          return {
            ...item,
            ...(updatedUser || {}),
            role,
            isAdmin: newIsAdmin,
          };
        }),
      );

      const displayName = user.name || user.email || "User";

      setSuccess(
        role === "admin"
          ? `${displayName} is now an admin.`
          : `${displayName} is no longer an admin.`,
      );

      setSelectedUser(null);
    } catch (err: any) {
      console.error("Failed to update user role:", err);

      setError(err?.response?.data?.message || "Failed to update user role.");
    } finally {
      setUpdating(null);
    }
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="space-y-6">
      {/* =====================================
          HEADER
      ====================================== */}

      <div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Shield size={16} />

          <span>Administration</span>

          <span>/</span>

          <span className="text-slate-900">Settings</span>
        </div>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
          Admin Settings
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage administrator access and user permissions.
        </p>
      </div>

      {/* =====================================
          ALERTS
      ====================================== */}

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <AlertCircle size={18} className="shrink-0" />

          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition hover:bg-red-100"
            aria-label="Close error"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 size={18} className="shrink-0" />

          <span>{success}</span>

          <button
            type="button"
            onClick={() => setSuccess("")}
            className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition hover:bg-emerald-100"
            aria-label="Close success message"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* =====================================
          STATISTICS
      ====================================== */}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Total users"
          value={totalUsers}
          description="Registered accounts"
          icon={<Users size={20} />}
        />

        <StatCard
          title="Administrators"
          value={totalAdmins}
          description="Users with admin access"
          icon={<ShieldCheck size={20} />}
        />

        <StatCard
          title="Customers"
          value={normalUsers}
          description="Standard user accounts"
          icon={<User size={20} />}
        />
      </div>

      {/* =====================================
          USER MANAGEMENT
      ====================================== */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* HEADER */}

        <div className="border-b border-slate-100 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">User Management</h2>

              <p className="mt-1 text-sm text-slate-500">
                Give trusted users administrator access to your store.
              </p>
            </div>

            {/* SEARCH */}

            <div className="relative w-full lg:w-80">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search users..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
              />
            </div>
          </div>
        </div>

        {/* TABLE */}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  User
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Role
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Joined
                </th>

                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {/* LOADING */}

              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-14 text-center">
                    <Loader2
                      size={26}
                      className="mx-auto animate-spin text-slate-400"
                    />

                    <p className="mt-3 text-sm text-slate-500">
                      Loading users...
                    </p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                /* EMPTY */

                <tr>
                  <td colSpan={5} className="px-6 py-14 text-center">
                    <Users size={34} className="mx-auto text-slate-300" />

                    <p className="mt-3 text-sm font-semibold text-slate-700">
                      No users found
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {search
                        ? "Try changing your search."
                        : "No registered users yet."}
                    </p>
                  </td>
                </tr>
              ) : (
                /* USERS */

                filteredUsers.map((user) => {
                  const admin = isUserAdmin(user);

                  const current = user._id === currentUserId;

                  const updatingUser = updating === user._id;

                  return (
                    <tr key={user._id} className="transition hover:bg-slate-50">
                      {/* USER */}

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-sm font-bold text-slate-700">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.name || "User"}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              getInitials(user.name || user.email || "User")
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-800">
                              {user.name || "Unnamed user"}

                              {current && (
                                <span className="ml-2 inline-flex rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-600">
                                  You
                                </span>
                              )}
                            </p>

                            <p className="mt-1 truncate text-xs text-slate-400">
                              {user.email ||
                                user.phone ||
                                "No contact information"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* ROLE */}

                      <td className="px-6 py-4">
                        {admin ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700">
                            <ShieldCheck size={14} />
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                            <User size={14} />
                            Customer
                          </span>
                        )}
                      </td>

                      {/* STATUS */}

                      <td className="px-6 py-4">
                        {user.active === false ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">
                            <ShieldOff size={14} />
                            Disabled
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                            <CheckCircle2 size={14} />
                            Active
                          </span>
                        )}
                      </td>

                      {/* JOINED */}

                      <td className="px-6 py-4 text-sm text-slate-500">
                        {user.createdAt ? formatDate(user.createdAt) : "—"}
                      </td>

                      {/* ACTION */}

                      <td className="px-6 py-4 text-right">
                        {current ? (
                          <span className="text-xs font-medium text-slate-400">
                            Current account
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={updatingUser}
                            onClick={() => setSelectedUser(user)}
                            className={
                              admin
                                ? "inline-flex h-9 items-center gap-2 rounded-lg border border-red-200 px-3 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                : "inline-flex h-9 items-center gap-2 rounded-lg bg-slate-900 px-3 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                            }
                          >
                            {updatingUser ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : admin ? (
                              <ShieldOff size={14} />
                            ) : (
                              <ShieldCheck size={14} />
                            )}

                            {admin ? "Remove admin" : "Make admin"}
                          </button>
                        )}
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
          SECURITY NOTICE
      ====================================== */}

      <div className="flex gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-5">
        <Shield size={21} className="mt-0.5 shrink-0 text-amber-600" />

        <div>
          <h3 className="text-sm font-semibold text-amber-900">
            Administrator access
          </h3>

          <p className="mt-1 text-sm leading-6 text-amber-800">
            Only give administrator access to trusted users. Administrators can
            manage products, orders, customers, payments and other store
            settings.
          </p>
        </div>
      </div>

      {/* =====================================
          CONFIRM MODAL
      ====================================== */}

      {selectedUser && (
        <RoleConfirmModal
          user={selectedUser}
          loading={updating === selectedUser._id}
          onClose={() => setSelectedUser(null)}
          onConfirm={(role) => changeRole(selectedUser, role)}
        />
      )}
    </div>
  );
}

// ==========================================
// STAT CARD
// ==========================================

function StatCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: number;
  description: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          {icon}
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-400">{description}</p>
    </div>
  );
}

// ==========================================
// ROLE CONFIRM MODAL
// ==========================================

function RoleConfirmModal({
  user,
  loading,
  onClose,
  onConfirm,
}: {
  user: UserAccount;
  loading: boolean;
  onClose: () => void;
  onConfirm: (role: UserRole) => void;
}) {
  const isAdmin = user.isAdmin === true || user.role === "admin";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="font-semibold text-slate-900">
              {isAdmin ? "Remove admin access?" : "Make user an admin?"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Confirm this permission change.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 disabled:opacity-50"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* BODY */}

        <div className="p-6">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white font-bold text-slate-700 shadow-sm">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name || "User"}
                  className="h-full w-full object-cover"
                />
              ) : (
                getInitials(user.name || user.email || "User")
              )}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {user.name || "Unnamed user"}
              </p>

              <p className="truncate text-xs text-slate-500">
                {user.email || user.phone || "No contact information"}
              </p>
            </div>
          </div>

          <p className="mt-5 text-sm leading-6 text-slate-600">
            {isAdmin
              ? "This user will lose access to the admin dashboard and administrator-only operations."
              : "This user will gain access to the admin dashboard and administrator-only operations."}
          </p>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="h-11 flex-1 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => onConfirm(isAdmin ? "user" : "admin")}
              disabled={loading}
              className={
                isAdmin
                  ? "h-11 flex-1 rounded-xl bg-red-600 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                  : "h-11 flex-1 rounded-xl bg-slate-900 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
              }
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Updating...
                </span>
              ) : isAdmin ? (
                "Remove admin"
              ) : (
                "Make admin"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// HELPERS
// ==========================================

function getInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return initials || "U";
}

function formatDate(date: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(parsedDate);
}
