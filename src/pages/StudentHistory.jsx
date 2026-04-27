import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getStudentHistory } from "../services/api";
import "../styles/studentdashboard.css";

export default function StudentHistory() {

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {

    const loadHistory = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const res = await getStudentHistory(user.id);
        setHistory(res.data);
      } catch (error) {
        console.error("Error loading history:", error);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();

  }, [user?.id, location.key]);

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return "#10b981";
    if (percentage >= 60) return "#f59e0b";
    if (percentage >= 40) return "#f97316";
    return "#ef4444";
  };

  const getScoreLabel = (percentage) => {
    if (percentage >= 80) return "Excellent";
    if (percentage >= 60) return "Good";
    if (percentage >= 40) return "Average";
    return "Needs Improvement";
  };

  const filteredHistory = history.filter((item) =>
    (item.assessmentTitle || "").toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  return (
    <div className="history-wrapper">
      <div className="history-container">

        {/* Header */}
        <div className="history-header">
          <div className="history-header-content">
            <h2>Assessment History</h2>
            <p>Review your past assessments and track your progress</p>
          </div>
          
          <div className="history-stats">
            <div className="history-stat-card">
              <div className="history-stat-value">{history.length}</div>
              <div className="history-stat-label">Attempts</div>
            </div>
            <div className="history-stat-card">
              <div className="history-stat-value">
                {history.length > 0 
                  ? Math.max(...history.map(h => h.percentage)).toFixed(0) + '%'
                  : '--'}
              </div>
              <div className="history-stat-label">Best Score</div>
            </div>
            <div className="history-stat-card">
              <div className="history-stat-value">
                {history.length > 0 
                  ? (history.reduce((sum, h) => sum + h.percentage, 0) / history.length).toFixed(0) + '%'
                  : '--'}
              </div>
              <div className="history-stat-label">Average</div>
            </div>
          </div>
        </div>

        <div className="history-search-row">
          <input
            type="text"
            className="history-search-input"
            placeholder="Search past assessments"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="history-loading">
            <div className="loading-spinner"></div>
            <p>Loading history...</p>
          </div>
        ) : history.length === 0 ? (
          /* Empty State */
          <div className="history-empty">
            <div className="empty-icon">📝</div>
            <h3>No Assessments Yet</h3>
            <p>You haven't attempted any assessments. Start your first one now!</p>
            <button 
              className="history-btn primary"
              onClick={() => navigate("/student/assessments")}
            >
              Browse Assessments
            </button>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="history-empty">
            <div className="empty-icon">🔍</div>
            <h3>No Matching Results</h3>
            <p>Try a different assessment name in search.</p>
          </div>
        ) : (
          /* History List */
          <div className="history-list">
            {filteredHistory.map((item, index) => (
              <div 
                key={index} 
                className="history-card"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="history-card-left">
                  <div 
                    className="history-score-circle"
                    style={{ 
                      background: `conic-gradient(${getScoreColor(item.percentage)} ${item.percentage * 3.6}deg, #e5e7eb 0deg)` 
                    }}
                  >
                    <div className="history-score-inner">
                      <span className="score-value">{item.percentage.toFixed(0)}%</span>
                    </div>
                  </div>
                </div>

                <div className="history-card-content">
                  <div className="history-card-header">
                    <h3>{item.assessmentTitle}</h3>
                    <span 
                      className="history-badge"
                      style={{ 
                        background: `${getScoreColor(item.percentage)}15`,
                        color: getScoreColor(item.percentage)
                      }}
                    >
                      {getScoreLabel(item.percentage)}
                    </span>
                  </div>
                  
                  <div className="history-card-details">
                    <div className="history-detail">
                      <span className="detail-icon">✓</span>
                      <span>{item.correctAnswers} / {item.totalQuestions} correct</span>
                    </div>
                    <div className="history-detail">
                      <span className="detail-icon">📅</span>
                      <span>{new Date(item.submittedAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                    </div>
                  </div>
                </div>

                <div className="history-card-action">
                  <button
                    className="history-review-btn"
                    onClick={() => navigate(`/student/review/${item.assessmentId}/${user.id}`)}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}