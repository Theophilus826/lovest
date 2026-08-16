import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaThLarge,
  FaShoppingCart,
  FaHeart,
  FaUser,
} from "react-icons/fa";

export default function BottomNav() {
  const base =
    "flex flex-col items-center justify-center flex-1 py-2 text-xs transition-colors duration-200";

  const active = "text-orange-500";
  const inactive = "text-gray-500 hover:text-orange-500";

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-md flex h-16 z-50">
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          `${base} ${isActive ? active : inactive}`
        }
      >
        <FaHome className="text-xl mb-1" />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/categories"
        className={({ isActive }) =>
          `${base} ${isActive ? active : inactive}`
        }
      >
        <FaThLarge className="text-xl mb-1" />
        <span>Categories</span>
      </NavLink>

      <NavLink
        to="/cart"
        className={({ isActive }) =>
          `${base} ${isActive ? active : inactive}`
        }
      >
        <FaShoppingCart className="text-xl mb-1" />
        <span>Cart</span>
      </NavLink>

      <NavLink
        to="/wishlist"
        className={({ isActive }) =>
          `${base} ${isActive ? active : inactive}`
        }
      >
        <FaHeart className="text-xl mb-1" />
        <span>Wishlist</span>
      </NavLink>

      <NavLink
        to="/account"
        className={({ isActive }) =>
          `${base} ${isActive ? active : inactive}`
        }
      >
        <FaUser className="text-xl mb-1" />
        <span>Account</span>
      </NavLink>
    </nav>
  );
}