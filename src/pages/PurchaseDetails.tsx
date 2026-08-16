import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import API from "../services/Api";

interface PurchaseOrder {
  _id: string;
  purchaseType: string;
  status: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;

  product?: {
    _id: string;
    name: string;
    image?: string;
    price?: number;
  };

  contribution?: {
    phases: number;
    currentPhase: number;
    amountPerPhase: number;
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
    status: string;
    nextPaymentDue?: string;
  };

  loan?: {
    productAmount: number;
    deposit: number;
    loanAmount: number;
    approvedAmount: number;
    repaymentAmount: number;
    repaymentMonths: number;
    totalRepayment: number;
    paidAmount: number;
    remainingAmount: number;
    status: string;
  };

  reseller?: {
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    status: string;
  };
}

export default function PurchaseDetails() {
  const { id } = useParams<{ id: string }>();

  const [purchase, setPurchase] =
    useState<PurchaseOrder | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPurchase = async () => {
      try {
        setLoading(true);

        const response = await API.get(
          `/purchase/${id}`
        );

        setPurchase(
          response.data?.data || null
        );
      } catch (error: any) {
        console.error(
          "Failed to fetch purchase:",
          error
        );

        setError(
          error?.response?.data?.message ||
            "Failed to load purchase."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPurchase();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-500">
          Loading purchase...
        </p>
      </div>
    );
  }

  if (error || !purchase) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <p className="text-gray-500">
          {error || "Purchase not found."}
        </p>

        <Link
          to="/"
          className="mt-5 rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  const contribution =
    purchase.contribution;

  const loan = purchase.loan;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}

      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex h-16 max-w-4xl items-center gap-3 px-4">
          <Link
            to="/"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100"
          >
            <FaArrowLeft />
          </Link>

          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Purchase Details
            </h1>

            <p className="text-xs text-gray-500">
              #{purchase._id}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-5 p-4 sm:p-6">
        {/* PRODUCT */}

        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex gap-4">
            {purchase.product?.image ? (
              <img
                src={purchase.product.image}
                alt={purchase.product.name}
                className="h-24 w-24 rounded-xl object-cover"
              />
            ) : (
              <div className="h-24 w-24 rounded-xl bg-gray-100" />
            )}

            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold text-gray-900">
                {purchase.product?.name ||
                  "Product"}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Quantity: {purchase.quantity}
              </p>

              <p className="mt-2 text-lg font-bold text-orange-500">
                ₦
                {purchase.totalAmount.toLocaleString()}
              </p>
            </div>
          </div>
        </section>

        {/* PAYMENT ACTION */}
        {(purchase.status !== "PAID" && purchase.status !== "COMPLETED") && (
          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <Link
              to={`/payment/${purchase._id}`}
              className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600"
            >
              Make Payment
            </Link>
          </section>
        )}

        {/* PURCHASE TYPE */}

        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Purchase method
          </p>

          <p className="mt-1 text-lg font-bold text-gray-900">
            {purchase.purchaseType ===
              "CONTRIBUTION" &&
              "Contribute Little by Little"}

            {purchase.purchaseType ===
              "LOAN" &&
              "Buy on Loan"}

            {purchase.purchaseType ===
              "RESELLER" &&
              "Buy to Resell"}

            {purchase.purchaseType ===
              "FULL_PAYMENT" &&
              "Full Payment"}
          </p>

          <span className="mt-3 inline-flex rounded-full bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-600">
            {purchase.status}
          </span>
        </section>

        {/* CONTRIBUTION */}

        {contribution && (
          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">
              Contribution Plan
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Info
                label="Plan"
                value={`${contribution.phases} phases`}
              />

              <Info
                label="Current phase"
                value={`${contribution.currentPhase} / ${contribution.phases}`}
              />

              <Info
                label="Amount per phase"
                value={`₦${contribution.amountPerPhase.toLocaleString()}`}
              />

              <Info
                label="Paid"
                value={`₦${contribution.paidAmount.toLocaleString()}`}
              />

              <Info
                label="Remaining"
                value={`₦${contribution.remainingAmount.toLocaleString()}`}
              />

              <Info
                label="Status"
                value={contribution.status}
              />
            </div>
          </section>
        )}

        {/* LOAN */}

        {loan && (
          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">
              Loan Details
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Info
                label="Product amount"
                value={`₦${loan.productAmount.toLocaleString()}`}
              />

              <Info
                label="Deposit"
                value={`₦${loan.deposit.toLocaleString()}`}
              />

              <Info
                label="Loan amount"
                value={`₦${loan.loanAmount.toLocaleString()}`}
              />

              <Info
                label="Repayment"
                value={`₦${loan.repaymentAmount.toLocaleString()}`}
              />

              <Info
                label="Repayment months"
                value={`${loan.repaymentMonths} months`}
              />

              <Info
                label="Total repayment"
                value={`₦${loan.totalRepayment.toLocaleString()}`}
              />

              <Info
                label="Paid"
                value={`₦${loan.paidAmount.toLocaleString()}`}
              />

              <Info
                label="Remaining"
                value={`₦${loan.remainingAmount.toLocaleString()}`}
              />
            </div>
          </section>
        )}

        {/* RESELLER */}

        {purchase.reseller && (
          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">
              Reseller Purchase
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Info
                label="Quantity"
                value={String(
                  purchase.reseller.quantity
                )}
              />

              <Info
                label="Unit price"
                value={`₦${purchase.reseller.unitPrice.toLocaleString()}`}
              />

              <Info
                label="Total"
                value={`₦${purchase.reseller.totalAmount.toLocaleString()}`}
              />

              <Info
                label="Status"
                value={purchase.reseller.status}
              />
            </div>
          </section>
        )}

        {/* BACK */}

        <Link
          to="/"
          className="block rounded-xl border border-gray-200 bg-white py-3 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Continue Shopping
        </Link>
      </main>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-gray-50 p-4">
      <p className="text-xs font-medium text-gray-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold text-gray-900">
        {value}
      </p>
    </div>
  );
}