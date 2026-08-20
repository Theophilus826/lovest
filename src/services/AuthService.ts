
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
  console.log("========== SAVE AUTH ==========");
  console.log("SAVE AUTH DATA:", data);

  // ==========================================
  // CHECK RESPONSE
  // ==========================================

  if (!data) {
    console.error("❌ SAVE AUTH: No response data");

    throw new Error(
      "No authentication response received.",
    );
  }

  if (!data.token) {
    console.error(
      "❌ SAVE AUTH: Token missing",
      data,
    );

    throw new Error(
      "Authentication token was not returned.",
    );
  }

  if (!data._id) {
    console.error(
      "❌ SAVE AUTH: User ID missing",
      data,
    );

    throw new Error(
      "User ID was not returned.",
    );
  }

  // ==========================================
  // BUILD USER
  // ==========================================

  const isAdmin =
    data.isAdmin === true ||
    data.role === "admin";

  const user: AuthUser = {
    _id: String(data._id),

    name:
      typeof data.name === "string" &&
      data.name.trim()
        ? data.name
        : "User",

    email: data.email ?? null,

    phone: data.phone ?? null,

    avatar: data.avatar ?? null,

    token: String(data.token),

    isAdmin,

    role: isAdmin
      ? "admin"
      : "user",

    coins:
      typeof data.coins === "number"
        ? data.coins
        : 0,

    isVerified:
      data.isVerified === true,

    online:
      data.online === true,

    createdAt: data.createdAt,

    updatedAt: data.updatedAt,
  };

  // ==========================================
  // SAVE TOKEN
  // ==========================================

  localStorage.setItem(
    "token",
    user.token,
  );

  // ==========================================
  // SAVE USER
  // ==========================================

  localStorage.setItem(
    "user",
    JSON.stringify(user),
  );

  // ==========================================
  // SAVE USER ID
  // ==========================================

  localStorage.setItem(
    "userId",
    user._id,
  );

  // ==========================================
  // VERIFY STORAGE
  // ==========================================

  console.log(
    "✅ AUTH SAVED:",
    user,
  );

  console.log(
    "✅ TOKEN SAVED:",
    localStorage.getItem("token"),
  );

  console.log(
    "✅ USER SAVED:",
    localStorage.getItem("user"),
  );

  console.log(
    "✅ USER ID SAVED:",
    localStorage.getItem("userId"),
  );

  console.log(
    "✅ IS ADMIN:",
    user.isAdmin,
  );

  console.log(
    "========== SAVE AUTH COMPLETE ==========",
  );

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

