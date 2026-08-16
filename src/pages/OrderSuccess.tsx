
import { Link, useParams } from "react-router-dom";
import {
  FaCheckCircle,
  FaBoxOpen,
  FaArrowRight,
  FaCreditCard,
} from "react-icons/fa";

export default function OrderSuccess() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-lg text-center">

        {/* =====================================
            SUCCESS ICON
        ====================================== */}

        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
          <FaCheckCircle className="text-5xl text-green-500" />
        </div>

        {/* =====================================
            HEADING
        ====================================== */}

        <h1 className="mt-6 text-3xl font-bold text-gray-900">
          Order Successful!
        </h1>

        <p className="mt-3 text-gray-500">
          Thank you for your order. Your order has been
          received and is now being processed.
        </p>

        {/* =====================================
            ORDER ID
        ====================================== */}

        {id && (
          <div className="mt-6 rounded-xl bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Order ID
            </p>

            <p className="mt-1 break-all font-semibold text-gray-900">
              #{id}
            </p>
          </div>
        )}

        {/* =====================================
            WHAT HAPPENS NEXT
        ====================================== */}

        <div className="mt-6 rounded-xl bg-orange-50 p-5 text-left">
          <div className="flex gap-3">
            <FaBoxOpen className="mt-1 shrink-0 text-orange-500" />

            <div>
              <h2 className="font-semibold text-gray-900">
                What happens next?
              </h2>

              <p className="mt-1 text-sm leading-6 text-gray-600">
                Your order has been received. You can view
                your order details or continue to payment
                if payment is required.
              </p>
            </div>
          </div>
        </div>

        {/* =====================================
            BUTTONS
        ====================================== */}

        {id && (
          <div className="mt-8 space-y-3">

            {/* MAKE PAYMENT */}

            <Link
              to={`/payment/${id}`}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-4 font-semibold text-white transition hover:bg-orange-600"
            >
              <FaCreditCard size={15} />

              Make Payment

              <FaArrowRight size={14} />
            </Link>

            {/* VIEW ORDER */}

            <Link
              to={`/order/${id}`}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-4 font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              View Order

              <FaArrowRight size={14} />
            </Link>

            {/* CONTINUE SHOPPING */}

            <Link
              to="/"
              className="block w-full rounded-xl border border-gray-200 bg-white py-4 font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Continue Shopping
            </Link>

          </div>
        )}

        {/* =====================================
            NO ORDER ID
        ====================================== */}

        {!id && (
          <Link
            to="/"
            className="mt-8 block w-full rounded-xl bg-orange-500 py-4 font-semibold text-white transition hover:bg-orange-600"
          >
            Continue Shopping
          </Link>
        )}

      </div>
    </div>
  );
}

