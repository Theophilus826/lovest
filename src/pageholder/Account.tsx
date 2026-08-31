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
FaTruck,
FaUndoAlt,
FaHeadset,
FaShieldAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import AuthService from "../services/AuthService";

export default function Account() {
const navigate = useNavigate();

const user = AuthService.getUser();
const isLoggedIn = !!user;

// =====================================
// ACCOUNT MENU
// =====================================

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

// =====================================
// POLICIES & SUPPORT
// =====================================

const policyItems = [
{
title: "Shipping & Return Policy",
description:
"Learn about delivery, shipping timelines and product returns.",
icon: <FaTruck />,
path: "/policies/shipping&returns",
},
{
title: "Cancellation & Refund Policy",
description:
"Understand how order cancellations and refunds are handled.",
icon: <FaUndoAlt />,
path: "/policies/cancellation-refund",
},
{
title: "Contact Us",
description:
"Get in touch with our customer support team.",
icon: <FaHeadset />,
path: "/contact",
},
];

// =====================================
// HANDLE ACCOUNT MENU
// =====================================

const handleMenuClick = (path: string) => {
if (!isLoggedIn) {
navigate("/login");
return;
}


navigate(path);


};

// =====================================
// LOGOUT
// =====================================

const handleLogout = async () => {
try {
await AuthService.logout();
} catch (error) {
console.error("Logout failed:", error);
} finally {
navigate("/login");
}
};

// =====================================
// LOGIN
// =====================================

const handleLogin = () => {
navigate("/login");
};

return ( <div className="mx-auto w-full max-w-2xl px-4 py-6">

```
  {/* =====================================
      PROFILE CARD
  ===================================== */}

  <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 shadow">
    <div className="flex items-center gap-4 px-6 py-6 text-white">

      {/* AVATAR */}

      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/20 text-2xl">
        <FaUser />
      </div>

      {/* USER INFORMATION */}

      <div className="min-w-0">
        <h2 className="truncate text-xl font-bold">
          {user?.name || "Guest"}
        </h2>

        <p className="truncate text-sm text-orange-100">
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


  {/* =====================================
      ACCOUNT
  ===================================== */}

  <div className="mt-6">

    <h3 className="mb-3 px-1 text-sm font-bold uppercase tracking-wide text-gray-500">
      My Account
    </h3>

    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">

      {menuItems.map((item) => (
        <button
          key={item.title}
          type="button"
          onClick={() => handleMenuClick(item.path)}
          className="flex w-full items-center justify-between border-b border-gray-100 px-5 py-4 transition hover:bg-gray-50 last:border-b-0"
        >
          <div className="flex items-center gap-4">

            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
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

  </div>


  {/* =====================================
      POLICIES & SUPPORT
  ===================================== */}

  <div className="mt-8">

    <div className="mb-3 flex items-center gap-2 px-1">

      <FaShieldAlt className="text-orange-500" />

      <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">
        Policies & Support
      </h3>

    </div>


    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">

      {policyItems.map((item) => (
        <button
          key={item.title}
          type="button"
          onClick={() => navigate(item.path)}
          className="flex w-full items-center justify-between gap-4 border-b border-gray-100 px-5 py-4 text-left transition hover:bg-gray-50 last:border-b-0"
        >

          <div className="flex min-w-0 items-center gap-4">

            {/* ICON */}

            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
              {item.icon}
            </span>


            {/* TEXT */}

            <div className="min-w-0">

              <p className="font-semibold text-gray-900">
                {item.title}
              </p>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                {item.description}
              </p>

            </div>

          </div>


          <FaChevronRight className="shrink-0 text-gray-400" />

        </button>
      ))}

    </div>

  </div>


  {/* =====================================
      CONTACT INFORMATION
  ===================================== */}

  <div className="mt-6 rounded-2xl border border-orange-100 bg-orange-50 p-5">

    <div className="flex items-start gap-3">

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white">
        <FaHeadset />
      </div>

      <div>

        <h3 className="font-bold text-gray-900">
          Need help?
        </h3>

        <p className="mt-1 text-sm leading-6 text-gray-600">
          Our customer support team is available to help you with
          your orders, payments, delivery and other enquiries.
        </p>

        <button
          type="button"
          onClick={() => navigate("/contact")}
          className="mt-3 font-semibold text-orange-600 transition hover:text-orange-700"
        >
          Contact Customer Support →
        </button>

      </div>

    </div>

  </div>


  {/* =====================================
      LOGIN / LOGOUT
  ===================================== */}

  {isLoggedIn ? (

    <button
      type="button"
      onClick={handleLogout}
      className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 py-4 font-semibold text-white transition hover:bg-red-600"
    >
      <FaSignOutAlt />
      Logout
    </button>

  ) : (

    <button
      type="button"
      onClick={handleLogin}
      className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-4 font-semibold text-white transition hover:bg-orange-600"
    >
      <FaSignInAlt />
      Login
    </button>

  )}

</div>


);
}
