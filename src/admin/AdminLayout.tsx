import { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import API from "../services/Api";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  CreditCard,
  BarChart3,
  Tags,
  Image,
  Warehouse,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  ChevronLeft,
  ChevronDown,
  LogOut,
  UserCircle,
  Truck,
  TicketPercent,
  MessageSquare,
  ShieldCheck,
  HelpCircle,
  CheckCircle,
  PackageCheck,
} from "lucide-react";


// =========================================================
// TYPES
// =========================================================

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}


// =========================================================
// NAVIGATION
// =========================================================

const navigation: NavSection[] = [
  {
    title: "Overview",
    items: [
      {
        label: "Dashboard",
        path: "/admin",
        icon: LayoutDashboard,
      },
      {
        label: "Analytics",
        path: "/admin/analytics",
        icon: BarChart3,
      },
    ],
  },

  {
    title: "Store",
    items: [
      {
        label: "Products",
        path: "/admin/products",
        icon: Package,
      },
      {
        label: "Categories",
        path: "/admin/categories",
        icon: Tags,
      },
      {
        label: "Inventory",
        path: "/admin/inventory",
        icon: Warehouse,
      },
    ],
  },

  {
    title: "Orders",
    items: [
      {
        label: "Orders",
        path: "/admin/orders",
        icon: ShoppingBag,
      },
      {
        label: "Purchases",
        path: "/admin/purchases",
        icon: Package,
      },
      {
        label: "Receiving",
        path: "/admin/purchases/receiving",
        icon: CreditCard,
      },
      {
        label: "Shipping",
        path: "/admin/shipping",
        icon: Truck,
      },
      {
        label: "Delivered",
        path: "/admin/orders/delivered",
        icon: PackageCheck,
      },
      {
        label: "Receipt Confirmations",
        path: "/admin/orders/confirmations",
        icon: CheckCircle,
      },
    ],
  },

  {
    title: "Customers",
    items: [
      {
        label: "Customers",
        path: "/admin/customers",
        icon: Users,
      },
      {
        label: "Reviews",
        path: "/admin/reviews",
        icon: MessageSquare,
      },
    ],
  },

  {
    title: "Marketing",
    items: [
      {
        label: "Discounts",
        path: "/admin/discounts",
        icon: TicketPercent,
      },
        {
          label: "Banners",
          path: "/admin/banner",
          icon: Image,
        },
    ],
  },

  {
    title: "Finance",
    items: [
      {
        label: "Payments",
        path: "/admin/payments",
        icon: CreditCard,
      },
    ],
  },

  {
    title: "System",
    items: [
      {
        label: "Settings",
        path: "/admin/settings",
        icon: Settings,
      },
    ],
  },
];


// =========================================================
// PAGE TITLES
// =========================================================

const pageTitles: Record<string, string> = {
  "/admin": "Dashboard",

  "/admin/analytics": "Analytics",

  "/admin/products": "Products",

  "/admin/categories": "Categories",

  "/admin/inventory": "Inventory",

  "/admin/orders": "Orders",

  "/admin/orders/delivered": "Delivered Orders",

  "/admin/orders/confirmations": "Receipt Confirmations",

  "/admin/shipping": "Shipping",

  "/admin/customers": "Customers",

  "/admin/reviews": "Reviews",

  "/admin/discounts": "Discounts",

  "/admin/payments": "Payments",
  "/admin/purchases": "Purchase Orders",
  "/admin/purchases/receiving": "Receiving",

  "/admin/banner": "Banners",

  "/admin/settings": "Settings",

};


