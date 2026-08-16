
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { SearchProvider } from "./context/SearchContext";
import { NotificationProvider } from "./context/NotificationContext";

import MainLayout from "./layout/MainLayout";
import AdminLayout from "./admin/AdminLayout";

// =====================================
// PUBLIC PAGES
// =====================================

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import Categories from "./pageholder/Categories";
import ProductDetails from "./pageholder/ProductDetails";
import Cart from "./pageholder/Cart";
import Wishlist from "./pageholder/Wishlist";
import Account from "./pageholder/Account";

import OrderDetails from "./pages/OrderDetails";
import MyOrders from "./pages/MyOrders";
import CategoryProducts from "./pages/CategoryProducts";

import PurchaseSuccess from "./pages/PurchaseSuccess";
import PurchaseDetails from "./pages/PurchaseDetails";

import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";

import Notifications from "./component/Notifications";
import CustomerPayment from "./pages/CustomerPayment";

// =====================================
// ADMIN PAGES
// =====================================

import AdminDashboard from "./admin/Dashboard";
import AdminProducts from "./admin/products";
import AdminCategories from "./admin/Categories";
import AdminInventory from "./admin/Inventory";
import AdminOrders from "./admin/Orders";
import AdminShipping from "./admin/Shipping";
import AdminCustomers from "./admin/Customers";
import AdminReviews from "./admin/Reviews";
import AdminDiscounts from "./admin/AdminDiscounts";
import AdminPayments from "./admin/Payments";
import AdminAnalytics from "./admin/Analytics";
import AdminSettings from "./admin/Settings";
import AdminOrderDetails from "./admin/AdminOrderDetails";
import AdminReceiving from "./admin/AdminReceiving";
import AdminPurchaseDetails from "./admin/AdminPurchaseDetails";
import BannerManagement from "./admin/BannerManagement";
import PurchaseOrders from "./admin/PurchaseOrders";

import "./App.css";

function App() {
  return (
    <SearchProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
            {/* =================================
                PUBLIC WEBSITE
            ================================= */}

            <Route element={<MainLayout />}>
              <Route
                path="/"
                element={<Home />}
              />

              <Route
                path="/categories"
                element={<Categories />}
              />

              <Route
                path="/product/:id"
                element={<ProductDetails />}
              />

              <Route
                path="/cart"
                element={<Cart />}
              />

              <Route
                path="/wishlist"
                element={<Wishlist />}
              />

              <Route
                path="/category/:id"
                element={<CategoryProducts />}
              />

              <Route
                path="/account"
                element={<Account />}
              />

              <Route
                path="/payment"
                element={<CustomerPayment />}
              />

              <Route
                path="/payment/:orderId"
                element={<CustomerPayment />}
              />
            </Route>

            {/* =================================
                AUTHENTICATION
            ================================= */}

            <Route
              path="/login"
              element={<Login />}
            />

            <Route
              path="/register"
              element={<Register />}
            />

            {/* =================================
                CHECKOUT / ORDERS
            ================================= */}

            <Route
              path="/checkout"
              element={<Checkout />}
            />

            <Route
              path="/order-success/:id"
              element={<OrderSuccess />}
            />

            <Route
              path="/order/:id"
              element={<OrderDetails />}
            />

            <Route
              path="/orders"
              element={<MyOrders />}
            />

            <Route
              path="/notifications"
              element={<Notifications />}
            />

            {/* =================================
                PURCHASES
            ================================= */}

            <Route
              path="/purchase-success/:id"
              element={<PurchaseSuccess />}
            />

            <Route
              path="/purchases/:id"
              element={<PurchaseDetails />}
            />

            {/* =================================
                ADMIN DASHBOARD
            ================================= */}

            <Route
              path="/admin"
              element={<AdminLayout />}
            >
              {/* Dashboard */}

              <Route
                index
                element={<AdminDashboard />}
              />

              {/* Store */}

              <Route
                path="products"
                element={<AdminProducts />}
              />

              <Route
                path="categories"
                element={<AdminCategories />}
              />

              <Route
                path="inventory"
                element={<AdminInventory />}
              />

              <Route
                path="orders"
                element={<AdminOrders />}
              />

              <Route
                path="orders/:id"
                element={<AdminOrderDetails />}
              />

              <Route
                path="shipping"
                element={<AdminShipping />}
              />

              {/* Customers */}

              <Route
                path="customers"
                element={<AdminCustomers />}
              />

              {/* Banner */}

              <Route
                path="banner"
                element={<BannerManagement />}
              />

              {/* Reviews */}

              <Route
                path="reviews"
                element={<AdminReviews />}
              />

              {/* Marketing */}

              <Route
                path="discounts"
                element={<AdminDiscounts />}
              />

              {/* Finance */}

              <Route
                path="payments"
                element={<AdminPayments />}
              />

              {/* Analytics */}

              <Route
                path="analytics"
                element={<AdminAnalytics />}
              />

              {/* Purchases */}

              <Route
                path="purchases"
                element={<PurchaseOrders />}
              />

              <Route
                path="purchases/:id"
                element={<AdminPurchaseDetails />}
              />

              <Route
                path="purchases/:id/receiving"
                element={<AdminReceiving />}
              />

              {/* Settings */}

              <Route
                path="settings"
                element={<AdminSettings />}
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </SearchProvider>
  );
}

export default App;

