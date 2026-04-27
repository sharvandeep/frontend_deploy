import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminDashboard, getAdminUsers, getAdminAssessments } from "../services/api";
import "../styles/admin.css";

export default function AdminDashboard() {

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [stats, setStats] = useState({
    totalStudents: 0,
    totalFaculty: 0,
    totalAssessments: 0,
    totalSubmissions: 0,
    totalCareerPaths: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentAssessments, setRecentAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    // Redirect if not admin
    if (!user || user.role !== "ADMIN") {
      navigate("/login");
      return;
    }

    const loadDashboard = async () => {
      try {
        const [dashRes, usersRes, assessRes] = await Promise.all([
          getAdminDashboard(),
          getAdminUsers(),
          getAdminAssessments()
        ]);
        
        setStats(dashRes.data);
        setRecentUsers(usersRes.data.slice(-5).reverse());
        setRecentAssessments(assessRes.data.slice(-4).reverse());
      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();

  }, [user, navigate]);

  if (loading) {
    return (
      <div className="admin-wrapper">
        <div className="admin-container">
          <p className="admin-loading">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-wrapper">
      <div className="admin-container">

        {/* ================= HEADER ================= */}
        <div className="admin-header">
          <div className="admin-header-content">
            <h2>Admin Dashboard</h2>
            <p>Manage your career assessment platform</p>
            <div className="welcome-badge">
              <div className="avatar">{user?.name?.charAt(0).toUpperCase() || "A"}</div>
              <span>Welcome back, {user?.name || "Admin"}</span>
            </div>
          </div>
        </div>

        {/* ================= STATS CARDS ================= */}
        <div className="admin-stats">
          <div className="admin-stat-card" onClick={() => navigate("/admin/users")}>
            <div className="stat-icon students">👨‍🎓</div>
            <div className="stat-info">
              <h3>{stats.totalStudents}</h3>
              <p>Students</p>
            </div>
          </div>

          <div className="admin-stat-card" onClick={() => navigate("/admin/users")}>
            <div className="stat-icon faculty">👨‍🏫</div>
            <div className="stat-info">
              <h3>{stats.totalFaculty}</h3>
              <p>Faculty</p>
            </div>
          </div>

          <div className="admin-stat-card" onClick={() => navigate("/admin/assessments")}>
            <div className="stat-icon assessments">📋</div>
            <div className="stat-info">
              <h3>{stats.totalAssessments}</h3>
              <p>Assessments</p>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="stat-icon submissions">✅</div>
            <div className="stat-info">
              <h3>{stats.totalSubmissions}</h3>
              <p>Submissions</p>
            </div>
          </div>

          <div className="admin-stat-card" onClick={() => navigate("/admin/career-paths")}>
            <div className="stat-icon careers">🎯</div>
            <div className="stat-info">
              <h3>{stats.totalCareerPaths}</h3>
              <p>Career Paths</p>
            </div>
          </div>
        </div>

        {/* ================= MAIN CONTENT ROW ================= */}
        <div className="admin-content-row">

          {/* RECENT USERS */}
          <div className="admin-panel">
            <div className="panel-header">
              <h3>Recent Users</h3>
              <button className="view-all-btn" onClick={() => navigate("/admin/users")}>
                View All →
              </button>
            </div>
            <div className="panel-content">
              {recentUsers.length > 0 ? (
                <ul className="recent-list">
                  {recentUsers.map((u, i) => (
                    <li key={i} className="recent-item">
                      <div className="recent-avatar">
                        {u.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div className="recent-info">
                        <span className="recent-name">{u.name}</span>
                        <span className="recent-meta">{u.email}</span>
                      </div>
                      <span className={`role-badge badge-${u.role?.toLowerCase()}`}>
                        {u.role}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-text">No users yet</p>
              )}
            </div>
          </div>

          {/* RECENT ASSESSMENTS */}
          <div className="admin-panel">
            <div className="panel-header">
              <h3>Recent Assessments</h3>
              <button className="view-all-btn" onClick={() => navigate("/admin/assessments")}>
                View All →
              </button>
            </div>
            <div className="panel-content">
              {recentAssessments.length > 0 ? (
                <ul className="recent-list">
                  {recentAssessments.map((a, i) => (
                    <li key={i} className="recent-item">
                      <div className="recent-avatar assessment">📝</div>
                      <div className="recent-info">
                        <span className="recent-name">{a.title}</span>
                        <span className="recent-meta">
                          {a.facultyName} • {a.branchName}
                        </span>
                      </div>
                      <span className="submission-count">{a.submissionCount} taken</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-text">No assessments yet</p>
              )}
            </div>
          </div>

        </div>

        {/* ================= QUICK ACTIONS ================= */}
        <div className="admin-quick-actions">
          <h3 className="section-title">Quick Actions</h3>
          <div className="quick-actions-grid">
            <div className="quick-action-card" onClick={() => navigate("/admin/users")}>
              <div className="qa-icon">👥</div>
              <div className="qa-content">
                <h4>Manage Users</h4>
                <p>View, search and delete users</p>
              </div>
              <span className="qa-arrow">→</span>
            </div>

            <div className="quick-action-card" onClick={() => navigate("/admin/assessments")}>
              <div className="qa-icon">📝</div>
              <div className="qa-content">
                <h4>Manage Assessments</h4>
                <p>View and manage all assessments</p>
              </div>
              <span className="qa-arrow">→</span>
            </div>

            <div className="quick-action-card" onClick={() => navigate("/admin/career-paths")}>
              <div className="qa-icon">🎯</div>
              <div className="qa-content">
                <h4>Career Paths</h4>
                <p>Create and manage career recommendations</p>
              </div>
              <span className="qa-arrow">→</span>
            </div>
          </div>
        </div>

        {/* ================= PLATFORM OVERVIEW ================= */}
        <div className="admin-overview">
          <h3 className="section-title">Platform Overview</h3>
          <div className="overview-grid">
            <div className="overview-card">
              <div className="overview-icon">📊</div>
              <div className="overview-info">
                <h4>Submission Rate</h4>
                <span className="overview-value">
                  {stats.totalAssessments > 0 
                    ? Math.round((stats.totalSubmissions / stats.totalAssessments) * 10) / 10 
                    : 0} avg/assessment
                </span>
              </div>
            </div>

            <div className="overview-card">
              <div className="overview-icon">👥</div>
              <div className="overview-info">
                <h4>Student-Faculty Ratio</h4>
                <span className="overview-value">
                  {stats.totalFaculty > 0 
                    ? Math.round((stats.totalStudents / stats.totalFaculty) * 10) / 10 
                    : 0}:1
                </span>
              </div>
            </div>

            <div className="overview-card">
              <div className="overview-icon">✅</div>
              <div className="overview-info">
                <h4>System Status</h4>
                <span className="overview-value status-online">Online</span>
              </div>
            </div>

            <div className="overview-card">
              <div className="overview-icon">🔐</div>
              <div className="overview-info">
                <h4>Total Users</h4>
                <span className="overview-value">{stats.totalStudents + stats.totalFaculty + 1}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
