import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/student-assessments.css";
import { getStudentAssessments, getStudentHistory } from "../services/api";

export default function StudentAssessments() {

  const [assessments, setAssessments] = useState([]);
  const [completedMap, setCompletedMap] = useState({});
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    topScore: 0,
    pending: 0
  });
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {

    const loadData = async () => {
      if (!user?.id) return;

      try {
        // Fetch both assessments and history in parallel
        const [assessmentsRes, historyRes] = await Promise.all([
          getStudentAssessments(user.id),
          getStudentHistory(user.id)
        ]);

        const assessmentsData = assessmentsRes.data;
        const historyData = historyRes.data;

        setAssessments(assessmentsData);

        // Create a map of completed assessments with their best scores
        const completed = {};
        historyData.forEach(item => {
          const existingScore = completed[item.assessmentId];
          if (!existingScore || item.percentage > existingScore.percentage) {
            completed[item.assessmentId] = {
              percentage: item.percentage,
              correctAnswers: item.correctAnswers,
              totalQuestions: item.totalQuestions,
              submittedAt: item.submittedAt
            };
          }
        });
        setCompletedMap(completed);

        // Calculate stats
        const completedCount = Object.keys(completed).length;
        const topScore = historyData.length > 0 
          ? Math.max(...historyData.map(item => item.percentage))
          : 0;

        setStats({
          total: assessmentsData.length,
          completed: completedCount,
          topScore: topScore.toFixed(1),
          pending: assessmentsData.length - completedCount
        });

      } catch (error) {
        console.error("Error fetching assessments", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

  }, [user?.id]);

  const getAssessmentStatus = (assessmentId) => {
    return completedMap[assessmentId] ? "completed" : "pending";
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return "#10b981";
    if (percentage >= 60) return "#f59e0b";
    return "#ef4444";
  };

  if (loading) {
    return (
      <div className="sa-page">
        <div className="sa-header">
          <h1>Loading Assessments...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="sa-page">

      <div className="sa-header">
        <h1>My Assessments</h1>
        <p>Track your progress and start new assessments</p>

        <div className="sa-stats-grid">

          <div className="sa-stat-card">
            <span className="sa-stat-icon"></span>
            <div className="sa-stat-info">
              <h4>Total</h4>
              <p className="sa-stat-number">{stats.total}</p>
            </div>
          </div>

          <div className="sa-stat-card">
            <span className="sa-stat-icon"></span>
            <div className="sa-stat-info">
              <h4>Completed</h4>
              <p className="sa-stat-number">{stats.completed}</p>
            </div>
          </div>

          <div className="sa-stat-card">
            <span className="sa-stat-icon"></span>
            <div className="sa-stat-info">
              <h4>Pending</h4>
              <p className="sa-stat-number">{stats.pending}</p>
            </div>
          </div>

          <div className="sa-stat-card">
            <span className="sa-stat-icon"></span>
            <div className="sa-stat-info">
              <h4>Top Score</h4>
              <p className="sa-stat-number">{stats.topScore}%</p>
            </div>
          </div>

        </div>
      </div>

      <div className="sa-personality-cta">
        <div className="sa-personality-content">
          <h3>Explore Your Personality Profile</h3>
          <p>
            Take the Big Five personality test to understand your strengths,
            behavior style, and career alignment.
          </p>
        </div>
        <button
          className="sa-btn sa-btn-primary"
          onClick={() => navigate("/student/personality-tests")}
        >
          Go to Personality Test
        </button>
      </div>

      <div className="sa-grid">

        {assessments.length === 0 ? (

          <div className="sa-empty-card">
            <div className="sa-empty-icon"></div>
            <h3>No Assessments Assigned</h3>
            <p>Your faculty hasn't assigned any assessments yet. Check back later!</p>
          </div>

        ) : (

          assessments.map((assessment) => {

            const status = getAssessmentStatus(assessment.id);
            const completedData = completedMap[assessment.id];

            return (
              <div key={assessment.id} className="sa-card">

                <div className="sa-card-header">
                  <span className={`sa-status-badge ${status}`}>
                    {status === "completed" ? " Completed" : " Pending"}
                  </span>
                </div>

                <h3>{assessment.title}</h3>
                <p className="sa-description">{assessment.description}</p>

                <div className="sa-meta">
                  <span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    {assessment.facultyName}
                  </span>
                  <span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    {new Date(assessment.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {completedData && (
                  <div className="sa-score-panel">
                    <div className="sa-score-circle" style={{ borderColor: getScoreColor(completedData.percentage) }}>
                      <span className="sa-score-value" style={{ color: getScoreColor(completedData.percentage) }}>
                        {completedData.percentage.toFixed(0)}%
                      </span>
                    </div>
                    <div className="sa-score-details">
                      <span className="sa-score-label">Best Score</span>
                      <span className="sa-score-fraction">
                        {completedData.correctAnswers}/{completedData.totalQuestions} correct
                      </span>
                    </div>
                  </div>
                )}

                <div className="sa-actions">
                  {status === "completed" ? (
                    <button
                      className="sa-btn sa-btn-secondary sa-btn-full"
                      onClick={() => navigate(`/student/review/${assessment.id}/${user.id}`)}
                    >
                      View Review
                    </button>
                  ) : (
                    <button
                      className="sa-btn sa-btn-primary sa-btn-full"
                      onClick={() => navigate(`/student/attempt/${assessment.id}`)}
                    >
                      Start Assessment
                    </button>
                  )}
                </div>

              </div>
            );
          })

        )}

      </div>

    </div>
  );
}
