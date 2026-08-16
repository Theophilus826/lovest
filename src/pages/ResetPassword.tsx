import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
import { toast } from "react-toastify";

import {
  resetPassword,
  reset,
} from "../services/AuthSlice";

import type {
  RootState,
  AppDispatch,
} from "../layout/store";

export default function ResetPassword() {
  const { token } = useParams<{
    token: string;
  }>();

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [password, setPassword] =
    useState<string>("");

  const [confirmPassword, setConfirmPassword] =
    useState<string>("");

  const {
    isLoading,
    isError,
    isSuccess,
    message,
  } = useSelector(
    (state: RootState) => state.auth,
  );

  // ==========================
  // ERROR
  // ==========================

  useEffect(() => {
    if (!isError) {
      return;
    }

    toast.error(
      message || "Failed to reset password.",
    );

    dispatch(reset());
  }, [
    isError,
    message,
    dispatch,
  ]);

  // ==========================
  // SUCCESS
  // ==========================

  useEffect(() => {
    if (!isSuccess) {
      return;
    }

    toast.success(
      message ||
        "Password reset successfully.",
    );

    dispatch(reset());

    navigate("/login", {
      replace: true,
    });
  }, [
    isSuccess,
    message,
    dispatch,
    navigate,
  ]);

  // ==========================
  // SUBMIT
  // ==========================

  const handleSubmit = (
    e: FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    if (isLoading) {
      return;
    }

    if (!token) {
      toast.error(
        "Invalid or expired password reset link.",
      );
      return;
    }

    const trimmedPassword =
      password.trim();

    if (!trimmedPassword) {
      toast.error(
        "Please enter a new password.",
      );
      return;
    }

    if (trimmedPassword.length < 6) {
      toast.error(
        "Password must be at least 6 characters long.",
      );
      return;
    }

    if (!confirmPassword) {
      toast.error(
        "Please confirm your new password.",
      );
      return;
    }

    if (password !== confirmPassword) {
      toast.error(
        "Passwords do not match.",
      );
      return;
    }

    dispatch(
      resetPassword({
        token,
        password,
      }),
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg sm:p-8">
        {/* HEADER */}

        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Reset Password
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Enter your new password below.
          </p>
        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {/* NEW PASSWORD */}

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              New Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(
                e: React.ChangeEvent<HTMLInputElement>,
              ) =>
                setPassword(e.target.value)
              }
              placeholder="Enter new password"
              autoComplete="new-password"
              minLength={6}
              required
              disabled={isLoading}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-gray-100"
            />

            <p className="mt-1 text-xs text-gray-500">
              Minimum 6 characters.
            </p>
          </div>

          {/* CONFIRM PASSWORD */}

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Confirm New Password
            </label>

            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(
                e: React.ChangeEvent<HTMLInputElement>,
              ) =>
                setConfirmPassword(
                  e.target.value,
                )
              }
              placeholder="Confirm new password"
              autoComplete="new-password"
              minLength={6}
              required
              disabled={isLoading}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-gray-100"
            />

            {password &&
              confirmPassword &&
              password !== confirmPassword && (
                <p className="mt-1 text-sm text-red-500">
                  Passwords do not match.
                </p>
              )}
          </div>

          {/* SUBMIT */}

          <button
            type="submit"
            disabled={
              isLoading || !token
            }
            className="flex w-full items-center justify-center rounded-lg bg-blue-500 px-4 py-3 font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {isLoading ? (
              <>
                <span className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Resetting...
              </>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}