import { useState, type FormEvent } from "react";

import {
  Eye,
  EyeOff,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  toast,
} from "react-toastify";

import {
  loginUser,
  reset,
} from "../services/AuthSlice";

import {
  useAppDispatch,
  useAppSelector,
} from "../layout/hooks";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { isLoading } = useAppSelector((state) => state.auth);

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    const cleanIdentifier = identifier.trim();

    if (!cleanIdentifier || !password) {
      toast.error(
        "Please enter your email/phone and password",
      );

      return;
    }

    try {
      await dispatch(
        loginUser({
          identifier: cleanIdentifier,
          password,
        }),
      ).unwrap();

      toast.success("Login successful");
      dispatch(reset());
      window.location.replace("/");
    } catch (error) {
      toast.error(
        typeof error === "string" ? error : "Login failed. Please try again.",
      );
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="mb-4 text-3xl">
            🔐
          </div>

          <p className="text-lg font-semibold">
            Logging in...
          </p>

          <p className="mt-2 text-sm text-gray-500">
            Please wait
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // FORM
  // ==========================================

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">

        <h1 className="mb-2 text-center text-3xl font-bold text-orange-500">
          Lovest
        </h1>

        <p className="mb-8 text-center text-gray-500">
          Welcome back
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* IDENTIFIER */}

          <input
            type="text"
            placeholder="Email or Phone Number"
            value={identifier}
            onChange={(e) =>
              setIdentifier(e.target.value)
            }
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
            autoComplete="username"
            disabled={isLoading}
          />

          {/* PASSWORD */}

          <div className="relative">

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              placeholder="Password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-12 outline-none focus:border-orange-500"
              autoComplete="current-password"
              disabled={isLoading}
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(
                  (prev) => !prev,
                )
              }
              className="absolute right-3 top-1/2 -translate-y-1/2"
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>

          </div>

          {/* LOGIN BUTTON */}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-orange-500 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {isLoading
              ? "Logging in..."
              : "Login"}
          </button>

        </form>

        {/* FORGOT PASSWORD */}

        <button
          type="button"
          onClick={() =>
            navigate("/forgot-password")
          }
          className="mt-4 w-full text-center text-sm text-orange-500 hover:underline"
        >
          Forgot Password?
        </button>

        {/* REGISTER */}

        <p className="mt-6 text-center text-sm">
          Don't have an account?{" "}

          <button
            type="button"
            onClick={() =>
              navigate("/register")
            }
            className="font-semibold text-orange-500 hover:underline"
          >
            Register
          </button>
        </p>

      </div>
    </div>
  );
}