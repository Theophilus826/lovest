import { useState } from "react";
import {
  FaMoneyBillWave,
  FaLayerGroup,
  FaCreditCard,
  FaStore,
} from "react-icons/fa";

interface PurchaseOptionsProps {
  productId: string;
  productName: string;
  price: number;
  quantity?: number;
  onClose?: () => void;
}

type PurchaseType =
  | "FULL_PAYMENT"
  | "CONTRIBUTION"
  | "LOAN"
  | "RESELLER";

export default function PurchaseOptions({
  productId,
  productName,
  price,
  quantity = 1,
  onClose,
}: PurchaseOptionsProps) {
  const [purchaseType, setPurchaseType] =
    useState<PurchaseType>("FULL_PAYMENT");

  const [phases, setPhases] = useState(4);

  const [deposit, setDeposit] = useState(0);

  const totalAmount = price * quantity;

  const contributionAmount =
    phases > 0
      ? Math.ceil(totalAmount / phases)
      : totalAmount;

  const loanAmount =
    totalAmount - Number(deposit || 0);

  const options = [
    {
      type: "FULL_PAYMENT" as PurchaseType,
      title: "Buy Now",
      description: "Pay the full amount and complete your purchase.",
      icon: FaMoneyBillWave,
    },
    {
      type: "CONTRIBUTION" as PurchaseType,
      title: "Contribute Little by Little",
      description:
        "Spread your payment across 4, 6, or 7 contribution phases.",
      icon: FaLayerGroup,
    },
    {
      type: "LOAN" as PurchaseType,
      title: "Buy on Loan",
      description:
        "Get the product now and repay according to an approved loan plan.",
      icon: FaCreditCard,
    },
    {
      type: "RESELLER" as PurchaseType,
      title: "Buy to Resell",
      description:
        "Purchase products for your own resale business.",
      icon: FaStore,
    },
  ];

  const handleContinue = () => {
    const purchaseData = {
      productId,
      quantity,
      purchaseType,
      ...(purchaseType === "CONTRIBUTION" && {
        contributionPhases: phases,
      }),
      ...(purchaseType === "LOAN" && {
        deposit: Number(deposit),
      }),
    };

    console.log("PURCHASE DATA:", purchaseData);

    // We will connect this to:
    // POST /api/purchases
    //
    // after the UI flow is confirmed.
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl">
        {/* Header */}

        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Choose how to buy
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {productName}
            </p>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
            >
              ×
            </button>
          )}
        </div>

        {/* Product Total */}

        <div className="mb-5 rounded-2xl bg-orange-50 p-4">
          <p className="text-xs font-medium text-orange-600">
            Total product amount
          </p>

          <p className="mt-1 text-2xl font-bold text-orange-600">
            ₦{totalAmount.toLocaleString()}
          </p>
        </div>

        {/* Purchase Types */}

        <div className="space-y-3">
          {options.map((option) => {
            const Icon = option.icon;

            const selected =
              purchaseType === option.type;

            return (
              <button
                key={option.type}
                type="button"
                onClick={() =>
                  setPurchaseType(option.type)
                }
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  selected
                    ? "border-orange-500 bg-orange-50 ring-2 ring-orange-100"
                    : "border-gray-200 hover:border-orange-300 hover:bg-gray-50"
                }`}
              >
                <div className="flex gap-3">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                      selected
                        ? "bg-orange-500 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <Icon size={18} />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-semibold text-gray-900">
                        {option.title}
                      </h3>

                      <div
                        className={`h-5 w-5 rounded-full border-2 ${
                          selected
                            ? "border-orange-500 bg-orange-500"
                            : "border-gray-300"
                        }`}
                      >
                        {selected && (
                          <div className="m-1 h-1.5 w-1.5 rounded-full bg-white" />
                        )}
                      </div>
                    </div>

                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      {option.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Contribution Settings */}

        {purchaseType === "CONTRIBUTION" && (
          <div className="mt-5 rounded-2xl border border-orange-200 bg-orange-50 p-4">
            <h3 className="font-semibold text-gray-900">
              Choose contribution plan
            </h3>

            <div className="mt-3 grid grid-cols-3 gap-2">
              {[4, 6, 7].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPhases(value)}
                  className={`rounded-xl border px-3 py-3 text-sm font-semibold ${
                    phases === value
                      ? "border-orange-500 bg-orange-500 text-white"
                      : "border-gray-200 bg-white text-gray-700"
                  }`}
                >
                  {value} Phases
                </button>
              ))}
            </div>

            <div className="mt-4 rounded-xl bg-white p-3">
              <p className="text-xs text-gray-500">
                Amount per phase
              </p>

              <p className="mt-1 text-lg font-bold text-orange-600">
                ₦{contributionAmount.toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* Loan Settings */}

        {purchaseType === "LOAN" && (
          <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <h3 className="font-semibold text-gray-900">
              Loan information
            </h3>

            <label className="mt-4 block text-sm font-medium text-gray-700">
              Initial deposit
            </label>

            <input
              type="number"
              min={0}
              max={totalAmount - 1}
              value={deposit}
              onChange={(e) =>
                setDeposit(Number(e.target.value))
              }
              className="mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-4 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              placeholder="Enter deposit"
            />

            <div className="mt-3 rounded-xl bg-white p-3">
              <p className="text-xs text-gray-500">
                Amount requested for loan
              </p>

              <p className="mt-1 text-lg font-bold text-gray-900">
                ₦{Math.max(loanAmount, 0).toLocaleString()}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Final repayment terms will be determined after
                loan approval.
              </p>
            </div>
          </div>
        )}

        {/* Reseller */}

        {purchaseType === "RESELLER" && (
          <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-4">
            <h3 className="font-semibold text-gray-900">
              Reseller purchase
            </h3>

            <p className="mt-1 text-sm leading-6 text-gray-600">
              This purchase will be registered as a reseller
              purchase. You can use the products for your own
              resale business.
            </p>

            <div className="mt-3 rounded-xl bg-white p-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  Quantity
                </span>

                <span className="font-semibold">
                  {quantity}
                </span>
              </div>

              <div className="mt-2 flex justify-between text-sm">
                <span className="text-gray-500">
                  Total
                </span>

                <span className="font-bold text-green-600">
                  ₦{totalAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Continue */}

        <button
          type="button"
          onClick={handleContinue}
          className="mt-6 w-full rounded-2xl bg-orange-500 py-4 font-bold text-white transition hover:bg-orange-600"
        >
          Continue
        </button>
      </div>
    </div>
  );
}