import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminUsers, deleteAdminUser } from "../services/api";
import "../styles/admin.css";

export default function AdminUsers() {

  const navigate = useNavigate();
  const user = useMemo(() => JSON.parse(localStorage.getItem("user") || "null"), []);

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const filterUsers = useCallback(() => {
    let filtered = users;

    // Filter by role
    if (roleFilter !== "ALL") {
      filtered = filtered.filter(u => u.role === roleFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(u =>
        u.name?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term) ||
        u.userCode?.toLowerCase().includes(term)
      );
    }

    setFilteredUsers(filtered);
  }, [users, roleFilter, searchTerm]);

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      navigate("/login");
      return;
    }

    loadUsers();
  }, [user, navigate]);

  useEffect(() => {
    filterUsers();
  }, [filterUsers]);

  const loadUsers = async () => {
    try {
      const res = await getAdminUsers();
      setUsers(res.data);
      setFilteredUsers(res.data);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete "${userName}"?`)) {
      return;
    }

    try {
      await deleteAdminUser(userId);
      setUsers(users.filter(u => u.id !== userId));
      alert("User deleted successfully!");
    } catch (error) {
      alert(error.response?.data || "Error deleting user");
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case "STUDENT": return "badge-student";
      case "FACULTY": return "badge-faculty";
      case "ADMIN": return "badge-admin";
      default: return "";
    }
  };

  if (loading) {
    return (
      <div className="admin-wrapper">
        <div className="admin-container">
          <p className="admin-loading">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-wrapper">
      <div className="admin-container">

        {/* Header */}
        <div className="admin-header">
          <div className="admin-header-content">
            <button className="back-btn" onClick={() => navigate("/admin-dashboard")}>
              ← Back to Dashboard
            </button>
            <h2>User Management</h2>
            <p>View and manage all platform users</p>
          </div>
        </div>

        {/* Filters */}
        <div className="admin-filters">
          <input
            type="text"
            placeholder="Search by name, email or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />

          <div className="filter-tabs">
            {["ALL", "STUDENT", "FACULTY", "ADMIN"].map((role) => (
              <button
                key={role}
                className={`filter-tab ${roleFilter === role ? "active" : ""}`}
                onClick={() => setRoleFilter(role)}
              >
                {role === "ALL" ? "All Users" : role}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="admin-mini-stats">
          <span>Total: <strong>{filteredUsers.length}</strong></span>
          <span>Students: <strong>{users.filter(u => u.role === "STUDENT").length}</strong></span>
          <span>Faculty: <strong>{users.filter(u => u.role === "FACULTY").length}</strong></span>
          <span>Admins: <strong>{users.filter(u => u.role === "ADMIN").length}</strong></span>
        </div>

        {/* Users Table */}
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Branch</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">No users found</td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td className="user-code">{u.userCode}</td>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`role-badge ${getRoleBadgeClass(u.role)}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>{u.branch || "N/A"}</td>
                    <td>
                      {u.role !== "ADMIN" && (
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(u.id, u.name)}
                        >
                          🗑️ Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
