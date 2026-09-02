import { useState, type ChangeEvent, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

import { registerUser, reset } from "../services/AuthSlice";
import {
  useAppDispatch,
  useAppSelector,
} from "../layout/hooks";

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function Register() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { isLoading } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState<RegisterForm>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  // ==========================
  // HANDLE INPUT CHANGES
  // ==========================
  const onChange = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================
  // HANDLE FORM SUBMISSION
  // ==========================
  const onSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const name = formData.name.trim();
    const email = formData.email.trim();
    const password = formData.password;
    const confirmPassword =
      formData.confirmPassword;

    // Name validation
    if (!name) {
      toast.error("Please enter your name");
      return;
    }

    // Email validation
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    // Basic email validation
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Password validation
    if (!password) {
      toast.error("Please enter a password");
      return;
    }

    if (password.length < 6) {
      toast.error(
        "Password must be at least 6 characters"
      );
      return;
    }

    // Confirm password validation
    if (!confirmPassword) {
      toast.error("Please confirm your password");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    // ==========================
    // REGISTER USER
    // ==========================
    try {
      await dispatch(
        registerUser({
          name,
          email,
          password,
          confirmPassword,
        })
      ).unwrap();

      toast.success("Account created successfully");
      dispatch(reset());
      window.location.replace("/");
    } catch (error) {
      toast.error(
        axios.isAxiosError(error) && error.code === "ECONNABORTED"
          ? "Server is waking up. Please try again in a moment."
          : typeof error === "string"
            ? error
            : "Registration failed. Please try again.",
      );
    }
  };

  // ==========================
  // RENDER
  // ==========================
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        {/* Logo / Title */}
        <h1 className="mb-2 text-center text-3xl font-bold text-orange-500">
          Lovest
        </h1>

        <p className="mb-8 text-center text-gray-500">
          Create your account
        </p>

        {/* Registration Form */}
        <form
          onSubmit={onSubmit}
          className="space-y-5"
        >
          {/* Name */}
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={onChange}
            autoComplete="name"
            disabled={isLoading}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-orange-500 disabled:bg-gray-100"
          />

          {/* Email */}
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={onChange}
            autoComplete="email"
            disabled={isLoading}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-orange-500 disabled:bg-gray-100"
          />

          {/* Password */}
          <div className="relative">
            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={onChange}
              autoComplete="new-password"
              disabled={isLoading}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-12 outline-none transition focus:border-orange-500 disabled:bg-gray-100"
            />

            <button
              type="button"
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
              onClick={() =>
                setShowPassword(
                  (prev) => !prev
                )
              }
              disabled={isLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-gray-700 disabled:cursor-not-allowed"
            >
              {showPassword ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <input
              type={
                showConfirmPassword
                  ? "text"
                  : "password"
              }
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={onChange}
              autoComplete="new-password"
              disabled={isLoading}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-12 outline-none transition focus:border-orange-500 disabled:bg-gray-100"
            />

            <button
              type="button"
              aria-label={
                showConfirmPassword
                  ? "Hide confirm password"
                  : "Show confirm password"
              }
              onClick={() =>
                setShowConfirmPassword(
                  (prev) => !prev
                )
              }
              disabled={isLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-gray-700 disabled:cursor-not-allowed"
            >
              {showConfirmPassword ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-orange-500 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {isLoading
              ? "Creating Account..."
              : "Create Account"}
          </button>
        </form>

        {/* Login Link */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            disabled={isLoading}
            className="font-semibold text-orange-500 hover:underline disabled:cursor-not-allowed"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}

