import {
FaArrowLeft,
FaPhoneAlt,
FaWhatsapp,
FaHeadset,
FaClock,
FaChevronRight,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function Contact() {
const navigate = useNavigate();

// =====================================
// BUSINESS CONTACT DETAILS
// =====================================

const phoneNumber = "09039328660";

// Use international format without +
const whatsappNumber = "09039328660";

// =====================================
// ACTIONS
// =====================================

const handleCall = () => {
window.location.href = `tel:${phoneNumber}`;
};

const handleWhatsApp = () => {
window.open(
`https://wa.me/${whatsappNumber}`,
"_blank"
);
};

return ( <div className="min-h-screen bg-gray-50">

```
  {/* =====================================
      HEADER
  ===================================== */}

  <header className="sticky top-0 z-50 border-b border-gray-100 bg-white">
    <div className="mx-auto flex h-16 max-w-3xl items-center gap-4 px-4">

      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-600 transition hover:bg-gray-100"
        aria-label="Go back"
      >
        <FaArrowLeft />
      </button>

      <div>
        <h1 className="text-lg font-bold text-gray-900">
          Contact Us
        </h1>

        <p className="text-xs text-gray-500">
          We are here to help you
        </p>
      </div>

    </div>
  </header>


  {/* =====================================
      MAIN
  ===================================== */}

  <main className="mx-auto max-w-3xl px-4 py-8">

    {/* =====================================
        HERO
    ===================================== */}

    <section className="rounded-3xl bg-gradient-to-br from-orange-500 to-orange-600 px-6 py-10 text-center text-white shadow-sm">

      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-3xl">
        <FaHeadset />
      </div>

      <h2 className="mt-5 text-2xl font-bold">
        How can we help?
      </h2>

      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-orange-100">
        Our support team is available to assist you with
        orders, payments, delivery, returns and other enquiries.
      </p>

      <div className="mt-5 flex items-center justify-center gap-2 text-sm font-semibold">
        <FaClock />
        Available 24 hours, 7 days a week
      </div>

    </section>


    {/* =====================================
        CONTACT OPTIONS
    ===================================== */}

    <section className="mt-6">

      <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500">
        Choose how to contact us
      </h3>


      {/* =====================================
          CALL
      ===================================== */}

      <button
        type="button"
        onClick={handleCall}
        className="flex w-full items-center justify-between rounded-2xl bg-white p-5 text-left shadow-sm transition hover:shadow-md"
      >

        <div className="flex items-center gap-4">

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-2xl text-orange-500">
            <FaPhoneAlt />
          </div>

          <div>

            <h4 className="font-bold text-gray-900">
              Call Customer Support
            </h4>

            <p className="mt-1 text-sm text-gray-500">
              Speak directly with our support team.
            </p>

            <p className="mt-2 text-sm font-semibold text-orange-500">
              {phoneNumber}
            </p>

          </div>

        </div>

        <FaChevronRight className="text-gray-400" />

      </button>


      {/* =====================================
          WHATSAPP
      ===================================== */}

      <button
        type="button"
        onClick={handleWhatsApp}
        className="mt-4 flex w-full items-center justify-between rounded-2xl bg-white p-5 text-left shadow-sm transition hover:shadow-md"
      >

        <div className="flex items-center gap-4">

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-2xl text-green-500">
            <FaWhatsapp />
          </div>

          <div>

            <h4 className="font-bold text-gray-900">
              Chat with us on WhatsApp
            </h4>

            <p className="mt-1 text-sm text-gray-500">
              Send us a message and our team will respond.
            </p>

            <p className="mt-2 text-sm font-semibold text-green-600">
              Chat now
            </p>

          </div>

        </div>

        <FaChevronRight className="text-gray-400" />

      </button>

    </section>


    {/* =====================================
        SUPPORT INFORMATION
    ===================================== */}

    <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-5">

      <h3 className="font-bold text-gray-900">
        What can we help you with?
      </h3>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">

        <div className="rounded-xl bg-gray-50 p-4">
          <p className="font-semibold text-gray-800">
            Orders
          </p>

          <p className="mt-1 text-xs leading-5 text-gray-500">
            Help with placing and tracking your orders.
          </p>
        </div>

        <div className="rounded-xl bg-gray-50 p-4">
          <p className="font-semibold text-gray-800">
            Payments
          </p>

          <p className="mt-1 text-xs leading-5 text-gray-500">
            Questions about payments and transactions.
          </p>
        </div>

        <div className="rounded-xl bg-gray-50 p-4">
          <p className="font-semibold text-gray-800">
            Delivery
          </p>

          <p className="mt-1 text-xs leading-5 text-gray-500">
            Shipping and delivery assistance.
          </p>
        </div>

        <div className="rounded-xl bg-gray-50 p-4">
          <p className="font-semibold text-gray-800">
            Returns & Refunds
          </p>

          <p className="mt-1 text-xs leading-5 text-gray-500">
            Help with returns, cancellations and refunds.
          </p>
        </div>

      </div>

    </section>


    {/* =====================================
        FOOTER MESSAGE
    ===================================== */}

    <p className="mt-8 text-center text-xs leading-5 text-gray-400">
      We are committed to providing you with the best possible
      shopping experience and customer support.
    </p>

  </main>

</div>

);
}
