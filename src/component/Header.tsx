
import { FaArrowLeft, FaBell, FaShoppingCart } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";

import SearchBar from "./SearchBar";
import { useSearch } from "../context/SearchContext";
import { useCart } from "../context/CartContext";
import { useNotifications } from "../context/NotificationContext";
import AuthService from "../services/AuthService";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  const { search, setSearch } = useSearch();
  const { totalItems } = useCart();
  const { unreadCount } = useNotifications();

  const showBack = location.pathname !== "/";

  const isAuthenticated = AuthService.isAuthenticated();
  const isAdmin = AuthService.isAdmin();

  return (
    <header className="flex items-center gap-3 border-b bg-white px-4 py-3">
      {/* Logo / Back Button */}
      {showBack ? (
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-100"
          aria-label="Go back"
        >
          <FaArrowLeft />
        </button>
      ) : isAdmin ? (
        /*
         * ADMIN:
         * Clicking Lovest opens the admin dashboard.
         */
        <Link
          to="/admin"
          className="shrink-0 text-lg font-bold text-orange-500 transition hover:text-orange-600"
          title="Admin Dashboard"
        >
          Lovest
        </Link>
      ) : (
        /*
         * NORMAL USER:
         * Lovest is just the normal logo.
         */
        <div className="shrink-0 text-lg font-bold text-orange-500">
          Lovest
        </div>
      )}

      {/* Search */}
      <div className="min-w-0 flex-1">
        <SearchBar
          value={search}
          onChange={setSearch}
        />
      </div>

      {/* Cart */}
      <Link
        to="/cart"
        className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-600 transition hover:bg-orange-50 hover:text-orange-500"
        aria-label="Shopping cart"
      >
        <FaShoppingCart className="text-lg" />

        {totalItems > 0 && (
          <span className="absolute right-0.5 top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white">
            {totalItems > 99 ? "99+" : totalItems}
          </span>
        )}
      </Link>

      {/* Notifications */}
      <button
        type="button"
        onClick={() => {
          if (isAuthenticated) {
            navigate("/notifications");
          }
        }}
        disabled={!isAuthenticated}
        className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition ${
          isAuthenticated
            ? "text-gray-600 hover:bg-gray-100"
            : "cursor-not-allowed text-gray-300 opacity-50"
        }`}
        aria-label={
          isAuthenticated
            ? "Notifications"
            : "Please log in to view notifications"
        }
        title={
          isAuthenticated
            ? "Notifications"
            : "Login required"
        }
      >
        <FaBell className="text-xl" />

        {isAuthenticated && (
          <>
            <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-red-500" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] font-bold text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </>
        )}
      </button>
    </header>
  );
}

