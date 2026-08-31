import { FaWhatsapp } from "react-icons/fa";

export default function WhatsAppSupport() {
// =====================================
// BUSINESS WHATSAPP NUMBER
// =====================================

const whatsappNumber = "09039328660";

const handleWhatsApp = () => {
const message = encodeURIComponent(
"Hello, I need help with something."
);


window.open(
  `https://wa.me/${whatsappNumber}?text=${message}`,
  "_blank"
);


};

return ( <button
   type="button"
   onClick={handleWhatsApp}
   className="fixed bottom-14 right-5 z-50 flex h-13 w-13 items-center justify-center rounded-full bg-green-500 text-2xl text-white shadow-lg transition hover:scale-110 hover:bg-green-600"
   aria-label="Chat with us on WhatsApp"
   title="Chat with us"
 > <FaWhatsapp /> </button>
);
}
