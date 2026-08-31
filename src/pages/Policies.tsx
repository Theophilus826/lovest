
import { Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaBox,
  FaUndo,
  FaBan,
  FaMoneyBillWave,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
} from "react-icons/fa";

export default function Policies() {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* =========================
          HEADER
      ========================== */}

      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-3 px-4">

          <Link
            to="/"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-600 transition hover:bg-gray-100"
            aria-label="Go back"
          >
            <FaArrowLeft />
          </Link>

          <div>
            <h1 className="text-lg font-bold text-gray-900">
              Policies & Information
            </h1>

            <p className="text-xs text-gray-500">
              Shipping, returns, refunds and contact information
            </p>
          </div>

        </div>
      </header>


      {/* =========================
          HERO
      ========================== */}

      <section className="border-b border-orange-100 bg-orange-50">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">

          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Shop with confidence
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">
            We are committed to providing a transparent and reliable
            shopping experience. Please review our shipping, return,
            cancellation and refund policies before placing your order.
          </p>

        </div>
      </section>


      {/* =========================
          MAIN
      ========================== */}

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:py-10">


        {/* =========================
            SHIPPING POLICY
        ========================== */}

        <section
          id="shipping"
          className="overflow-hidden rounded-2xl bg-white shadow-sm"
        >

          <div className="flex items-center gap-3 border-b border-gray-100 p-5 sm:p-6">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
              <FaBox className="text-lg" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Shipping & Delivery Policy
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Information about order processing and delivery.
              </p>
            </div>

          </div>


          <div className="space-y-5 p-5 text-sm leading-6 text-gray-600 sm:p-6">

            <div>
              <h3 className="font-semibold text-gray-900">
                Order Processing
              </h3>

              <p className="mt-1">
                Orders are processed after payment confirmation or after
                the required approval process has been completed, depending
                on the purchase method selected.
              </p>
            </div>


            <div>
              <h3 className="font-semibold text-gray-900">
                Delivery Time
              </h3>

              <p className="mt-1">
                Delivery timelines may vary depending on your location,
                product availability and the selected delivery method.
                Customers will be notified when their order is ready for
                delivery or has been shipped.
              </p>
            </div>


            <div>
              <h3 className="font-semibold text-gray-900">
                Delivery Address
              </h3>

              <p className="mt-1">
                Customers are responsible for providing a complete and
                accurate delivery address and valid contact information.
                We may not be responsible for delays caused by incorrect
                delivery details.
              </p>
            </div>


            <div>
              <h3 className="font-semibold text-gray-900">
                Delivery Charges
              </h3>

              <p className="mt-1">
                Delivery charges, where applicable, will be displayed
                during checkout before you complete your purchase.
              </p>
            </div>

          </div>

        </section>


        {/* =========================
            RETURN POLICY
        ========================== */}

        <section
          id="returns"
          className="overflow-hidden rounded-2xl bg-white shadow-sm"
        >

          <div className="flex items-center gap-3 border-b border-gray-100 p-5 sm:p-6">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
              <FaUndo className="text-lg" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Return Policy
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Conditions for returning eligible products.
              </p>
            </div>

          </div>


          <div className="space-y-5 p-5 text-sm leading-6 text-gray-600 sm:p-6">

            <p>
              We want our customers to be satisfied with their purchases.
              If you receive an incorrect, damaged or defective product,
              please contact us as soon as possible.
            </p>


            <div>
              <h3 className="font-semibold text-gray-900">
                Eligible Returns
              </h3>

              <p className="mt-1">
                Products may be eligible for return when they are damaged,
                defective, incorrect, or significantly different from the
                product ordered.
              </p>
            </div>


            <div>
              <h3 className="font-semibold text-gray-900">
                Return Condition
              </h3>

              <p className="mt-1">
                Returned products should be in their original condition,
                including original packaging, accessories and any included
                materials where applicable.
              </p>
            </div>


            <div>
              <h3 className="font-semibold text-gray-900">
                Return Request
              </h3>

              <p className="mt-1">
                Please contact our customer support team before returning
                any product. Our team will provide instructions regarding
                the return process.
              </p>
            </div>

          </div>

        </section>


        {/* =========================
            CANCELLATION
        ========================== */}

        <section
          id="cancellation"
          className="overflow-hidden rounded-2xl bg-white shadow-sm"
        >

          <div className="flex items-center gap-3 border-b border-gray-100 p-5 sm:p-6">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500">
              <FaBan className="text-lg" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Cancellation Policy
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Information about cancelling a purchase.
              </p>
            </div>

          </div>


          <div className="space-y-5 p-5 text-sm leading-6 text-gray-600 sm:p-6">

            <p>
              Customers may request to cancel an order before it has been
              processed, prepared for delivery or shipped.
            </p>


            <div>
              <h3 className="font-semibold text-gray-900">
                Cancellation Requests
              </h3>

              <p className="mt-1">
                To request a cancellation, contact our support team and
                provide your purchase or order reference number.
              </p>
            </div>


            <div>
              <h3 className="font-semibold text-gray-900">
                Orders Already Processed
              </h3>

              <p className="mt-1">
                Once an order has entered processing, shipping or delivery,
                cancellation may no longer be possible.
              </p>
            </div>


            <div>
              <h3 className="font-semibold text-gray-900">
                Contribution and Loan Purchases
              </h3>

              <p className="mt-1">
                Cancellation of contribution plans or loan purchases may be
                subject to review based on the current payment status and
                the terms of the approved purchase arrangement.
              </p>
            </div>

          </div>

        </section>


        {/* =========================
            REFUND POLICY
        ========================== */}

        <section
          id="refunds"
          className="overflow-hidden rounded-2xl bg-white shadow-sm"
        >

          <div className="flex items-center gap-3 border-b border-gray-100 p-5 sm:p-6">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <FaMoneyBillWave className="text-lg" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Refund Policy
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Information about eligible refunds.
              </p>
            </div>

          </div>


          <div className="space-y-5 p-5 text-sm leading-6 text-gray-600 sm:p-6">

            <p>
              Refunds may be considered after a cancellation or approved
              return request, depending on the circumstances of the
              purchase.
            </p>


            <div>
              <h3 className="font-semibold text-gray-900">
                Refund Approval
              </h3>

              <p className="mt-1">
                All refund requests are reviewed before approval. We may
                request additional information to verify the purchase or
                reported issue.
              </p>
            </div>


            <div>
              <h3 className="font-semibold text-gray-900">
                Refund Processing
              </h3>

              <p className="mt-1">
                Once approved, refunds will be processed using the
                appropriate payment method or another agreed refund method.
              </p>
            </div>


            <div>
              <h3 className="font-semibold text-gray-900">
                Non-Refundable Charges
              </h3>

              <p className="mt-1">
                Certain delivery charges, service charges or costs already
                incurred during order processing may not be refundable,
                where applicable.
              </p>
            </div>

          </div>

        </section>


        {/* =========================
            CONTACT
        ========================== */}

        <section
          id="contact"
          className="overflow-hidden rounded-2xl bg-gray-900 text-white shadow-sm"
        >

          <div className="p-6 sm:p-8">

            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold">
                Contact Us
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-300">
                If you have questions about your order, delivery, payment,
                returns or refunds, our support team is available to help.
              </p>
            </div>


            <div className="mt-8 grid gap-5 sm:grid-cols-2">

              {/* ADDRESS */}

              <div className="flex gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
                  <FaMapMarkerAlt />
                </div>

                <div>
                  <p className="font-semibold">
                    Our Address
                  </p>

                  <p className="mt-1 text-sm leading-6 text-gray-300">
                    BRANCH 12 AGURA ROAD AGOIKA, 
                    <br />
                    OGUN STATE, Nigeria
                  </p>
                </div>

              </div>


              {/* PHONE */}

              <div className="flex gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
                  <FaPhoneAlt />
                </div>

                <div>
                  <p className="font-semibold">
                    Phone Number
                  </p>

                  <a
                    href="tel:+23439328660"
                    className="mt-1 block text-sm text-gray-300 transition hover:text-orange-400"
                  >
                    +234 9039328660
                  </a>
                </div>

              </div>


              {/* EMAIL */}

              <div className="flex gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
                  <FaEnvelope />
                </div>

                <div>
                  <p className="font-semibold">
                    Email Address
                  </p>

                  <a
                    href="mailto:info@yourbusiness.com"
                    className="mt-1 block text-sm text-gray-300 transition hover:text-orange-400"
                  >
                    theophilustelecoms@gmail.com
                  </a>
                </div>

              </div>


              {/* HOURS */}

              <div className="flex gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
                  <FaClock />
                </div>

                <div>
                  <p className="font-semibold">
                    Business Hours
                  </p>

                  <p className="mt-1 text-sm text-gray-300">
                    Monday – Saturday
                    <br />
                    9:00 AM – 6:00 PM
                  </p>
                </div>

              </div>

            </div>

          </div>

        </section>


        {/* =========================
            NOTICE
        ========================== */}

        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center text-xs leading-5 text-gray-500">
          By placing an order, you acknowledge that you have read and
          understood our shipping, return, cancellation and refund policies.
        </div>

      </main>
    </div>
  );
}

