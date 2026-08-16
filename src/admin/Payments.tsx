
import { useEffect, useState } from "react";
import { FaSave, FaUniversity, FaLink } from "react-icons/fa";
import API from "../services/Api";

interface PaymentSettings {
  bankName: string;
  accountName: string;
  accountNumber: string;
  paymentLink: string;
}

export default function AdminPayment() {
  const [settings, setSettings] = useState<PaymentSettings>({
    bankName: "",
    accountName: "",
    accountNumber: "",
    paymentLink: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ==========================================
  // LOAD PAYMENT SETTINGS
  // ==========================================

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await API.get("/payments");

        console.log("PAYMENT SETTINGS:", response.data);

        const data = response.data?.data || response.data;

        setSettings({
          bankName: data?.bankName || "",
          accountName: data?.accountName || "",
          accountNumber: data?.accountNumber || "",
          paymentLink: data?.paymentLink || "",
        });
      } catch (err: any) {
        console.error(
          "LOAD PAYMENT SETTINGS ERROR:",
          err?.response?.data || err
        );

        setError(
          err?.response?.data?.message ||
            "Failed to load payment settings."
        );
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // ==========================================
  // HANDLE INPUT
  // ==========================================

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;

    setSettings((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // SAVE
  // ==========================================

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage("");
      setError("");

      if (!settings.bankName.trim()) {
        setError("Bank name is required.");
        return;
      }

      if (!settings.accountName.trim()) {
        setError("Account name is required.");
        return;
      }

      if (!settings.accountNumber.trim()) {
        setError("Account number is required.");
        return;
      }

      const response = await API.put("/payments", {
        bankName: settings.bankName.trim(),
        accountName: settings.accountName.trim(),
        accountNumber: settings.accountNumber.trim(),
        paymentLink: settings.paymentLink.trim(),
      });

      console.log("SAVE PAYMENT RESPONSE:", response.data);

      setMessage(
        response.data?.message ||
          "Payment settings saved successfully."
      );
    } catch (err: any) {
      console.error(
        "SAVE PAYMENT ERROR:",
        err?.response?.data || err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to save payment settings."
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
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-gray-500">
          Loading payment settings...
        </p>
      </div>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">

        {/* HEADER */}

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Payment Settings
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage the bank account and payment link customers
            will use to make payments.
          </p>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-5 rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        {/* SUCCESS */}

        {message && (
          <div className="mb-5 rounded-xl border border-green-100 bg-green-50 p-4 text-sm font-medium text-green-600">
            {message}
          </div>
        )}

        {/* BANK DETAILS */}

        <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">

          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-50">
              <FaUniversity className="text-orange-500" />
            </div>

            <div>
              <h2 className="font-bold text-gray-900">
                Bank Account
              </h2>

              <p className="text-xs text-gray-500">
                Customers can use these details for bank transfer.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-5">

            {/* BANK NAME */}

            <div>
              <label
                htmlFor="bankName"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Bank Name
              </label>

              <input
                id="bankName"
                name="bankName"
                type="text"
                value={settings.bankName}
                onChange={handleChange}
                placeholder="e.g. Access Bank"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            {/* ACCOUNT NAME */}

            <div>
              <label
                htmlFor="accountName"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Account Name
              </label>

              <input
                id="accountName"
                name="accountName"
                type="text"
                value={settings.accountName}
                onChange={handleChange}
                placeholder="e.g. TinkReward Limited"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            {/* ACCOUNT NUMBER */}

            <div>
              <label
                htmlFor="accountNumber"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Account Number
              </label>

              <input
                id="accountNumber"
                name="accountNumber"
                type="text"
                inputMode="numeric"
                value={settings.accountNumber}
                onChange={handleChange}
                placeholder="Enter account number"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>

          </div>
        </section>

        {/* PAYMENT LINK */}

        <section className="mt-5 rounded-2xl bg-white p-5 shadow-sm sm:p-6">

          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-50">
              <FaLink className="text-orange-500" />
            </div>

            <div>
              <h2 className="font-bold text-gray-900">
                Online Payment Link
              </h2>

              <p className="text-xs text-gray-500">
                Add the payment link customers should use for
                online payments.
              </p>
            </div>
          </div>

          <div className="mt-5">

            <label
              htmlFor="paymentLink"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Payment Link
            </label>

            <input
              id="paymentLink"
              name="paymentLink"
              type="url"
              value={settings.paymentLink}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />

            <p className="mt-2 text-xs text-gray-400">
              Example: Paystack, Flutterwave, or another payment
              provider link.
            </p>

          </div>
        </section>

        {/* SAVE BUTTON */}

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-4 font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          <FaSave />

          {saving
            ? "Saving..."
            : "Save Payment Settings"}
        </button>

      </main>
    </div>
  );
}

