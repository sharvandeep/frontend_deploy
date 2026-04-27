import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  deleteNotification,
  exportNotificationHistoryReport,
  getNotificationsForUser,
  markNotificationAsRead,
} from "../services/api";
import "../styles/notification-history.css";

export default function NotificationHistory() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  }, []);

  const resolveActionUrl = useCallback(
    (notification) => {
      const rawUrl = notification?.actionUrl;
      if (!rawUrl || typeof rawUrl !== "string") {
        return null;
      }

      const normalized = rawUrl.trim();

      if (normalized.startsWith("/student/reviews")) {
        const queryString = normalized.split("?")[1] || "";
        const params = new URLSearchParams(queryString);
        const assessmentId = params.get("assessmentId");

        if (assessmentId && user?.id) {
          return `/student/review/${assessmentId}/${user.id}`;
        }
      }

      return normalized;
    },
    [user?.id]
  );

  const loadNotifications = useCallback(async () => {
    if (!user?.id) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await getNotificationsForUser(user.id);
      setNotifications(res.data || []);
    } catch (error) {
      console.error("Failed to load notification history:", error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const groupedByDate = useMemo(() => {
    const groups = {};

    notifications.forEach((item) => {
      const date = new Date(item.createdAt);
      const key = date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      if (!groups[key]) {
        groups[key] = [];
      }

      groups[key].push(item);
    });

    return Object.entries(groups);
  }, [notifications]);

  const formatFullDateTime = (timestamp) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const openNotification = async (item) => {
    try {
      if (!item.isRead) {
        await markNotificationAsRead(item.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
        );
      }

      const actionUrl = resolveActionUrl(item);
      if (!actionUrl) return;

      if (/^https?:\/\//i.test(actionUrl)) {
        window.location.assign(actionUrl);
      } else {
        navigate(actionUrl);
      }
    } catch (error) {
      console.error("Failed to open notification:", error);
    }
  };

  const removeNotification = async (e, notificationId) => {
    e.stopPropagation();
    try {
      await deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const handleExportReport = async () => {
    if (!user?.id) return;

    try {
      const response = await exportNotificationHistoryReport(user.id);
      const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const today = new Date().toISOString().slice(0, 10);

      link.href = url;
      link.setAttribute("download", `notification-history-${user.id}-${today}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export notification report:", error);
    }
  };

  return (
    <div className="nh-page">
      <div className="nh-shell">
        <div className="nh-header">
          <div>
            <h1>Notification History</h1>
            <p>Complete timeline of your notifications, grouped by date.</p>
          </div>
          <div className="nh-actions">
            <button className="nh-btn nh-btn-export" onClick={handleExportReport}>
              Export Report
            </button>
            <button className="nh-btn nh-btn-soft" onClick={loadNotifications}>
              Refresh
            </button>
            <button className="nh-btn nh-btn-primary" onClick={() => navigate(-1)}>
              Back
            </button>
          </div>
        </div>

        {loading ? (
          <div className="nh-state">Loading your notification history...</div>
        ) : groupedByDate.length === 0 ? (
          <div className="nh-state">No notifications available yet.</div>
        ) : (
          <div className="nh-timeline">
            {groupedByDate.map(([dateLabel, items]) => (
              <section className="nh-day-group" key={dateLabel}>
                <div className="nh-day-chip">{dateLabel}</div>

                {items.map((item) => (
                  <article
                    key={item.id}
                    className={`nh-card ${item.isRead ? "read" : "unread"}`}
                    onClick={() => openNotification(item)}
                  >
                    <div className="nh-card-top">
                      <h3>{item.title}</h3>
                      <span className="nh-time">{formatFullDateTime(item.createdAt)}</span>
                    </div>

                    <p className="nh-message">{item.message}</p>

                    <div className="nh-meta-row">
                      <span className="nh-type">{item.notificationType || "GENERAL"}</span>
                      {!item.isRead && <span className="nh-pill">NEW</span>}
                    </div>

                    <button
                      className="nh-delete"
                      onClick={(e) => removeNotification(e, item.id)}
                      aria-label="Delete notification"
                    >
                      Delete
                    </button>
                  </article>
                ))}
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
