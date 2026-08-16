import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FaArrowLeft,
} from "react-icons/fa";

import API from "../services/Api";

interface Purchase {
  _id: string;

  user?: {
    _id?: string;
    name?: string;
    email?: string;
    phone?: string;
  };

  product?: {
    _id?: string;
    name?: string;
    price?: number;
    image?: string;
  };

  quantity: number;
  unitPrice: number;
  totalAmount: number;

  purchaseType: string;
  status: string;

  payment?: {
    requiredAmount: number;
    paidAmount: number;
    remainingAmount: number;
    status: string;
    paidAt?: string;
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

  receiving?: {
    totalReceived: number;
    remainingAmount: number;
    status: string;
    payments?: {
      amount?: number;
      paidAmount?: number;
      reference?: string;
      paidAt?: string;
    }[];
  };

  createdAt: string;
}

export default function AdminPurchaseDetails() {
  const { id } = useParams<{ id: string }>();

  const [purchase, setPurchase] =
    useState<Purchase | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadPurchase = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await API.get(
          `/purchases/${id}`
        );

        setPurchase(
          response.data?.data || null
        );
      } catch (error: any) {
        console.error(
          "Failed to load purchase:",
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
      loadPurchase();
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
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
        <p className="text-sm text-red-500">
          {error || "Purchase not found."}
        </p>

        <Link
          to="/admin/purchases"
          className="mt-5 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white"
        >
          Back to Purchases
        </Link>
      </div>
    );
  }

  const money = (amount = 0) =>
    `₦${Number(amount).toLocaleString()}`;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}

      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">

          <Link
            to="/admin/purchases"
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

      <main className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">

        {/* CUSTOMER */}

        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">
            Customer
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">

            <div>
              <p className="text-xs text-gray-500">
                Name
              </p>

              <p className="mt-1 font-semibold">
                {purchase.user?.name || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Email
              </p>

              <p className="mt-1 font-semibold">
                {purchase.user?.email || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Phone
              </p>

              <p className="mt-1 font-semibold">
                {purchase.user?.phone || "N/A"}
              </p>
            </div>

          </div>
        </section>


        {/* PRODUCT */}

        <section className="rounded-2xl bg-white p-5 shadow-sm">

          <h2 className="text-lg font-bold text-gray-900">
            Product
          </h2>

          <div className="mt-4 flex gap-4">

            {purchase.product?.image ? (
              <img
                src={purchase.product.image}
                alt={purchase.product.name}
                className="h-24 w-24 rounded-xl object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-gray-100 text-xs text-gray-400">
                No image
              </div>
            )}

            <div>
              <h3 className="font-bold text-gray-900">
                {purchase.product?.name || "Product"}
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Quantity: {purchase.quantity}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Unit price: {money(purchase.unitPrice)}
              </p>

              <p className="mt-2 text-lg font-bold text-orange-500">
                {money(purchase.totalAmount)}
              </p>
            </div>

          </div>

        </section>


        {/* PURCHASE TYPE */}

        <section className="rounded-2xl bg-white p-5 shadow-sm">

          <h2 className="text-lg font-bold text-gray-900">
            Purchase method
          </h2>

          <div className="mt-4">
            <span className="rounded-full bg-orange-50 px-4 py-2 text-sm font-bold text-orange-600">
              {purchase.purchaseType}
            </span>

            <span className="ml-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-600">
              {purchase.status}
            </span>
          </div>

        </section>


        {/* CONTRIBUTION */}

        {purchase.purchaseType ===
          "CONTRIBUTION" &&
          purchase.contribution && (
            <section className="rounded-2xl bg-white p-5 shadow-sm">

              <h2 className="text-lg font-bold text-gray-900">
                Contribution
              </h2>

              <div className="mt-4 grid gap-4 sm:grid-cols-4">

                <Info
                  label="Plan"
                  value={`${purchase.contribution.phases} phases`}
                />

                <Info
                  label="Current phase"
                  value={`${purchase.contribution.currentPhase}`}
                />

                <Info
                  label="Paid"
                  value={money(
                    purchase.contribution.paidAmount
                  )}
                />

                <Info
                  label="Remaining"
                  value={money(
                    purchase.contribution.remainingAmount
                  )}
                />

              </div>

              <div className="mt-5 rounded-xl bg-orange-50 p-4">

                <p className="text-sm text-gray-600">
                  Amount per phase
                </p>

                <p className="mt-1 text-xl font-bold text-orange-500">
                  {money(
                    purchase.contribution
                      .amountPerPhase
                  )}
                </p>

              </div>

            </section>
          )}


        {/* LOAN */}

        {purchase.purchaseType === "LOAN" &&
          purchase.loan && (
            <section className="rounded-2xl bg-white p-5 shadow-sm">

              <h2 className="text-lg font-bold text-gray-900">
                Loan
              </h2>

              <div className="mt-4 grid gap-4 sm:grid-cols-3">

                <Info
                  label="Product amount"
                  value={money(
                    purchase.loan.productAmount
                  )}
                />

                <Info
                  label="Deposit"
                  value={money(
                    purchase.loan.deposit
                  )}
                />

                <Info
                  label="Loan amount"
                  value={money(
                    purchase.loan.loanAmount
                  )}
                />

                <Info
                  label="Approved"
                  value={money(
                    purchase.loan.approvedAmount
                  )}
                />

                <Info
                  label="Total repayment"
                  value={money(
                    purchase.loan.totalRepayment
                  )}
                />

                <Info
                  label="Remaining"
                  value={money(
                    purchase.loan.remainingAmount
                  )}
                />

              </div>

            </section>
          )}


        {/* RESELL */}

        {purchase.purchaseType === "RESELL" &&
          purchase.reseller && (
            <section className="rounded-2xl bg-white p-5 shadow-sm">

              <h2 className="text-lg font-bold text-gray-900">
                Buy to Resell
              </h2>

              <div className="mt-4 grid gap-4 sm:grid-cols-3">

                <Info
                  label="Quantity"
                  value={`${purchase.reseller.quantity}`}
                />

                <Info
                  label="Unit price"
                  value={money(
                    purchase.reseller.unitPrice
                  )}
                />

                <Info
                  label="Total"
                  value={money(
                    purchase.reseller.totalAmount
                  )}
                />

              </div>

            </section>
          )}


        {/* RECEIVING */}

        {purchase.receiving && (
          <section className="rounded-2xl bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Receiving
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Payments received from customer.
                </p>
              </div>

              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold">
                {purchase.receiving.status}
              </span>

            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">

              <div className="rounded-xl bg-green-50 p-4">
                <p className="text-sm text-gray-600">
                  Total received
                </p>

                <p className="mt-1 text-2xl font-bold text-green-600">
                  {money(
                    purchase.receiving
                      .totalReceived
                  )}
                </p>
              </div>

              <div className="rounded-xl bg-orange-50 p-4">
                <p className="text-sm text-gray-600">
                  Remaining
                </p>

                <p className="mt-1 text-2xl font-bold text-orange-500">
                  {money(
                    purchase.receiving
                      .remainingAmount
                  )}
                </p>
              </div>

            </div>

          </section>
        )}

      </main>
    </div>
  );
}


/*
|--------------------------------------------------------------------------
| INFO COMPONENT
|--------------------------------------------------------------------------
*/

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs text-gray-500">
        {label}
      </p>

      <p className="mt-1 font-bold text-gray-900">
        {value}
      </p>
    </div>
  );
}