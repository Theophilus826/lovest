import { Link, useParams } from "react-router-dom";
import { FaCheckCircle, FaArrowRight } from "react-icons/fa";

export default function PurchaseSuccess() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
        {/* SUCCESS ICON */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
          <FaCheckCircle className="text-5xl text-green-500" />
        </div>

        {/* TITLE */}
        <h1 className="mt-6 text-2xl font-bold text-gray-900">
          Purchase Successful
        </h1>

        {/* MESSAGE */}
        <p className="mt-3 text-sm leading-6 text-gray-500">
          Your purchase has been created successfully.
          We will process your purchase and keep you updated.
        </p>

        {/* PURCHASE ID */}
        {id && (
          <div className="mt-5 rounded-xl bg-gray-50 p-4">
            <p className="text-xs font-medium text-gray-400">
              Purchase Reference
            </p>

            <p className="mt-1 break-all text-sm font-semibold text-gray-900">
              {id}
            </p>
          </div>
        )}

        {/* ACTIONS */}
        <div className="mt-6 space-y-3">
          {id && (
            <Link
              to={`/purchases/${id}`}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 text-sm font-bold text-white transition hover:bg-orange-600"
            >
              View Purchase
              <FaArrowRight size={14} />
            </Link>
          )}

          <Link
            to="/"
            className="flex h-12 w-full items-center justify-center rounded-xl border border-gray-200 px-5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}