// =========================================================
// COMPONENT
// =========================================================

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const [profileOpen, setProfileOpen] =
    useState(false);

  const [notificationsOpen, setNotificationsOpen] =
    useState(false);

  const location = useLocation();

  const [pendingPurchases, setPendingPurchases] = useState(0);

  useEffect(() => {
    let mounted = true;

    const loadPending = async () => {
      try {
        const resp = await API.get("/purchases");
        const data = resp.data?.data || [];

        const count = Array.isArray(data)
          ? data.filter((p: any) =>
              [
                "PENDING_PAYMENT",
                "PENDING_LOAN_APPROVAL",
                "CONTRIBUTION_ACTIVE",
              ].includes(p.status),
            ).length
          : 0;

        if (mounted) setPendingPurchases(count);
      } catch (e) {
        // ignore if endpoint missing or unauthorized
      }
    };

    loadPending();

    return () => {
      mounted = false;
    };
  }, []);


  // =========================================================
  // CURRENT PAGE TITLE
  // =========================================================

  const currentTitle =
    pageTitles[location.pathname] ||
    navigation
      .flatMap((section) => section.items)
      .find((item) =>
        location.pathname.startsWith(item.path),
      )?.label ||
    "Admin";


  // =========================================================
  // CLOSE MOBILE MENU
  // =========================================================

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };


  // =========================================================
  // CLOSE DROPDOWNS
  // =========================================================

  const closeDropdowns = () => {
    setProfileOpen(false);
    setNotificationsOpen(false);
  };


  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">


      {/* =====================================================
          MOBILE OVERLAY
      ====================================================== */}

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
          onClick={closeMobileMenu}
        />
      )}


      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col
          border-r border-slate-200 bg-white
          transition-all duration-300

          ${sidebarOpen ? "w-72" : "w-20"}

          ${
            mobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >

        {/* ===================================================
            LOGO
        ==================================================== */}

        <div className="flex h-20 items-center border-b border-slate-200 px-5">

          <div className="flex min-w-0 flex-1 items-center gap-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white shadow-sm">
              S
            </div>

            {sidebarOpen && (
              <div className="min-w-0">
                <h1 className="truncate text-base font-bold text-slate-900">
                  StoreAdmin
                </h1>

                <p className="truncate text-xs text-slate-500">
                  Ecommerce Platform
                </p>
              </div>
            )}

          </div>


          {/* Mobile close */}

          <button
            type="button"
            onClick={closeMobileMenu}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>

        </div>


        {/* ===================================================
            NAVIGATION
        ==================================================== */}

        <nav className="flex-1 overflow-y-auto px-3 py-5">

          <div className="space-y-7">

            {navigation.map((section) => (

              <div key={section.title}>

                {sidebarOpen && (
                  <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {section.title}
                  </p>
                )}


                <div className="space-y-1">

                  {section.items.map((item) => {

                    const Icon = item.icon;

                    const badge =
                      item.path === "/admin/purchases" && pendingPurchases > 0
                        ? String(pendingPurchases)
                        : item.badge;


                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        end={
                          item.path === "/admin"
                        }
                        onClick={() => {
                          closeMobileMenu();
                          closeDropdowns();
                        }}
                        className={({ isActive }) =>
                          `
                          group flex items-center gap-3
                          rounded-xl px-3 py-2.5
                          text-sm font-medium
                          transition-all

                          ${
                            isActive
                              ? "bg-slate-900 text-white shadow-sm"
                              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                          }
                          `
                        }
                      >

                        {({ isActive }) => (
                          <>

                            <Icon
                              size={19}
                              strokeWidth={
                                isActive ? 2.2 : 1.8
                              }
                              className="shrink-0"
                            />


                            {sidebarOpen && (
                              <>

                                <span className="flex-1 truncate">
                                  {item.label}
                                </span>


                                {badge && (
                                  <span
                                    className={`
                                      rounded-full px-2 py-0.5
                                      text-[10px] font-bold

                                      ${
                                        isActive
                                          ? "bg-white/15 text-white"
                                          : "bg-red-50 text-red-600"
                                      }
                                    `}
                                  >
                                    {badge}
                                  </span>
                                )}

                              </>
                            )}

                          </>
                        )}

                      </NavLink>
                    );
                  })}

                </div>

              </div>
            ))}

          </div>

        </nav>


        {/* ===================================================
            HELP CARD
        ==================================================== */}

        {sidebarOpen && (
          <div className="border-t border-slate-200 p-4">

            <div className="rounded-2xl bg-slate-50 p-4">

              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm">
                <HelpCircle size={18} />
              </div>


              <p className="text-sm font-semibold text-slate-900">
                Need help?
              </p>


              <p className="mt-1 text-xs leading-5 text-slate-500">
                Check the admin documentation or contact support.
              </p>


              <button
                type="button"
                className="mt-3 text-xs font-semibold text-slate-900 hover:underline"
              >
                View documentation →
              </button>

            </div>

          </div>
        )}


        {/* ===================================================
            COLLAPSE
        ==================================================== */}

        <div className="hidden border-t border-slate-200 p-3 lg:block">

          <button
            type="button"
            onClick={() =>
              setSidebarOpen((value) => !value)
            }
            className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >

            <ChevronLeft
              size={18}
              className={`transition-transform ${
                sidebarOpen ? "" : "rotate-180"
              }`}
            />

            {sidebarOpen && (
              <span>Collapse sidebar</span>
            )}

          </button>

        </div>

      </aside>


      {/* =====================================================
          MAIN AREA
      ====================================================== */}

      <div
        className={`
          min-h-screen transition-all duration-300
          ${sidebarOpen ? "lg:pl-72" : "lg:pl-20"}
        `}
      >


        {/* ===================================================
            HEADER
        ==================================================== */}

        <header className="sticky top-0 z-30 h-20 border-b border-slate-200 bg-white/90 backdrop-blur-xl">

          <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">


            {/* =================================================
                LEFT
            ================================================== */}

            <div className="flex min-w-0 items-center gap-3">

              <button
                type="button"
                onClick={() =>
                  setMobileMenuOpen(true)
                }
                className="rounded-xl p-2.5 text-slate-600 hover:bg-slate-100 lg:hidden"
                aria-label="Open menu"
              >
                <Menu size={21} />
              </button>


              <div className="min-w-0">

                <div className="hidden items-center gap-2 text-xs text-slate-400 sm:flex">

                  <span>Admin</span>

                  <span>/</span>

                  <span className="text-slate-600">
                    {currentTitle}
                  </span>

                </div>


                <h2 className="truncate text-lg font-bold text-slate-900 sm:mt-0.5 sm:text-xl">
                  {currentTitle}
                </h2>

              </div>

            </div>


            {/* =================================================
                SEARCH
            ================================================== */}

            <div className="hidden max-w-md flex-1 md:block">

              <div className="relative">

                <Search
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />


                <input
                  type="search"
                  placeholder="Search products, orders, customers..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
                />


                <div className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-400 lg:block">
                  ⌘ K
                </div>

              </div>

            </div>


            {/* =================================================
                RIGHT
            ================================================== */}

            <div className="flex items-center gap-2 sm:gap-3">


              {/* Mobile Search */}

              <button
                type="button"
                className="rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 md:hidden"
                aria-label="Search"
              >
                <Search size={20} />
              </button>


              {/* =================================================
                  NOTIFICATIONS
              ================================================== */}

              <div className="relative">

                <button
                  type="button"
                  onClick={() => {
                    setNotificationsOpen(
                      (value) => !value,
                    );
                    setProfileOpen(false);
                  }}
                  className="relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-100"
                  aria-label="Notifications"
                >

                  <Bell size={20} />

                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />

                </button>


                {notificationsOpen && (

                  <div className="absolute right-0 top-14 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">

                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">

                      <h3 className="font-semibold text-slate-900">
                        Notifications
                      </h3>

                      <span className="rounded-full bg-red-50 px-2 py-1 text-[10px] font-bold text-red-600">
                        3 NEW
                      </span>

                    </div>


                    <div className="divide-y divide-slate-100">

                      <NotificationItem
                        icon={ShoppingBag}
                        title="New order received"
                        description="A new customer order requires attention."
                        time="Recently"
                      />


                      <NotificationItem
                        icon={Truck}
                        title="Shipment update"
                        description="A shipment has changed status."
                        time="Recently"
                      />


                      <NotificationItem
                        icon={CheckCircle}
                        title="Receipt confirmed"
                        description="A customer confirmed receipt of an order."
                        time="Recently"
                      />

                    </div>


                    <button
                      type="button"
                      className="w-full border-t border-slate-100 py-3 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      View all notifications
                    </button>

                  </div>

                )}

              </div>


              {/* Divider */}

              <div className="hidden h-8 w-px bg-slate-200 sm:block" />


              {/* =================================================
                  PROFILE
              ================================================== */}

              <div className="relative">

                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(
                      (value) => !value,
                    );
                    setNotificationsOpen(false);
                  }}
                  className="flex items-center gap-2 rounded-xl p-1.5 pr-2 transition hover:bg-slate-100"
                >

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
                    A
                  </div>


                  <div className="hidden text-left lg:block">

                    <p className="text-sm font-semibold text-slate-900">
                      Administrator
                    </p>

                    <p className="text-[11px] text-slate-500">
                      Store Admin
                    </p>

                  </div>


                  <ChevronDown
                    size={16}
                    className="hidden text-slate-400 lg:block"
                  />

                </button>


                {profileOpen && (

                  <div className="absolute right-0 top-14 w-60 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">

                    <div className="border-b border-slate-100 p-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
                          A
                        </div>


                        <div>

                          <p className="text-sm font-semibold text-slate-900">
                            Administrator
                          </p>

                          <p className="text-xs text-slate-500">
                            Store administration
                          </p>

                        </div>

                      </div>

                    </div>


                    <div className="p-2">

                      <ProfileMenuItem
                        icon={UserCircle}
                        label="My profile"
                      />


                      <ProfileMenuItem
                        icon={ShieldCheck}
                        label="Security"
                      />


                      <ProfileMenuItem
                        icon={Settings}
                        label="Account settings"
                      />


                      <div className="my-1 border-t border-slate-100" />


                      <button
                        type="button"
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                      >

                        <LogOut size={17} />

                        Sign out

                      </button>

                    </div>

                  </div>

                )}

              </div>

            </div>

          </div>

        </header>


        {/* =====================================================
            CONTENT
        ====================================================== */}

        <main className="min-h-[calc(100vh-5rem)] px-4 py-6 sm:px-6 lg:px-8">

          <div className="mx-auto w-full max-w-[1600px]">

            <Outlet />

          </div>

        </main>

      </div>

    </div>
  );
}


// =========================================================
// NOTIFICATION ITEM
// =========================================================

function NotificationItem({
  icon: Icon,
  title,
  description,
  time,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  time: string;
}) {
  return (
    <button
      type="button"
      className="flex w-full gap-3 p-4 text-left transition hover:bg-slate-50"
    >

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
        <Icon size={16} />
      </div>


      <div className="min-w-0">

        <p className="text-sm font-semibold text-slate-900">
          {title}
        </p>


        <p className="mt-0.5 text-xs leading-5 text-slate-500">
          {description}
        </p>


        <p className="mt-1 text-[10px] font-medium text-slate-400">
          {time}
        </p>

      </div>

    </button>
  );
}


// =========================================================
// PROFILE MENU ITEM
// =========================================================

function ProfileMenuItem({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    >

      <Icon size={17} />

      {label}

    </button>
  );
}