import { useEffect } from "react";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import {
  FaTrash,
  FaBell,
  FaShoppingBag,
  FaComments,
  FaHeart,
  FaInfoCircle,
} from "react-icons/fa";

import { useNotifications } from "../context/NotificationContext";

export default function Notifications() {
  const {
    notifications,
    loading,
    refreshNotifications,
    markAsRead,
    deleteNotification,
  } = useNotifications();

  useEffect(() => {
    refreshNotifications().catch((error) => {
      console.error("Failed to refresh notifications:", error);
      toast.error("Failed to load notifications");
    });
  }, [refreshNotifications]);

  const handleSelectNotification = async (
    notif: (typeof notifications)[number],
  ) => {
    if (!notif.read) {
      try {
        await markAsRead(notif._id);
      } catch (error) {
        console.error("MARK READ ERROR:", error);
        toast.error("Failed to mark as read");
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id);
      toast.success("Notification deleted");
    } catch (error) {
      console.error("DELETE NOTIFICATION ERROR:", error);
      toast.error("Delete failed");
    }
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  const getNotificationIcon = (type?: string) => {
    switch (type) {
      case "order":
        return (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-500">
            <FaShoppingBag />
          </div>
        );

      case "chat":
        return (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-500">
            <FaComments />
          </div>
        );

      case "like":
      case "love":
        return (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink-100 text-pink-500">
            <FaHeart />
          </div>
        );

      default:
        return (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500">
            <FaInfoCircle />
          </div>
        );
    }
  };

  const renderNotificationContent = (
    notif: (typeof notifications)[number],
  ) => {
    const orderId =
      typeof notif.orderId === "string"
        ? notif.orderId
        : notif.orderId?._id;

    if (orderId) {
      return (
        <Link
          to={`/order/${orderId}`}
          onClick={(e) => {
            e.stopPropagation();
            handleSelectNotification(notif);
          }}
          className="block transition hover:text-orange-600"
        >
          <p className="font-semibold text-gray-900">
            {notif.message}
          </p>

          <span className="mt-1 inline-flex text-xs font-semibold text-orange-500">
            View Order →
          </span>
        </Link>
      );
    }

    if (notif.chatUserId) {
      return (
        <Link
          to={`/chat/${notif.chatUserId}`}
          onClick={(e) => {
            e.stopPropagation();
            handleSelectNotification(notif);
          }}
          className="block transition hover:text-blue-600"
        >
          <p className="font-semibold text-gray-900">
            {notif.message}
          </p>

          <span className="mt-1 inline-flex text-xs font-semibold text-blue-500">
            Open Chat →
          </span>
        </Link>
      );
    }

    if (notif.postId) {
      return (
        <Link
          to={`/post/${notif.postId}`}
          onClick={(e) => {
            e.stopPropagation();
            handleSelectNotification(notif);
          }}
          className="block transition hover:text-purple-600"
        >
          <p className="font-semibold text-gray-900">
            {notif.message}
          </p>

          <span className="mt-1 inline-flex text-xs font-semibold text-purple-500">
            View Post →
          </span>
        </Link>
      );
    }

    return (
      <p className="font-semibold text-gray-900">
        {notif.message}
      </p>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 sm:text-3xl">
              <FaBell className="text-orange-500" />
              Notifications
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              {unreadCount === 0
                ? "You're all caught up."
                : `${unreadCount} unread notification${
                    unreadCount === 1 ? "" : "s"
                  }`}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <p className="text-gray-500">
              Loading notifications...
            </p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-50">
              <FaBell className="text-2xl text-orange-400" />
            </div>

            <h2 className="mt-4 text-lg font-bold text-gray-900">
              No notifications
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              You don't have any notifications yet.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif, idx) => (
              <div
                key={
                  typeof notif._id === "string" && notif._id
                    ? notif._id
                    : `notification-${idx}`
                }
                onClick={() => handleSelectNotification(notif)}
                className={`relative rounded-2xl border p-4 transition ${
                  notif.read
                    ? "border-gray-100 bg-white"
                    : "border-orange-100 bg-orange-50/40 shadow-sm"
                }`}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(notif._id);
                  }}
                  className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                  aria-label="Delete notification"
                >
                  <FaTrash size={12} />
                </button>

                <div className="flex gap-3 pr-8">
                  {getNotificationIcon(notif.type)}

                  <div className="min-w-0 flex-1">
                    {renderNotificationContent(notif)}

                    <span className="mt-2 block text-xs text-gray-400">
                      {new Date(
                        notif.createdAt,
                      ).toLocaleString()}
                    </span>
                  </div>

                  {!notif.read && (
                    <span
                      className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-orange-500"
                      title="Unread"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}