import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import API from "../services/Api";


export default function PaymentCallback() {

  const navigate =
    useNavigate();

  const [searchParams] =
    useSearchParams();

  const [message, setMessage] =
    useState(
      "Verifying your payment...",
    );


  useEffect(() => {

    const verifyPayment =
      async () => {

        const reference =
          searchParams.get(
            "reference",
          );


        if (!reference) {

          setMessage(
            "Payment reference was not found.",
          );

          return;
        }


        try {

          const response =
            await API.get(
              `/payments/paystack/verify/${reference}`,
            );


          const data =
            response.data;


          if (!data?.success) {

            setMessage(
              data?.message ||
                "Payment verification failed.",
            );

            return;
          }


          // =====================================
          // GET ORDER ID
          // =====================================

          const orderId =
            sessionStorage.getItem(
              "lastOrderId",
            );


          // =====================================
          // CLEAR CART AFTER SUCCESSFUL PAYMENT
          // =====================================

          // You can clear the cart here
          // depending on your CartContext implementation


          setMessage(
            "Payment successful!",
          );


          setTimeout(() => {

            if (orderId) {

              navigate(
                `/order-success/${orderId}`,
              );

            } else {

              navigate(
                "/",
              );

            }

          }, 1000);


        } catch (error: any) {

          console.error(
            "Payment verification failed:",
            error,
          );


          setMessage(
            error?.response?.data?.message ||
              "Unable to verify your payment.",
          );
        }

      };


    verifyPayment();

  }, [
    navigate,
    searchParams,
  ]);


  return (

    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">

      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-50">

          <div className="h-7 w-7 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" />

        </div>


        <h1 className="mt-6 text-xl font-bold text-gray-900">
          Payment Processing
        </h1>


        <p className="mt-3 text-sm text-gray-500">
          {message}
        </p>

      </div>

    </div>

  );
}