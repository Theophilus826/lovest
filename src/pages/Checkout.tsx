import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCheckCircle, FaShoppingCart } from "react-icons/fa";

import API from "../services/Api";
import { useCart } from "../context/CartContext";

type PurchaseType = "FULL_PAYMENT" | "CONTRIBUTION" | "LOAN" | "RESELLER";

export default function Checkout() {
  const navigate = useNavigate();

  const { cart, totalItems, subtotal, removeItem } = useCart();

  // =====================================
  // FORM
  // =====================================

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
  });

  // =====================================
  // PURCHASE METHOD
  // =====================================

  const [purchaseType, setPurchaseType] =
    useState<PurchaseType>("FULL_PAYMENT");

  const [contributionPhases, setContributionPhases] = useState<number>(4);

  const [deposit, setDeposit] = useState<string>("");

  // =====================================
  // STATE
  // =====================================

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =====================================
  // DELIVERY
  // =====================================

  const deliveryFee = cart.length > 0 ? 1500 : 0;

  const total = subtotal + deliveryFee;

  // =====================================
  // PURCHASE CALCULATIONS
  // =====================================

  const phaseAmount =
    contributionPhases > 0 ? total / contributionPhases : total;

  const loanDeposit = Number(deposit || 0);

  const loanAmount = Math.max(total - loanDeposit, 0);

  // =====================================
  // HANDLE CUSTOMER CHANGE
  // =====================================

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================
  // HANDLE PURCHASE TYPE
  // =====================================

  const handlePurchaseTypeChange = (type: PurchaseType) => {
    setPurchaseType(type);

    setError("");

    if (type !== "LOAN") {
      setDeposit("");
    }
  };

  // =====================================
  // PLACE PURCHASE
  // =====================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");

    // =====================================
    // BASIC VALIDATION
    // =====================================

    if (!form.name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!form.phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    if (!form.address.trim()) {
      setError("Please enter your delivery address.");
      return;
    }

    if (!form.city.trim()) {
      setError("Please enter your city.");
      return;
    }

    if (!form.state.trim()) {
      setError("Please enter your state.");
      return;
    }

    if (cart.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    if (purchaseType === "FULL_PAYMENT") {
      try {
        setLoading(true);
        await handleFullPayment();
      } catch (error: any) {
        console.error("Failed to create full-payment order:", error);

        setError(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to create your order. Please try again.",
        );
      } finally {
        setLoading(false);
      }

      return;
    }

    // Purchase plans currently support one product per purchase.
    if (cart.length !== 1) {
      setError(
        "Please checkout with one product at a time when using a purchase plan.",
      );
      return;
    }

    const cartItem = cart[0];

    // =====================================
    // VALIDATE CONTRIBUTION
    // =====================================

    if (purchaseType === "CONTRIBUTION") {
      if (![4, 6, 7].includes(contributionPhases)) {
        setError("Contribution plan must be 4, 6, or 7 phases.");
        return;
      }
    }

    // =====================================
    // VALIDATE LOAN
    // =====================================

    if (purchaseType === "LOAN") {
      if (Number.isNaN(loanDeposit) || loanDeposit < 0) {
        setError("Please enter a valid loan deposit.");
        return;
      }

      if (loanDeposit >= total) {
        setError("Loan deposit must be less than the total amount.");
        return;
      }
    }

    try {
      setLoading(true);

      // =====================================
      // CREATE PURCHASE
      // =====================================

      const payload: any = {
        productId: cartItem.product._id,
        quantity: cartItem.quantity,
        purchaseType,

        delivery: {
          address: form.address.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          phone: form.phone.trim(),
        },
      };

      // =====================================
      // CONTRIBUTION
      // =====================================

      if (purchaseType === "CONTRIBUTION") {
        payload.contributionPhases = contributionPhases;
      }

      // =====================================
      // LOAN
      // =====================================

      if (purchaseType === "LOAN") {
        payload.deposit = loanDeposit;
      }

      // =====================================
      // CREATE PURCHASE
      // =====================================

      const response = await API.post("/purchase", payload);

      const purchase = response.data?.data;

      if (!purchase?._id) {
        throw new Error(
          "Purchase was created but no purchase ID was returned.",
        );
      }

      // =====================================
      // SAVE PURCHASE ID
      // =====================================

      sessionStorage.setItem("lastPurchaseId", purchase._id);

      // =====================================
      // CLEAR CART
      // =====================================

      removeItem(cartItem.product._id);

      // =====================================
      // GO TO PURCHASE SUCCESS
      // =====================================

      navigate(`/purchase-success/${purchase._id}`);
    } catch (error: any) {
      console.error("Failed to create purchase:", error);

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to create your purchase. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================
// CREATE ORDER + PAYSTACK PAYMENT
// =====================================

const handleFullPayment = async () => {
  // =====================================
  // PAYSTACK REQUIRES EMAIL
  // =====================================

  if (!form.email.trim()) {
    throw new Error(
      "Please enter your email address to pay online.",
    );
  }

  // =====================================
  // CREATE ORDER
  // =====================================

  const orderPayload = {
    customer: {
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
    },

    deliveryAddress: {
      address: form.address.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      country: "Nigeria",
      postalCode: "",
    },

    items: cart.map((item) => {
      const originalPrice = Number(
        item.product.originalPrice || 0,
      );

      const price = Number(
        item.product.price || 0,
      );

      return {
        product: item.product._id,

        name: item.product.name,

        image: item.product.image || "",

        originalPrice,

        price,

        quantity: item.quantity,

        total: price * item.quantity,
      };
    }),

    subtotal,

    deliveryFee,

    total,

    paymentMethod: "online",
  };

  // =====================================
  // CREATE ORDER
  // =====================================

  const orderResponse = await API.post(
    "/orders",
    orderPayload,
  );

  const order = orderResponse.data?.data;

  if (!order?._id) {
    throw new Error(
      "Order was created but no order ID was returned.",
    );
  }

  // =====================================
  // SAVE ORDER ID
  // =====================================

  sessionStorage.setItem(
    "lastOrderId",
    order._id,
  );

  // =====================================
  // INITIALIZE PAYSTACK
  // =====================================

  const paymentResponse = await API.post(
    "/payments/paystack/initialize",
    {
      orderId: order._id,
    },
  );

  const payment =
    paymentResponse.data;

  if (
    !payment?.success ||
    !payment?.authorization_url
  ) {
    throw new Error(
      payment?.message ||
        "Unable to initialize Paystack payment.",
    );
  }

  // =====================================
  // REDIRECT TO PAYSTACK
  // =====================================

  window.location.href =
    payment.authorization_url;
};
  // =====================================
  // EMPTY CART
  // =====================================

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="border-b border-gray-100 bg-white">
          <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
            <Link
              to="/"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-100"
            >
              <FaArrowLeft />
            </Link>

            <h1 className="text-xl font-bold text-gray-900">Checkout</h1>
          </div>
        </header>

        <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-orange-50">
            <FaShoppingCart className="text-4xl text-orange-400" />
          </div>

          <h2 className="mt-6 text-xl font-bold text-gray-900">
            Your cart is empty
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Add some products before checking out.
          </p>

          <Link
            to="/"
            className="mt-6 rounded-xl bg-orange-500 px-8 py-3 font-semibold text-white transition hover:bg-orange-600"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  // =====================================
  // CHECKOUT
  // =====================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}

      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
          <Link
            to="/cart"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-100"
            aria-label="Back to cart"
          >
            <FaArrowLeft />
          </Link>

          <div>
            <h1 className="text-xl font-bold text-gray-900">Checkout</h1>

            <p className="text-xs text-gray-500">
              {totalItems} {totalItems === 1 ? "item" : "items"}
            </p>
          </div>
        </div>
      </header>

      {/* MAIN */}

      <main className="mx-auto max-w-6xl p-4 sm:p-6">
        <form
          onSubmit={handleSubmit}
          className="grid gap-6 lg:grid-cols-[1fr_380px]"
        >
          {/* LEFT */}

          <div className="space-y-6">
            {/* CUSTOMER INFORMATION */}

            <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-lg font-bold text-gray-900">
                  Customer information
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Enter your contact information.
                </p>
              </div>

              <div className="mt-5 space-y-4">
                {/* NAME */}

                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Full name
                  </label>

                  <input
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. John Doe"
                    className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-50"
                  />
                </div>

                {/* PHONE */}

                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Phone number
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="e.g. 08012345678"
                    className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-50"
                  />
                </div>

                {/* EMAIL */}

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Email address
                    <span className="ml-1 text-xs text-gray-400">Optional</span>
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-50"
                  />
                </div>
              </div>
            </section>

            {/* DELIVERY */}

            <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-lg font-bold text-gray-900">
                  Delivery address
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Where should we deliver your purchase?
                </p>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <label
                    htmlFor="address"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Address
                  </label>

                  <textarea
                    id="address"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    rows={3}
                    placeholder="House number, street name..."
                    className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-50"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="city"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      City
                    </label>

                    <input
                      id="city"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      placeholder="City"
                      className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-50"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="state"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      State
                    </label>

                    <input
                      id="state"
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                      placeholder="State"
                      className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-50"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* =====================================
                PAYMENT / PURCHASE METHOD
            ===================================== */}

            <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-lg font-bold text-gray-900">
                  Payment method
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Choose how you want to pay.
                </p>
              </div>

              <div className="mt-5 space-y-3">
                {/* =================================
                    FULL PAYMENT
                ================================= */}

                <label
                  className={`block cursor-pointer rounded-xl border p-4 transition ${
                    purchaseType === "FULL_PAYMENT"
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 hover:border-orange-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="purchaseType"
                      value="FULL_PAYMENT"
                      checked={purchaseType === "FULL_PAYMENT"}
                      onChange={() => handlePurchaseTypeChange("FULL_PAYMENT")}
                      className="mt-1 h-4 w-4 accent-orange-500"
                    />

                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Pay in Full
                      </p>

                      <p className="mt-1 text-xs leading-5 text-gray-500">
                        Pay the full amount now and complete your purchase.
                      </p>
                    </div>
                  </div>
                </label>

                {/* =================================
                    CONTRIBUTION
                ================================= */}

                <label
                  className={`block cursor-pointer rounded-xl border p-4 transition ${
                    purchaseType === "CONTRIBUTION"
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 hover:border-orange-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="purchaseType"
                      value="CONTRIBUTION"
                      checked={purchaseType === "CONTRIBUTION"}
                      onChange={() => handlePurchaseTypeChange("CONTRIBUTION")}
                      className="mt-1 h-4 w-4 accent-orange-500"
                    />

                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        Contribute Little by Little
                      </p>

                      <p className="mt-1 text-xs leading-5 text-gray-500">
                        Split the purchase into manageable payments.
                      </p>

                      {purchaseType === "CONTRIBUTION" && (
                        <div className="mt-4">
                          <p className="mb-2 text-xs font-semibold text-gray-700">
                            Choose your contribution plan
                          </p>

                          <div className="grid grid-cols-3 gap-2">
                            {[4, 6, 7].map((phase) => (
                              <button
                                key={phase}
                                type="button"
                                onClick={() => setContributionPhases(phase)}
                                className={`rounded-xl border px-3 py-3 text-center transition ${
                                  contributionPhases === phase
                                    ? "border-orange-500 bg-orange-500 text-white"
                                    : "border-gray-200 bg-white text-gray-700 hover:border-orange-300"
                                }`}
                              >
                                <span className="block text-sm font-bold">
                                  {phase}
                                </span>

                                <span
                                  className={`mt-1 block text-[10px] ${
                                    contributionPhases === phase
                                      ? "text-orange-100"
                                      : "text-gray-400"
                                  }`}
                                >
                                  phases
                                </span>
                              </button>
                            ))}
                          </div>

                          <div className="mt-3 rounded-xl bg-white p-3">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500">
                                Payment per phase
                              </span>

                              <span className="font-bold text-gray-900">
                                ₦
                                {phaseAmount.toLocaleString(undefined, {
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                            </div>

                            <div className="mt-2 flex justify-between text-xs">
                              <span className="text-gray-500">Total</span>

                              <span className="font-semibold text-gray-900">
                                ₦{total.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </label>

                {/* =================================
                    LOAN
                ================================= */}

                <label
                  className={`block cursor-pointer rounded-xl border p-4 transition ${
                    purchaseType === "LOAN"
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 hover:border-orange-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="purchaseType"
                      value="LOAN"
                      checked={purchaseType === "LOAN"}
                      onChange={() => handlePurchaseTypeChange("LOAN")}
                      className="mt-1 h-4 w-4 accent-orange-500"
                    />

                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        Buy on Loan
                      </p>

                      <p className="mt-1 text-xs leading-5 text-gray-500">
                        Pay a deposit and apply to pay the remaining amount over
                        time.
                      </p>

                      {purchaseType === "LOAN" && (
                        <div className="mt-4">
                          <label
                            htmlFor="deposit"
                            className="mb-2 block text-xs font-semibold text-gray-700"
                          >
                            Deposit
                          </label>

                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500">
                              ₦
                            </span>

                            <input
                              id="deposit"
                              type="number"
                              min="0"
                              max={Math.max(total - 1, 0)}
                              value={deposit}
                              onChange={(e) => setDeposit(e.target.value)}
                              placeholder="Enter deposit"
                              className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-8 pr-4 text-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-50"
                            />
                          </div>

                          <div className="mt-3 rounded-xl bg-white p-3">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500">
                                Product total
                              </span>

                              <span className="font-semibold text-gray-900">
                                ₦{total.toLocaleString()}
                              </span>
                            </div>

                            <div className="mt-2 flex justify-between text-xs">
                              <span className="text-gray-500">Deposit</span>

                              <span className="font-semibold text-gray-900">
                                ₦{loanDeposit.toLocaleString()}
                              </span>
                            </div>

                            <div className="mt-2 border-t border-gray-100 pt-2">
                              <div className="flex justify-between text-xs">
                                <span className="font-semibold text-gray-700">
                                  Amount requested
                                </span>

                                <span className="font-bold text-orange-500">
                                  ₦{loanAmount.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          <p className="mt-2 text-[11px] leading-5 text-gray-400">
                            Your loan application will require approval before
                            the purchase can proceed.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </label>

                {/* =================================
                    RESELLER
                ================================= */}

                <label
                  className={`block cursor-pointer rounded-xl border p-4 transition ${
                    purchaseType === "RESELLER"
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 hover:border-orange-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="purchaseType"
                      value="RESELLER"
                      checked={purchaseType === "RESELLER"}
                      onChange={() => handlePurchaseTypeChange("RESELLER")}
                      className="mt-1 h-4 w-4 accent-orange-500"
                    />

                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Buy to Resell
                      </p>

                      <p className="mt-1 text-xs leading-5 text-gray-500">
                        Purchase products for your own resale business.
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            </section>
          </div>

          {/* =====================================
              RIGHT
          ===================================== */}

          <div className="h-fit space-y-4 lg:sticky lg:top-24">
            {/* ORDER ITEMS */}

            <section className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">Your order</h2>

              <div className="mt-4 space-y-4">
                {cart.map((item) => {
                  const originalPrice = Number(item.product.originalPrice || 0);

                  const sellingPrice = Number(item.product.price || 0);

                  const hasDiscount =
                    originalPrice > sellingPrice && originalPrice > 0;

                  const itemTotal = sellingPrice * item.quantity;

                  return (
                    <div key={item.product._id} className="flex gap-3">
                      <div className="relative shrink-0">
                        {item.product.image ? (
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="h-16 w-16 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gray-100 text-xs text-gray-400">
                            No image
                          </div>
                        )}

                        <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-gray-900 px-1 text-xs font-bold text-white">
                          {item.quantity}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-semibold text-gray-900">
                          {item.product.name}
                        </p>

                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-sm font-bold text-orange-500">
                            ₦{sellingPrice.toLocaleString()}
                          </span>

                          {hasDiscount && (
                            <span className="text-xs text-gray-400 line-through">
                              ₦{originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="shrink-0 text-sm font-bold text-gray-900">
                        ₦{itemTotal.toLocaleString()}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ERROR */}

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium leading-5 text-red-700">
                {error}
              </div>
            )}

            {/* PURCHASE PLAN SUMMARY */}

            {purchaseType === "CONTRIBUTION" && (
              <section className="rounded-2xl border border-orange-100 bg-orange-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">
                  Contribution plan
                </p>

                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {contributionPhases} phases
                  </span>

                  <span className="font-bold text-orange-600">
                    ₦
                    {phaseAmount.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                    /phase
                  </span>
                </div>
              </section>
            )}

            {purchaseType === "LOAN" && (
              <section className="rounded-2xl border border-orange-100 bg-orange-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">
                  Loan application
                </p>

                <div className="mt-2 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Deposit</span>

                    <span className="font-semibold">
                      ₦{loanDeposit.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">Amount requested</span>

                    <span className="font-bold text-orange-600">
                      ₦{loanAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </section>
            )}

            {/* SUMMARY */}

            <section className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">Order summary</h2>

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>

                  <span className="font-medium text-gray-900">
                    ₦{subtotal.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Delivery</span>

                  <span className="font-medium text-gray-900">
                    ₦{deliveryFee.toLocaleString()}
                  </span>
                </div>

                <div className="border-t border-gray-100 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900">Total</span>

                    <span className="text-xl font-bold text-orange-500">
                      ₦{total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* PLACE PURCHASE */}

              <button
                type="submit"
                disabled={loading}
                className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 text-sm font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FaCheckCircle />

                    {purchaseType === "CONTRIBUTION"
                      ? "Start Contribution"
                      : purchaseType === "LOAN"
                        ? "Apply for Loan"
                        : purchaseType === "RESELLER"
                          ? "Start Reseller Purchase"
                          : "Place Order"}
                  </>
                )}
              </button>

              <Link
                to="/cart"
                className="mt-3 block text-center text-sm font-semibold text-gray-500 transition hover:text-orange-500"
              >
                Return to Cart
              </Link>
              <div className="mt-4 text-center text-xs leading-5 text-gray-500">
                By placing your order, you agree to our{" "}
                <Link
                  to="/policies"
                  className="font-semibold text-orange-500 hover:text-orange-600"
                >
                  Shipping, Return, Cancellation and Refund Policies
                </Link>
                .
              </div>
            </section>
          </div>
        </form>
      </main>
    </div>
  );
}
