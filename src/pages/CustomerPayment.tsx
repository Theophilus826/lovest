
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaUniversity,
  FaCopy,
  FaCheck,
  FaExternalLinkAlt,
  FaReceipt,
} from "react-icons/fa";
import API from "../services/Api";

interface PaymentSettings {
  bankName: string;
  accountName: string;
  accountNumber: string;
  paymentLink?: string;
}

interface Order {
  _id: string;
  total: number;
  paymentStatus:
    | "pending"
    | "paid"
    | "failed"
    | "refunded";
  paymentMethod: string;
  status: string;
}

export default function CustomerPayment() {
  const { orderId } = useParams<{
    orderId: string;
  }>();

  const [payment, setPayment] =
    useState<PaymentSettings | null>(null);

  const [order, setOrder] =
    useState<Order | null>(null);
  const [isPurchase, setIsPurchase] = useState(false);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [copied, setCopied] = useState("");

  // ==========================================
  // LOAD PAYMENT + ORDER
  // ==========================================

  useEffect(() => {
    const loadData = async () => {
      if (!orderId) {
        setError("Order ID is missing.");
        setLoading(false);
        return;
      }

      try {
        const paymentResponse = await API.get("/payments");

        setPayment(paymentResponse.data?.data);

        // Try loading a purchase first to avoid a harmless 404 when ID is a purchase
        try {
          const purchaseResponse = await API.get(`/purchase/${orderId}`);

          const p = purchaseResponse.data?.data;

          const mapped: Order = {
            _id: p._id,
            total: p.totalAmount,
            paymentStatus: p.payment?.status || "pending",
            paymentMethod: "bank",
            status: p.status,
          };

          setOrder(mapped);
          setIsPurchase(true);
        } catch (err: any) {
          if (err?.response?.status === 404) {
            // Not a purchase; try loading as an order
            const orderResponse = await API.get(`/orders/${orderId}`);

            setOrder(orderResponse.data?.data);
            setIsPurchase(false);
          } else {
            throw err;
          }
        }
      } catch (error: any) {
        console.error("LOAD PAYMENT PAGE ERROR:", error);

        setError(
          error?.response?.data?.message ||
            "Failed to load payment details."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [orderId]);

  // ==========================================
  // COPY
  // ==========================================

  const copyToClipboard = async (
    value: string,
    field: string
  ) => {
    try {
      await navigator.clipboard.writeText(value);

      setCopied(field);

      setTimeout(() => {
        setCopied("");
      }, 2000);
    } catch (error) {
      console.error(
        "COPY ERROR:",
        error
      );
    }
  };

  // ==========================================
  // I HAVE MADE PAYMENT
  // ==========================================

  const confirmPayment = async () => {
    if (!orderId) return;

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      if (isPurchase) {
        setError(
          "Payment confirmation for purchases is not supported via this form. Please contact support or wait for an automated confirmation."
        );
        return;
      }

      const response = await API.patch(`/orders/${orderId}/payment`);

      setOrder(response.data?.data);

      setSuccess(
        "Payment submitted successfully. Our team will verify your payment."
      );
    } catch (error: any) {
      console.error(
        "PAYMENT SUBMISSION ERROR:",
        error
      );

      setError(
        error?.response?.data?.message ||
          "Failed to submit payment confirmation."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="border-b border-gray-100 bg-white">
          <div className="mx-auto flex h-16 max-w-3xl items-center gap-3 px-4">
            <Link
              to="/"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <FaArrowLeft />
            </Link>

            <h1 className="font-bold text-gray-900">
              Payment
            </h1>
          </div>
        </header>

        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-sm text-gray-500">
            Loading payment details...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error && (!payment || !order)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="border-b border-gray-100 bg-white">
          <div className="mx-auto flex h-16 max-w-3xl items-center gap-3 px-4">
            <Link
              to="/"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <FaArrowLeft />
            </Link>

            <h1 className="font-bold text-gray-900">
              Payment
            </h1>
          </div>
        </header>

        <main className="mx-auto max-w-xl p-5">
          <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">
              Payment unavailable
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              {error}
            </p>

            <Link
              to={`/order/${orderId}`}
              className="mt-6 inline-block rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white"
            >
              View Order
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (!payment || !order) {
    return null;
  }

  // ==========================================
  // ALREADY PAID
  // ==========================================

  const isPaid =
    order.paymentStatus === "paid";

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}

      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex h-16 max-w-3xl items-center gap-3 px-4">
          <Link
            to={`/order/${order._id}`}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-100"
          >
            <FaArrowLeft />
          </Link>

          <div>
            <h1 className="font-bold text-gray-900">
              Payment
            </h1>

            <p className="text-xs text-gray-500">
              Order #{order._id}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-5 p-4 sm:p-6">
        {/* ORDER AMOUNT */}

        <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Amount to pay
              </p>

              <p className="mt-1 text-3xl font-bold text-orange-500">
                ₦{Number(order.total).toLocaleString()}
              </p>
            </div>

            <div
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                isPaid
                  ? "bg-green-100 text-green-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {isPaid
                ? "Paid"
                : "Awaiting Payment"}
            </div>
          </div>

          <div className="mt-5 rounded-xl bg-gray-50 p-4">
            <p className="text-xs text-gray-400">
              Order ID
            </p>

            <p className="mt-1 break-all text-sm font-semibold text-gray-900">
              #{order._id}
            </p>
          </div>
        </section>

        {/* BANK TRANSFER */}

        {!isPaid && (
          <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-50">
                <FaUniversity className="text-xl text-orange-500" />
              </div>

              <div>
                <h2 className="font-bold text-gray-900">
                  Bank Transfer
                </h2>

                <p className="text-sm text-gray-500">
                  Transfer exactly the amount shown above
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {/* BANK */}

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-400">
                  Bank
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  {payment.bankName}
                </p>
              </div>

              {/* ACCOUNT NAME */}

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-400">
                  Account Name
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  {payment.accountName}
                </p>
              </div>

              {/* ACCOUNT NUMBER */}

              <div className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 p-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">
                    Account Number
                  </p>

                  <p className="mt-1 text-lg font-bold tracking-wide text-gray-900">
                    {payment.accountNumber}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      payment.accountNumber,
                      "accountNumber"
                    )
                  }
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-gray-600 shadow-sm hover:text-orange-500"
                >
                  {copied === "accountNumber" ? (
                    <FaCheck className="text-green-500" />
                  ) : (
                    <FaCopy />
                  )}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ONLINE PAYMENT */}

        {!isPaid &&
          payment.paymentLink && (
            <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
              <h2 className="font-bold text-gray-900">
                Online Payment
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                You can also pay securely online.
              </p>

              <a
                href={payment.paymentLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-4 font-bold text-white hover:bg-orange-600"
              >
                Pay Online
                <FaExternalLinkAlt size={13} />
              </a>
            </section>
          )}

        {/* SUCCESS MESSAGE */}

        {success && (
          <div className="rounded-xl bg-green-50 p-4 text-sm font-medium text-green-700">
            {success}
          </div>
        )}

        {/* ERROR MESSAGE */}

        {error && (
          <div className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        {/* PAYMENT CONFIRMATION */}

        {!isPaid && (
          <section className="rounded-2xl bg-orange-50 p-5">
            <div className="flex gap-3">
              <FaReceipt className="mt-1 shrink-0 text-orange-500" />

              <div>
                <h2 className="font-bold text-gray-900">
                  Have you made the payment?
                </h2>

                <p className="mt-1 text-sm leading-6 text-gray-600">
                  After transferring the exact amount,
                  click the button below. Our team will
                  verify the payment before marking your
                  order as paid.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={confirmPayment}
              disabled={submitting}
              className="mt-5 w-full rounded-xl bg-orange-500 py-4 font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {submitting
                ? "Submitting..."
                : "I Have Made Payment"}
            </button>
          </section>
        )}

        {/* PAID MESSAGE */}

        {isPaid && (
          <section className="rounded-2xl bg-green-50 p-5">
            <div className="flex gap-3">
              <FaCheck className="mt-1 shrink-0 text-green-600" />

              <div>
                <h2 className="font-bold text-green-800">
                  Payment confirmed
                </h2>

                <p className="mt-1 text-sm leading-6 text-green-700">
                  Your payment has been confirmed and
                  your order will continue processing.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* VIEW ORDER */}

        <Link
          to={`/order/${order._id}`}
          className="block w-full rounded-xl border border-gray-200 bg-white py-4 text-center font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          View Order Details
        </Link>
      </main>
    </div>
  );
}

