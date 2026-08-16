import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaMoneyBillWave,
} from "react-icons/fa";

import API from "../services/Api";

interface Payment {
  amount: number;
  reference?: string;
  method?: string;
  paidAt?: string;
}

interface Receiving {
  totalReceived: number;
  remainingAmount: number;
  payments: Payment[];
  status: "PENDING" | "PARTIAL" | "PAID" | "COMPLETED";
}

interface PurchaseOrder {
  _id: string;
  totalAmount: number;
  purchaseType: string;
  status: string;

  product?: {
    _id: string;
    name: string;
    image?: string;
  };

  user?: {
    _id: string;
    name?: string;
    email?: string;
    phone?: string;
  };

  receiving?: Receiving;
}

export default function AdminReceiving() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] =
    useState<PurchaseOrder | null>(null);

  const [amount, setAmount] = useState("");
  const [method, setMethod] =
    useState("BANK_TRANSFER");

  const [reference, setReference] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================
  // LOAD PURCHASE ORDER
  // ==========================================

  useEffect(() => {
    const loadPurchaseOrder = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await API.get(
          `/purchases/${id}`
        );

        setOrder(
          response.data?.data || null
        );
      } catch (error: any) {
        console.error(
          "LOAD RECEIVING ERROR:",
          error
        );

        setError(
          error?.response?.data?.message ||
            "Failed to load purchase order."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadPurchaseOrder();
    }
  }, [id]);

  // ==========================================
  // RECORD PAYMENT
  // ==========================================

  const handleReceivePayment = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const paymentAmount =
      Number(amount);

    if (!paymentAmount || paymentAmount <= 0) {
      setError(
        "Enter a valid payment amount."
      );
      return;
    }

    if (!order) {
      return;
    }

    const remaining =
      Number(
        order.receiving?.remainingAmount ??
          order.totalAmount
      );

    if (paymentAmount > remaining) {
      setError(
        `Payment cannot be more than the remaining amount of ₦${remaining.toLocaleString()}.`
      );
      return;
    }

    try {
      setSaving(true);

      const response = await API.post(
        `/purchases/${order._id}/receiving`,
        {
          amount: paymentAmount,
          method,
          reference:
            reference.trim(),
        }
      );

      const updatedOrder =
        response.data?.data;

      setOrder(updatedOrder);

      setAmount("");
      setReference("");

      setSuccess(
        "Payment recorded successfully."
      );
    } catch (error: any) {
      console.error(
        "RECEIVE PAYMENT ERROR:",
        error
      );

      setError(
        error?.response?.data?.message ||
          "Failed to record payment."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-500">
          Loading receiving information...
        </p>
      </div>
    );
  }

  // ==========================================
  // NOT FOUND
  // ==========================================

  if (!order) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50">
        <p className="text-gray-500">
          Purchase order not found.
        </p>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white"
        >
          Go Back
        </button>
      </div>
    );
  }

  // ==========================================
  // RECEIVING DATA
  // ==========================================

  const totalAmount =
    Number(order.totalAmount || 0);

  const totalReceived =
    Number(
      order.receiving?.totalReceived || 0
    );

  const remainingAmount =
    Number(
      order.receiving?.remainingAmount ??
        totalAmount
    );

  const receivingStatus =
    order.receiving?.status ||
    "PENDING";

  const payments =
    order.receiving?.payments || [];

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* =====================================
          HEADER
      ====================================== */}

      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100"
          >
            <FaArrowLeft />
          </button>

          <div>
            <h1 className="text-lg font-bold text-gray-900">
              Receiving Payment
            </h1>

            <p className="text-xs text-gray-500">
              Purchase #{order._id}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
        {/* =====================================
            ERROR
        ====================================== */}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* =====================================
            SUCCESS
        ====================================== */}

        {success && (
          <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            <FaCheckCircle />
            {success}
          </div>
        )}

        {/* =====================================
            PURCHASE INFORMATION
        ====================================== */}

        <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-bold text-gray-900">
            Purchase information
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {/* PRODUCT */}

            <div>
              <p className="text-xs font-medium uppercase text-gray-400">
                Product
              </p>

              <p className="mt-1 font-semibold text-gray-900">
                {order.product?.name ||
                  "Product"}
              </p>
            </div>

            {/* CUSTOMER */}

            <div>
              <p className="text-xs font-medium uppercase text-gray-400">
                Customer
              </p>

              <p className="mt-1 font-semibold text-gray-900">
                {order.user?.name ||
                  order.user?.email ||
                  "Customer"}
              </p>
            </div>

            {/* PURCHASE TYPE */}

            <div>
              <p className="text-xs font-medium uppercase text-gray-400">
                Purchase type
              </p>

              <p className="mt-1 font-semibold text-gray-900">
                {order.purchaseType}
              </p>
            </div>

            {/* ORDER STATUS */}

            <div>
              <p className="text-xs font-medium uppercase text-gray-400">
                Order status
              </p>

              <p className="mt-1 font-semibold text-gray-900">
                {order.status}
              </p>
            </div>
          </div>
        </section>

        {/* =====================================
            RECEIVING SUMMARY
        ====================================== */}

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Total amount
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              ₦{totalAmount.toLocaleString()}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Total received
            </p>

            <p className="mt-2 text-2xl font-bold text-green-600">
              ₦{totalReceived.toLocaleString()}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Remaining
            </p>

            <p className="mt-2 text-2xl font-bold text-orange-500">
              ₦{remainingAmount.toLocaleString()}
            </p>
          </div>
        </section>

        {/* =====================================
            STATUS
        ====================================== */}

        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Receiving status
              </p>

              <p className="mt-1 text-lg font-bold text-gray-900">
                {receivingStatus}
              </p>
            </div>

            <span
              className={`rounded-full px-4 py-2 text-xs font-bold ${
                receivingStatus === "PAID" ||
                receivingStatus ===
                  "COMPLETED"
                  ? "bg-green-100 text-green-700"
                  : receivingStatus ===
                    "PARTIAL"
                  ? "bg-orange-100 text-orange-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {receivingStatus}
            </span>
          </div>
        </section>

        {/* =====================================
            ADD PAYMENT
        ====================================== */}

        {remainingAmount > 0 && (
          <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50">
                <FaMoneyBillWave className="text-orange-500" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Receive payment
                </h2>

                <p className="text-sm text-gray-500">
                  Record money received from the customer.
                </p>
              </div>
            </div>

            <form
              onSubmit={
                handleReceivePayment
              }
              className="mt-5 space-y-4"
            >
              {/* AMOUNT */}

              <div>
                <label
                  htmlFor="amount"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Amount received
                </label>

                <input
                  id="amount"
                  type="number"
                  min="1"
                  max={remainingAmount}
                  value={amount}
                  onChange={(e) =>
                    setAmount(
                      e.target.value
                    )
                  }
                  placeholder="Enter amount"
                  className="h-12 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50"
                />

                <p className="mt-1 text-xs text-gray-400">
                  Remaining: ₦
                  {remainingAmount.toLocaleString()}
                </p>
              </div>

              {/* METHOD */}

              <div>
                <label
                  htmlFor="method"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Payment method
                </label>

                <select
                  id="method"
                  value={method}
                  onChange={(e) =>
                    setMethod(
                      e.target.value
                    )
                  }
                  className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50"
                >
                  <option value="BANK_TRANSFER">
                    Bank Transfer
                  </option>

                  <option value="CASH">
                    Cash
                  </option>

                  <option value="CARD">
                    Card
                  </option>

                  <option value="POS">
                    POS
                  </option>

                  <option value="OTHER">
                    Other
                  </option>
                </select>
              </div>

              {/* REFERENCE */}

              <div>
                <label
                  htmlFor="reference"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Payment reference
                  <span className="ml-1 text-xs text-gray-400">
                    Optional
                  </span>
                </label>

                <input
                  id="reference"
                  type="text"
                  value={reference}
                  onChange={(e) =>
                    setReference(
                      e.target.value
                    )
                  }
                  placeholder="Transaction reference"
                  className="h-12 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50"
                />
              </div>

              {/* SUBMIT */}

              <button
                type="submit"
                disabled={saving}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 text-sm font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Recording...
                  </>
                ) : (
                  <>
                    <FaMoneyBillWave />
                    Record Payment
                  </>
                )}
              </button>
            </form>
          </section>
        )}

        {/* =====================================
            PAYMENT HISTORY
        ====================================== */}

        <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-bold text-gray-900">
            Payment history
          </h2>

          {payments.length === 0 ? (
            <div className="mt-5 rounded-xl bg-gray-50 p-6 text-center">
              <p className="text-sm text-gray-500">
                No payments have been received yet.
              </p>
            </div>
          ) : (
            <div className="mt-5 divide-y divide-gray-100">
              {payments.map(
                (payment, index) => (
                  <div
                    key={`${payment.reference || "payment"}-${index}`}
                    className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">
                        ₦
                        {Number(
                          payment.amount
                        ).toLocaleString()}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {payment.method ||
                          "Payment"}
                      </p>

                      {payment.reference && (
                        <p className="mt-1 text-xs text-gray-400">
                          Ref:{" "}
                          {
                            payment.reference
                          }
                        </p>
                      )}
                    </div>

                    <p className="text-xs text-gray-400">
                      {payment.paidAt
                        ? new Date(
                            payment.paidAt
                          ).toLocaleString()
                        : "No date"}
                    </p>
                  </div>
                )
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}