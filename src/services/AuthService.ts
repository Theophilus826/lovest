
import API from "../services/Api";

const API_URL = "/users/";

export interface AuthUser {
  _id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  avatar?: string | null;
  token: string;
  isAdmin: boolean;
  role?: "user" | "admin";
  coins?: number;
  isVerified?: boolean;
  online?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface LoginData {
  identifier: string;
  password: string;
}

interface RegisterData {
  name: string;
  email?: string;
  phone?: string;
  password: string;
  confirmPassword?: string;
  referralCode?: string;
}

/* ==========================================
   SAVE AUTH
========================================== */

const saveAuth = (data: any): AuthUser => {
  if (!data?.token) {
    throw new Error("Authentication token was not returned.");
  }

  

  const user: AuthUser = {
    _id: String(data._id),
    name: data.name || "User",
    email: data.email ?? null,
    phone: data.phone ?? null,
    avatar: data.avatar ?? null,
    token: data.token,

    // IMPORTANT
    isAdmin:
      data.isAdmin === true ||
      data.role === "admin",

    role:
      data.isAdmin === true ||
      data.role === "admin"
        ? "admin"
        : "user",

    coins: data.coins ?? 0,
    isVerified: data.isVerified ?? false,
    online: data.online ?? false,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };

  localStorage.setItem("token", user.token);
  localStorage.setItem("user", JSON.stringify(user));

  // Keep this if other parts of your app use userId
  localStorage.setItem("userId", user._id);

  console.log("AUTH SAVED:", user);
  console.log("AUTH IS ADMIN:", user.isAdmin);

  return user;
};

/* ==========================================
   CLEAR AUTH
========================================== */

const clearAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("userId");
};

/* ==========================================
   REGISTER
========================================== */

const register = async (userData: RegisterData) => {
  const { data } = await API.post(
    API_URL + "register",
    userData
  );

  return saveAuth(data);
};

/* ==========================================
   LOGIN
========================================== */

const login = async (userData: LoginData) => {
  console.log("1. LOGIN REQUEST:", {
    identifier: userData.identifier,
    hasPassword: !!userData.password,
  });

  try {
    const response = await API.post(
      API_URL + "login",
      userData
    );

    console.log("2. LOGIN RESPONSE STATUS:", response.status);
    console.log("3. LOGIN RESPONSE DATA:", response.data);

    const user = saveAuth(response.data);

    console.log("4. AUTH SAVED:", user);

    return user;
  } catch (error: any) {
    console.error("5. LOGIN ERROR:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    throw error;
  }
};

/* ==========================================
   LOGOUT
========================================== */

const logout = async () => {
  try {
    await API.post(API_URL + "logout");
  } finally {
    clearAuth();
  }
};

/* ==========================================
   FORGOT PASSWORD
========================================== */

const forgotPassword = async (
  identifier: string
) => {
  const { data } = await API.post(
    API_URL + "forgot-password",
    {
      identifier,
    }
  );

  return data;
};

/* ==========================================
   RESET PASSWORD
========================================== */

const resetPassword = async (
  token: string,
  password: string
) => {
  const { data } = await API.put(
    API_URL + `reset-password/${token}`,
    {
      password,
    }
  );

  return data;
};

/* ==========================================
   GET CURRENT USER
========================================== */

const getMe = async () => {
  const { data } = await API.get(
    API_URL + "me"
  );

  /*
   * If backend returns the user directly,
   * synchronize localStorage.
   */

  if (data) {
    const token = getToken();

    if (token) {
      const userData = {
        ...data,
        token,
      };

      return saveAuth(userData);
    }
  }

  return data;
};

/* ==========================================
   CONTACTS
========================================== */

const getContacts = async () => {
  const { data } = await API.get(
    API_URL + "contacts"
  );

  return data;
};

const addContact = async (
  userId: string
) => {
  const { data } = await API.post(
    API_URL + "contacts/add",
    {
      userId,
    }
  );

  return data;
};

/* ==========================================
   HELPERS
========================================== */

const getToken = (): string | null => {
  return localStorage.getItem("token");
};

const getUser = (): AuthUser | null => {
  try {
    const storedUser =
      localStorage.getItem("user");

    if (!storedUser) {
      return null;
    }

    return JSON.parse(storedUser);
  } catch (error) {
    console.error(
      "Failed to read stored user:",
      error
    );

    clearAuth();

    return null;
  }
};

const isAuthenticated = (): boolean => {
  return !!getToken();
};

const isAdmin = (): boolean => {
  const user = getUser();

  if (!user) {
    return false;
  }

  return (
    user.isAdmin === true ||
    user.role === "admin"
  );
};

/* ==========================================
   EXPORT
========================================== */

export default {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
  getContacts,
  addContact,

  getToken,
  getUser,
  isAuthenticated,
  isAdmin,
};

