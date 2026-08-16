
import {
  FaUser,
  FaShoppingBag,
  FaHeart,
  FaMapMarkerAlt,
  FaCreditCard,
  FaCog,
  FaSignOutAlt,
  FaSignInAlt,
  FaChevronRight,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import AuthService from "../services/AuthService";

export default function Account() {
  const navigate = useNavigate();

  const user = AuthService.getUser();
  const isLoggedIn = !!user;

  const menuItems = [
    {
      title: "My Orders",
      icon: <FaShoppingBag />,
      path: "/orders",
    },
    {
      title: "Wishlist",
      icon: <FaHeart />,
      path: "/wishlist",
    },
    {
      title: "Delivery Address",
      icon: <FaMapMarkerAlt />,
      path: "/address",
    },
    {
      title: "Payment Methods",
      icon: <FaCreditCard />,
      path: "/payment",
    },
    {
      title: "Settings",
      icon: <FaCog />,
      path: "/settings",
    },
  ];

  const handleMenuClick = (path: string) => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    navigate(path);
  };

  const handleLogout = async () => {
    try {
      await AuthService.logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      navigate("/login");
    }
  };

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      {/* Profile Card */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 shadow">
        <div className="flex items-center gap-4 px-6 py-6 text-white">
          {/* Avatar */}
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/20 text-2xl">
            <FaUser />
          </div>

          {/* User Information */}
          <div>
            <h2 className="text-xl font-bold">
              {user?.name || "Guest"}
            </h2>

            <p className="text-sm text-orange-100">
              {user?.email || "Not logged in"}
            </p>

            {!isLoggedIn && (
              <button
                type="button"
                onClick={handleLogin}
                className="mt-2 text-sm font-semibold text-white underline underline-offset-2"
              >
                Login to your account
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="mt-4 overflow-hidden rounded-xl bg-white shadow">
        {menuItems.map((item) => (
          <button
            key={item.title}
            type="button"
            onClick={() => handleMenuClick(item.path)}
            className="flex w-full items-center justify-between border-b border-gray-100 px-5 py-4 transition hover:bg-gray-50 last:border-b-0"
          >
            <div className="flex items-center gap-4">
              <span className="text-orange-500">
                {item.icon}
              </span>

              <span className="font-medium text-gray-800">
                {item.title}
              </span>
            </div>

            <FaChevronRight className="text-gray-400" />
          </button>
        ))}
      </div>

      {/* Login / Logout */}
      {isLoggedIn ? (
        <button
          type="button"
          onClick={handleLogout}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 py-4 font-semibold text-white transition hover:bg-red-600"
        >
          <FaSignOutAlt />
          Logout
        </button>
      ) : (
        <button
          type="button"
          onClick={handleLogin}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-4 font-semibold text-white transition hover:bg-orange-600"
        >
          <FaSignInAlt />
          Login
        </button>
      )}
    </div>
  );
}

