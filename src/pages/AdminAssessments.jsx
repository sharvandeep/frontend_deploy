import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminAssessments, deleteAdminAssessment } from "../services/api";
import "../styles/admin.css";

export default function AdminAssessments() {

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [assessments, setAssessments] = useState([]);
  const [filteredAssessments, setFilteredAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [branchFilter, setBranchFilter] = useState("ALL");

  const filterAssessments = useCallback(() => {
    let filtered = assessments;

    // Filter by branch
    if (branchFilter !== "ALL") {
      filtered = filtered.filter(a => a.branchName === branchFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(a =>
        a.title?.toLowerCase().includes(term) ||
        a.facultyName?.toLowerCase().includes(term)
      );
    }

    setFilteredAssessments(filtered);
  }, [assessments, branchFilter, searchTerm]);

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      navigate("/login");
      return;
    }

    loadAssessments();
  }, [user, navigate]);

  useEffect(() => {
    filterAssessments();
  }, [filterAssessments]);

  const loadAssessments = async () => {
    try {
      const res = await getAdminAssessments();
      setAssessments(res.data);
      setFilteredAssessments(res.data);
    } catch (error) {
      console.error("Error loading assessments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (assessmentId, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This will also delete all related results and responses.`)) {
      return;
    }

    try {
      await deleteAdminAssessment(assessmentId);
      setAssessments(assessments.filter(a => a.id !== assessmentId));
      alert("Assessment deleted successfully!");
    } catch (error) {
      alert(error.response?.data || "Error deleting assessment");
    }
  };

  const getBranches = () => {
    const branches = [...new Set(assessments.map(a => a.branchName))];
    return ["ALL", ...branches];
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  if (loading) {
    return (
      <div className="admin-wrapper">
        <div className="admin-container">
          <p className="admin-loading">Loading assessments...</p>
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
            <h2>Assessment Management</h2>
            <p>View and manage all assessments</p>
          </div>
        </div>

        {/* Filters */}
        <div className="admin-filters">
          <input
            type="text"
            placeholder="Search by title or faculty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />

          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="branch-select"
          >
            {getBranches().map((branch) => (
              <option key={branch} value={branch}>
                {branch === "ALL" ? "All Branches" : branch}
              </option>
            ))}
          </select>
        </div>

        {/* Stats */}
        <div className="admin-mini-stats">
          <span>Total Assessments: <strong>{filteredAssessments.length}</strong></span>
          <span>Total Questions: <strong>{filteredAssessments.reduce((sum, a) => sum + (a.questionCount || 0), 0)}</strong></span>
          <span>Total Submissions: <strong>{filteredAssessments.reduce((sum, a) => sum + (a.submissionCount || 0), 0)}</strong></span>
        </div>

        {/* Assessments Grid */}
        <div className="admin-cards-grid">
          {filteredAssessments.length === 0 ? (
            <p className="no-data-full">No assessments found</p>
          ) : (
            filteredAssessments.map((assessment) => (
              <div key={assessment.id} className="admin-assessment-card">
                <div className="assessment-header">
                  <h4>{assessment.title}</h4>
                  <span className="branch-tag">{assessment.branchName}</span>
                </div>
                <p className="assessment-desc">
                  {assessment.description || "No description"}
                </p>
                <div className="assessment-meta">
                  <span>👨‍🏫 {assessment.facultyName}</span>
                  <span>📅 {formatDate(assessment.createdAt)}</span>
                </div>
                <div className="assessment-stats">
                  <div className="stat">
                    <span className="stat-value">{assessment.questionCount || 0}</span>
                    <span className="stat-label">Questions</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{assessment.submissionCount || 0}</span>
                    <span className="stat-label">Submissions</span>
                  </div>
                </div>
                <button
                  className="delete-btn full-width"
                  onClick={() => handleDelete(assessment.id, assessment.title)}
                >
                  🗑️ Delete Assessment
                </button>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
