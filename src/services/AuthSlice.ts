import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";

import authService from "./AuthService";
import type { AuthUser } from "./AuthService";

// ==========================
// TYPES
// ==========================

interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface LoginData {
  identifier: string;
  password: string;
}

interface ResetPasswordData {
  token: string;
  password: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  message: string;
}

// ==========================
// ERROR HELPER
// ==========================

const getErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  if (
    typeof error === "object" &&
    error !== null
  ) {
    const axiosError = error as {
      response?: {
        data?: {
          message?: unknown;
          error?: unknown;
        };
      };
      message?: unknown;
    };

    const responseMessage =
      axiosError.response?.data?.message;

    if (typeof responseMessage === "string") {
      return responseMessage;
    }

    const responseError =
      axiosError.response?.data?.error;

    if (typeof responseError === "string") {
      return responseError;
    }

    if (typeof axiosError.message === "string") {
      return axiosError.message;
    }
  }

  return fallback;
};

// ==========================
// INITIAL STATE
// ==========================

const getStoredUser = (): AuthUser | null => {
  try {
    const user = localStorage.getItem("user");

    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error(
      "Failed to parse stored user:",
      error,
    );

    localStorage.removeItem("user");

    return null;
  }
};

const initialState: AuthState = {
  user: getStoredUser(),
  token: localStorage.getItem("token"),
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: "",
};

// ==========================
// REGISTER
// ==========================

export const registerUser = createAsyncThunk<
  AuthUser,
  RegisterData,
  {
    rejectValue: string;
  }
>(
  "auth/register",
  async (userData, thunkAPI) => {
    try {
      const response =
        await authService.register(userData);

      return response;
    } catch (error: unknown) {
      return thunkAPI.rejectWithValue(
        getErrorMessage(
          error,
          "Registration failed",
        ),
      );
    }
  },
);

// ==========================
// LOGIN
// ==========================

export const loginUser = createAsyncThunk<
  AuthUser,
  LoginData,
  {
    rejectValue: string;
  }
>(
  "auth/login",
  async (userData, thunkAPI) => {
    try {
      const response =
        await authService.login(userData);

      return response;
    } catch (error: unknown) {
      return thunkAPI.rejectWithValue(
        getErrorMessage(
          error,
          "Login failed",
        ),
      );
    }
  },
);

// ==========================
// RESET PASSWORD
// ==========================

export const resetPassword = createAsyncThunk<
  string,
  ResetPasswordData,
  {
    rejectValue: string;
  }
>(
  "auth/resetPassword",
  async (data, thunkAPI) => {
    try {
      const response =
        await authService.resetPassword(
          data.token,
          data.password,
        );

      const message =
        response?.message ||
        "Password reset successfully";

      return message;
    } catch (error: unknown) {
      return thunkAPI.rejectWithValue(
        getErrorMessage(
          error,
          "Failed to reset password",
        ),
      );
    }
  },
);

// ==========================
// SLICE
// ==========================

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    // ==========================
    // RESET STATUS
    // ==========================

    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = "";
    },

    // ==========================
    // LOGOUT
    // ==========================

    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = "";

      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },

    // ==========================
    // UPDATE USER
    // ==========================

    setUser: (
      state,
      action: PayloadAction<Partial<AuthUser>>,
    ) => {
      if (!state.user) {
        return;
      }

      state.user = {
        ...state.user,
        ...action.payload,
      };

      localStorage.setItem(
        "user",
        JSON.stringify(state.user),
      );
    },
  },

  // ==========================
  // ASYNC ACTIONS
  // ==========================

  extraReducers: (builder) => {
    builder

      // ==========================
      // REGISTER - PENDING
      // ==========================

      .addCase(
        registerUser.pending,
        (state) => {
          state.isLoading = true;
          state.isSuccess = false;
          state.isError = false;
          state.message = "";
        },
      )

      // ==========================
      // REGISTER - SUCCESS
      // ==========================

      .addCase(
        registerUser.fulfilled,
        (state, action) => {
          state.isLoading = false;
          state.isSuccess = true;
          state.isError = false;
          state.message =
            "Registration successful";

          state.user = action.payload;
          state.token =
            action.payload.token ?? null;

          localStorage.setItem(
            "user",
            JSON.stringify(action.payload),
          );

          if (action.payload.token) {
            localStorage.setItem(
              "token",
              action.payload.token,
            );
          }
        },
      )

      // ==========================
      // REGISTER - ERROR
      // ==========================

      .addCase(
        registerUser.rejected,
        (state, action) => {
          state.isLoading = false;
          state.isSuccess = false;
          state.isError = true;
          state.message =
            action.payload ||
            "Registration failed";
        },
      )

      // ==========================
      // LOGIN - PENDING
      // ==========================

      .addCase(
        loginUser.pending,
        (state) => {
          state.isLoading = true;
          state.isSuccess = false;
          state.isError = false;
          state.message = "";
        },
      )

      // ==========================
      // LOGIN - SUCCESS
      // ==========================

      .addCase(
        loginUser.fulfilled,
        (state, action) => {
          state.isLoading = false;
          state.isSuccess = true;
          state.isError = false;
          state.message =
            "Login successful";

          state.user = action.payload;
          state.token =
            action.payload.token ?? null;

          localStorage.setItem(
            "user",
            JSON.stringify(action.payload),
          );

          if (action.payload.token) {
            localStorage.setItem(
              "token",
              action.payload.token,
            );
          }
        },
      )

      // ==========================
      // LOGIN - ERROR
      // ==========================

      .addCase(
        loginUser.rejected,
        (state, action) => {
          state.isLoading = false;
          state.isSuccess = false;
          state.isError = true;
          state.message =
            action.payload ||
            "Login failed";
        },
      )

      // ==========================
      // RESET PASSWORD - PENDING
      // ==========================

      .addCase(
        resetPassword.pending,
        (state) => {
          state.isLoading = true;
          state.isSuccess = false;
          state.isError = false;
          state.message = "";
        },
      )

      // ==========================
      // RESET PASSWORD - SUCCESS
      // ==========================

      .addCase(
        resetPassword.fulfilled,
        (state, action) => {
          state.isLoading = false;
          state.isSuccess = true;
          state.isError = false;
          state.message =
            action.payload;
        },
      )

      // ==========================
      // RESET PASSWORD - ERROR
      // ==========================

      .addCase(
        resetPassword.rejected,
        (state, action) => {
          state.isLoading = false;
          state.isSuccess = false;
          state.isError = true;
          state.message =
            action.payload ||
            "Failed to reset password";
        },
      );
  },
});

// ==========================
// ACTIONS
// ==========================

export const {
  reset,
  logout,
  setUser,
} = authSlice.actions;

// ==========================
// REDUCER
// ==========================

export default authSlice.reducer;