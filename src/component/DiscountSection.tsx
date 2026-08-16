// src/component/DiscountSection.tsx

import { useState } from "react";
import API from "../services/Api";

interface AppliedDiscount {
  code: string;
  amount: number;
}

interface Props {
  subtotal?: number;
  onDiscountApplied?: (
    discount: AppliedDiscount | null
  ) => void;
}

export default function DiscountSection({
  subtotal = 0,
  onDiscountApplied,
}: Props) {
  const [code, setCode] = useState("");
  const [discount, setDiscount] =
    useState<AppliedDiscount | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const applyDiscount = async () => {
    if (!code.trim()) {
      setError("Enter a discount code.");
      return;
    }

    if (subtotal <= 0) {
      setError(
        "Add products to your cart before applying a discount."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await API.post(
        "/discounts/validate",
        {
          code: code.trim().toUpperCase(),
          subtotal,
        }
      );

      const data = response.data;

      if (!data.success) {
        throw new Error(
          data.message ||
            "Invalid discount code"
        );
      }

      const applied = {
        code: data.data.discount.code,
        amount: Number(
          data.data.discountAmount || 0
        ),
      };

      setDiscount(applied);

      onDiscountApplied?.(applied);
    } catch (err: any) {
      console.error(
        "DISCOUNT ERROR:",
        err
      );

      setDiscount(null);

      onDiscountApplied?.(null);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to apply discount"
      );
    } finally {
      setLoading(false);
    }
  };

  const removeDiscount = () => {
    setDiscount(null);
    setCode("");
    setError("");

    onDiscountApplied?.(null);
  };

  return (
    <section className="px-4">
      <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
        {/* HEADER */}

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-500">
            %
          </div>

          <div>
            <h2 className="font-bold text-slate-900">
              Have a discount code?
            </h2>

            <p className="text-xs text-slate-500">
              Apply your promo code and save.
            </p>
          </div>
        </div>

        {/* APPLIED */}

        {discount ? (
          <div className="mt-4 flex items-center justify-between rounded-xl bg-emerald-50 p-4">
            <div>
              <p className="font-mono text-sm font-bold text-emerald-700">
                {discount.code}
              </p>

              <p className="mt-1 text-xs text-emerald-600">
                You saved ₦
                {discount.amount.toLocaleString()}
              </p>
            </div>

            <button
              type="button"
              onClick={removeDiscount}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              Remove
            </button>
          </div>
        ) : (
          <>
            {/* INPUT */}

            <div className="mt-4 flex gap-2">
              <input
                type="text"
                value={code}
                onChange={(event) => {
                  setCode(
                    event.target.value.toUpperCase()
                  );

                  if (error) {
                    setError("");
                  }
                }}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter"
                  ) {
                    applyDiscount();
                  }
                }}
                placeholder="Enter promo code"
                className="h-11 min-w-0 flex-1 rounded-xl border border-slate-200 px-4 text-sm font-medium uppercase outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-50"
              />

              <button
                type="button"
                onClick={applyDiscount}
                disabled={loading}
                className="h-11 rounded-xl bg-orange-500 px-5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "..."
                  : "Apply"}
              </button>
            </div>

            {/* ERROR */}

            {error && (
              <p className="mt-3 text-xs font-medium text-red-600">
                {error}
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}