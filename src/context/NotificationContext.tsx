import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "react-toastify";

import API from "../services/Api";
import AuthService from "../services/AuthService";

export interface NotificationItem {
  _id: string;
  user?: string;
  sender?: string;
  read: boolean;
  createdAt: string;
  message: string;
  type?: string;
  chatUserId?: string | null;
  postId?: string | null;
  orderId?: string | { _id: string } | null;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

const NotificationContext =
  createContext<NotificationContextType | undefined>(undefined);

const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({
  children,
}: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<
    NotificationItem[]
  >([]);

  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    const token = AuthService.getToken();

    if (!token) {
      setNotifications([]);
      return;
    }

    setLoading(true);

    try {
      const response = await API.get("/notifications");

      const data = response.data.notifications || [];

      setNotifications(data);
    } catch (error) {
      console.error(
        "Failed to fetch notifications:",
        error,
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await API.put(`/notifications/${id}/read`, {});

      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === id
            ? {
                ...notification,
                read: true,
              }
            : notification,
        ),
      );
    } catch (error) {
      console.error(
        "Failed to mark notification as read:",
        error,
      );

      throw error;
    }
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    try {
      await API.delete(`/notifications/${id}`);

      setNotifications((prev) =>
        prev.filter(
          (notification) => notification._id !== id,
        ),
      );
    } catch (error) {
      console.error(
        "Failed to delete notification:",
        error,
      );

      throw error;
    }
  }, []);

  useEffect(() => {
    const token = AuthService.getToken();

    if (!token) {
      setNotifications([]);
      return;
    }

    void fetchNotifications();

    const source = new EventSource(
      `${BASE_URL}/api/notifications/stream?token=${encodeURIComponent(
        token,
      )}`,
    );

    source.onopen = () => {
      console.log("✅ Notification SSE connected");
    };

    source.onerror = () => {
      console.error("🚨 Notification SSE error");

      source.close();

      setTimeout(() => {
        void fetchNotifications();
      }, 3000);
    };

    source.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (!data || data.type === "ping") {
          return;
        }

        if (data.type === "connected") {
          return;
        }

        if (
          data.type === "notification" &&
          data.notification
        ) {
          const notification =
            data.notification as NotificationItem;

          setNotifications((prev) => {
            if (
              prev.some(
                (item) =>
                  item._id === notification._id,
              )
            ) {
              return prev;
            }

            toast.info(`🔔 ${notification.message}`);

            return [notification, ...prev];
          });
        }
      } catch (error) {
        console.error(
          "Failed to parse notification SSE event:",
          error,
        );
      }
    };

    return () => {
      source.close();
    };
  }, [fetchNotifications]);

  const unreadCount = useMemo(
    () =>
      notifications.filter(
        (notification) => !notification.read,
      ).length,
    [notifications],
  );

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    loading,
    refreshNotifications: fetchNotifications,
    markAsRead,
    deleteNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextType {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotifications must be used within NotificationProvider",
    );
  }

  return context;
}