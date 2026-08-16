
import { useState } from "react";
import API from "../services/Api";

interface Shipping {
  courier: string;
  trackingNumber: string;
  shippedAt: string | null;
  estimatedDeliveryDate: string | null;
  deliveredAt: string | null;
  notes: string;
}

interface Order {
  _id: string;
  status: string;
  shipping?: Shipping | null;
}

interface ShippedProps {
  order: Order;
  setOrder: React.Dispatch<React.SetStateAction<Order>>;
}

const Shipped = ({ order, setOrder }: ShippedProps) => {
  const [showShippingModal, setShowShippingModal] =
    useState(false);

  const [shippingLoading, setShippingLoading] =
    useState(false);

  const [deliveryLoading, setDeliveryLoading] =
    useState(false);

  const [shippingError, setShippingError] =
    useState("");

  const [shippingForm, setShippingForm] = useState({
    courier: "",
    trackingNumber: "",
    estimatedDeliveryDate: "",
    notes: "",
  });

  // =========================================================
  // HANDLE SHIPPING FORM
  // =========================================================

  const handleShippingChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setShippingForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // OPEN SHIPPING MODAL
  // =========================================================

  const openShippingModal = () => {
    setShippingError("");

    setShippingForm({
      courier: "",
      trackingNumber: "",
      estimatedDeliveryDate: "",
      notes: "",
    });

    setShowShippingModal(true);
  };

  // =========================================================
  // CLOSE SHIPPING MODAL
  // =========================================================

  const closeShippingModal = () => {
    if (shippingLoading) {
      return;
    }

    setShowShippingModal(false);
    setShippingError("");
  };

  // =========================================================
  // SHIP ORDER
  // =========================================================

  const handleShipOrder = async () => {
    if (!shippingForm.courier.trim()) {
      setShippingError("Courier is required");
      return;
    }

    if (!shippingForm.trackingNumber.trim()) {
      setShippingError("Tracking number is required");
      return;
    }

    try {
      setShippingLoading(true);
      setShippingError("");

      const response = await API.patch(
        `/orders/admin/${order._id}/ship`,
        {
          courier: shippingForm.courier.trim(),

          trackingNumber:
            shippingForm.trackingNumber.trim(),

          estimatedDeliveryDate:
            shippingForm.estimatedDeliveryDate || null,

          notes: shippingForm.notes.trim(),
        }
      );

      if (response.data?.success) {
        setOrder(response.data.data);

        setShowShippingModal(false);

        setShippingForm({
          courier: "",
          trackingNumber: "",
          estimatedDeliveryDate: "",
          notes: "",
        });
      } else {
        setShippingError(
          response.data?.message ||
            "Failed to ship order"
        );
      }
    } catch (error: any) {
      console.error("SHIP ORDER ERROR:", error);

      setShippingError(
        error?.response?.data?.message ||
          "Failed to ship order"
      );
    } finally {
      setShippingLoading(false);
    }
  };

  // =========================================================
  // MARK ORDER AS DELIVERED
  // =========================================================

  const handleDeliverOrder = async () => {
    const confirmed = window.confirm(
      "Are you sure this order has been delivered?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeliveryLoading(true);

      const response = await API.patch(
        `/orders/admin/${order._id}/deliver`
      );

      if (response.data?.success) {
        setOrder(response.data.data);
      } else {
        window.alert(
          response.data?.message ||
            "Failed to mark order as delivered"
        );
      }
    } catch (error: any) {
      console.error(
        "DELIVER ORDER ERROR:",
        error
      );

      window.alert(
        error?.response?.data?.message ||
          "Failed to mark order as delivered"
      );
    } finally {
      setDeliveryLoading(false);
    }
  };

  return (
    <>
      {/* =====================================================
          ORDER ACTIONS
      ===================================================== */}

      <div className="flex flex-wrap gap-3">
        {/* PROCESSING → SHIPPED */}

        {order.status === "processing" && (
          <button
            type="button"
            onClick={openShippingModal}
            disabled={
              shippingLoading ||
              deliveryLoading
            }
            className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {shippingLoading
              ? "Shipping..."
              : "Ship Order"}
          </button>
        )}

        {/* SHIPPED → DELIVERED */}

        {order.status === "shipped" && (
          <button
            type="button"
            onClick={handleDeliverOrder}
            disabled={
              shippingLoading ||
              deliveryLoading
            }
            className="rounded-lg bg-green-600 px-5 py-3 font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deliveryLoading
              ? "Updating..."
              : "Mark as Delivered"}
          </button>
        )}

        {/* DELIVERED */}

        {order.status === "delivered" && (
          <div className="rounded-lg bg-green-50 px-5 py-3 font-medium text-green-700">
            Order Delivered
          </div>
        )}
      </div>

      {/* =====================================================
          SHIPPING INFORMATION
      ===================================================== */}

      {order.shipping && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-5">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Shipping Information
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">
                Courier
              </p>

              <p className="font-medium text-gray-900">
                {order.shipping.courier || "—"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Tracking Number
              </p>

              <p className="font-medium text-gray-900">
                {order.shipping.trackingNumber || "—"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Shipped At
              </p>

              <p className="font-medium text-gray-900">
                {order.shipping.shippedAt
                  ? new Date(
                      order.shipping.shippedAt
                    ).toLocaleString()
                  : "—"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Estimated Delivery
              </p>

              <p className="font-medium text-gray-900">
                {order.shipping
                  .estimatedDeliveryDate
                  ? new Date(
                      order.shipping.estimatedDeliveryDate
                    ).toLocaleDateString()
                  : "—"}
              </p>
            </div>

            {order.shipping.deliveredAt && (
              <div>
                <p className="text-sm text-gray-500">
                  Delivered At
                </p>

                <p className="font-medium text-gray-900">
                  {new Date(
                    order.shipping.deliveredAt
                  ).toLocaleString()}
                </p>
              </div>
            )}

            {order.shipping.notes && (
              <div className="sm:col-span-2">
                <p className="text-sm text-gray-500">
                  Shipping Notes
                </p>

                <p className="font-medium text-gray-900">
                  {order.shipping.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================
          SHIPPING MODAL
      ===================================================== */}

      {showShippingModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="shipping-modal-title"
        >
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            {/* HEADER */}

            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2
                  id="shipping-modal-title"
                  className="text-xl font-bold text-gray-900"
                >
                  Ship Order
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Enter the shipping information
                  for this order.
                </p>
              </div>

              <button
                type="button"
                onClick={closeShippingModal}
                disabled={shippingLoading}
                aria-label="Close shipping modal"
                className="text-2xl text-gray-400 transition hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                ×
              </button>
            </div>

            {/* ERROR */}

            {shippingError && (
              <div
                className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600"
                role="alert"
              >
                {shippingError}
              </div>
            )}

            {/* COURIER */}

            <div className="mb-4">
              <label
                htmlFor="courier"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Courier
              </label>

              <input
                id="courier"
                type="text"
                name="courier"
                value={shippingForm.courier}
                onChange={handleShippingChange}
                placeholder="e.g. GIG Logistics"
                disabled={shippingLoading}
                autoComplete="organization"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            {/* TRACKING NUMBER */}

            <div className="mb-4">
              <label
                htmlFor="trackingNumber"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Tracking Number
              </label>

              <input
                id="trackingNumber"
                type="text"
                name="trackingNumber"
                value={
                  shippingForm.trackingNumber
                }
                onChange={handleShippingChange}
                placeholder="Enter tracking number"
                disabled={shippingLoading}
                autoComplete="off"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            {/* ESTIMATED DELIVERY */}

            <div className="mb-4">
              <label
                htmlFor="estimatedDeliveryDate"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Estimated Delivery
              </label>

              <input
                id="estimatedDeliveryDate"
                type="date"
                name="estimatedDeliveryDate"
                value={
                  shippingForm.estimatedDeliveryDate
                }
                onChange={handleShippingChange}
                disabled={shippingLoading}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            {/* NOTES */}

            <div className="mb-6">
              <label
                htmlFor="shippingNotes"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Shipping Notes
              </label>

              <textarea
                id="shippingNotes"
                name="notes"
                value={shippingForm.notes}
                onChange={handleShippingChange}
                rows={3}
                placeholder="Optional delivery instructions"
                disabled={shippingLoading}
                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            {/* ACTIONS */}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={closeShippingModal}
                disabled={shippingLoading}
                className="rounded-lg border border-gray-300 px-5 py-3 font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleShipOrder}
                disabled={shippingLoading}
                className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {shippingLoading
                  ? "Shipping..."
                  : "Ship Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Shipped;

