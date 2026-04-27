import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAssessmentResults } from "../services/api";
import "../styles/studentdashboard.css";

export default function AssessmentResults() {

  const { assessmentId } = useParams();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {

    const loadResults = async () => {
      try {
        const res = await getAssessmentResults(assessmentId);
        setStudents(res.data);
      } catch (error) {
        console.error("Error loading results", error);
      } finally {
        setLoading(false);
      }
    };

    loadResults();

  }, [assessmentId]);

  const getScoreClass = (percentage) => {
    if (percentage >= 85) return "excellent";
    if (percentage >= 70) return "good";
    if (percentage >= 50) return "average";
    return "needs-improvement";
  };

  const getScoreLabel = (percentage) => {
    if (percentage >= 85) return "Excellent";
    if (percentage >= 70) return "Good";
    if (percentage >= 50) return "Average";
    return "Needs Improvement";
  };

  return (
    <div className="results-wrapper">
      <div className="results-header">
        <div className="results-header-content">
          <h2>Assessment Results</h2>
          <p className="results-subtitle">
            {students.length > 0 
              ? `${students.length} student${students.length > 1 ? 's' : ''} attempted this assessment`
              : 'View student performance and detailed answers'
            }
          </p>
        </div>
        
        {students.length > 0 && (
          <div className="results-stats-mini">
            <div className="stat-mini">
              <span className="stat-mini-value">{students.length}</span>
              <span className="stat-mini-label">Total Attempts</span>
            </div>
            <div className="stat-mini">
              <span className="stat-mini-value">
                {(students.reduce((acc, s) => acc + s.percentage, 0) / students.length).toFixed(0)}%
              </span>
              <span className="stat-mini-label">Avg Score</span>
            </div>
            <div className="stat-mini">
              <span className="stat-mini-value">
                {Math.max(...students.map(s => s.percentage)).toFixed(0)}%
              </span>
              <span className="stat-mini-label">Highest</span>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="results-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="assessment-card skeleton-card">
              <div className="skeleton skeleton-text medium"></div>
              <div className="skeleton skeleton-text short"></div>
              <div className="skeleton skeleton-text short"></div>
            </div>
          ))}
        </div>
      ) : students.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3>No Attempts Yet</h3>
          <p>No students have attempted this assessment. Results will appear here once students complete the test.</p>
        </div>
      ) : (
        <div className="results-grid">
          {students.map((student, index) => (
            <div 
              key={student.studentId} 
              className="assessment-card result-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="result-card-header">
                <div className="student-avatar">
                  {student.studentName.charAt(0).toUpperCase()}
                </div>
                <div className="student-info">
                  <h3>{student.studentName}</h3>
                  <span className={`status-badge ${getScoreClass(student.percentage)}`}>
                    {getScoreLabel(student.percentage)}
                  </span>
                </div>
              </div>

              <div className="result-card-body">
                <div className="score-section">
                  <div className="score-ring">
                    <svg viewBox="0 0 36 36" className="circular-chart">
                      <path
                        className="circle-bg"
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className={`circle ${getScoreClass(student.percentage)}`}
                        strokeDasharray={`${student.percentage}, 100`}
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="score-percentage">
                      {student.percentage.toFixed(0)}%
                    </div>
                  </div>
                  
                  <div className="score-details">
                    <div className="score-detail-item">
                      <span className="detail-label">Correct</span>
                      <span className="detail-value correct">{student.correctAnswers}</span>
                    </div>
                    <div className="score-detail-divider">/</div>
                    <div className="score-detail-item">
                      <span className="detail-label">Total</span>
                      <span className="detail-value">{student.totalQuestions}</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                className="primary-btn view-answers-btn"
                onClick={() =>
                  navigate(
                    `/faculty/assessment/${assessmentId}/student/${student.studentId}`
                  )
                }
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View Answers
              </button>

              <button
                className="secondary-btn submit-review-btn"
                style={{ marginTop: '10px', width: '100%' }}
                onClick={() =>
                  navigate(`/faculty/add-remark/${student.studentId}/${assessmentId}`)
                }
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Submit Review
              </button>

            </div>
          ))}
        </div>
      )}
    </div>
  );
  
}