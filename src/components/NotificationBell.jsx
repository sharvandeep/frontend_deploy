import { useState, useEffect, useMemo, useCallback } from "react";
import {
  getUnreadNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  deleteNotification,
  markAllNotificationsAsRead,
} from "../services/api";
import { useNavigate } from "react-router-dom";
import "../styles/notifications.css";

export default function NotificationBell({ userId, autoRefreshInterval = 30000 }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [, setError] = useState(null);

  const memoizedUserId = useMemo(() => userId, [userId]);

  const resolveActionUrl = useCallback(
    (notification) => {
      const rawUrl = notification?.actionUrl;
      if (!rawUrl || typeof rawUrl !== "string") {
        return null;
      }

      const normalized = rawUrl.trim();

      // Backward compatibility for older remark notifications
      // saved as /student/reviews?assessmentId={id}.
      if (normalized.startsWith("/student/reviews")) {
        const queryString = normalized.split("?")[1] || "";
        const params = new URLSearchParams(queryString);
        const assessmentId = params.get("assessmentId");

        if (assessmentId && memoizedUserId) {
          return `/student/review/${assessmentId}/${memoizedUserId}`;
        }
      }

      return normalized;
    },
    [memoizedUserId]
  );

  // =====================================================
  // 1️⃣ Fetch notifications
  // =====================================================
  const fetchNotifications = useCallback(async () => {
    if (!memoizedUserId) return;

    try {
      setLoading(true);
      const response = await getUnreadNotifications(memoizedUserId);
      setNotifications(response.data || []);
      setError(null);

      // Update unread count
      const countResponse = await getUnreadNotificationCount(memoizedUserId);
      setUnreadCount(countResponse.data || 0);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [memoizedUserId]);

  // =====================================================
  // 2️⃣ Auto-refresh notifications
  // =====================================================
  useEffect(() => {
    fetchNotifications(); // Initial fetch

    // Set up interval for auto-refresh
    const interval = setInterval(fetchNotifications, autoRefreshInterval);

    return () => clearInterval(interval);
  }, [fetchNotifications, autoRefreshInterval]);

  // =====================================================
  // 3️⃣ Handle notification click
  // =====================================================
  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read
      if (!notification.isRead) {
        await markNotificationAsRead(notification.id);
      }

      // Remove from unread list immediately for responsive UI
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
      setUnreadCount((prev) => Math.max(0, prev - 1));

      // Navigate to the action URL
      const actionUrl = resolveActionUrl(notification);
      if (actionUrl) {
        setIsOpen(false);
        if (/^https?:\/\//i.test(actionUrl)) {
          window.location.assign(actionUrl);
        } else {
          navigate(actionUrl);
        }
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  // =====================================================
  // 4️⃣ Handle delete notification
  // =====================================================
  const handleDeleteNotification = async (e, notificationId) => {
    e.stopPropagation(); // Prevent triggering notification click

    try {
      await deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  // =====================================================
  // 5️⃣ Handle mark all as read
  // =====================================================
  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead(memoizedUserId);
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const openHistoryPage = () => {
    setIsOpen(false);
    navigate("/notifications/history");
  };

  // =====================================================
  // Format time ago
  // =====================================================
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return "";

    const date = new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    // If within the same day
    if (seconds < 86400) {
      if (seconds < 60) return "just now";
      if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
      return `${Math.floor(seconds / 3600)}h ago`;
    }

    // If within the same week
    const days = Math.floor(seconds / 86400);
    if (days < 7) return `${days}d ago`;

    // Otherwise show date
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  return (
    <div className="notification-wrapper">
      {/* Bell Button */}
      <button
        className={`notification-btn ${isOpen ? "open" : ""} ${unreadCount > 0 ? "has-notification" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notifications (${unreadCount} unread)`}
      >
        <span className="notification-icon">🔔</span>
        {unreadCount > 0 && <span className="notification-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <>
          <div className="notification-backdrop" onClick={() => setIsOpen(false)} />
          <div className="notification-dropdown">
            {/* Header */}
            <div className="notification-dropdown-header">
              <h4>Notifications</h4>
            </div>

            {/* List */}
            <div className="notification-dropdown-list">
              {loading && !notifications.length && (
                <div className="notification-state">
                  <div className="notification-spinner"></div>
                </div>
              )}

              {!loading && notifications.length === 0 && (
                <div className="notification-empty-state">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  <p>No unread notifications</p>
                </div>
              )}

              {notifications.map((notif, idx) => (
                <div
                  key={notif.id}
                  className={`notification-item ${notif.isRead ? "read" : "unread"}`}
                  onClick={() => handleNotificationClick(notif)}
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  {!notif.isRead && <div className="notification-dot" />}
                  <div className="notification-item-content">
                    <p className="notification-item-title">{notif.title}</p>
                    <p className="notification-item-message">{notif.message}</p>
                    <span className="notification-item-time">{formatTimeAgo(notif.createdAt)}</span>
                  </div>
                  <button
                    className="notification-item-delete"
                    onClick={(e) => handleDeleteNotification(e, notif.id)}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" />
                      <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Footer with Buttons */}
            <div className="notification-dropdown-footer">
              <button className="notification-history-btn" onClick={openHistoryPage}>
                History
              </button>
              {unreadCount > 0 && (
                <button className="notification-clear-btn" onClick={handleMarkAllAsRead}>
                  Mark all read
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
