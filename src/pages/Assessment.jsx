import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAssessmentQuestions, getStudentHistory } from "../services/api";
import "../styles/studentdashboard.css";

export default function Assessment() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [questionCount, setQuestionCount] = useState(0);
  const [previousAttempt, setPreviousAttempt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAssessmentDetails = async () => {
      if (!assessmentId || !user?.id) return;

      try {
        // Fetch questions to get count and assessment info
        const questionsRes = await getAssessmentQuestions(assessmentId);
        setQuestionCount(questionsRes.data.length);

        // Check for previous attempts
        const historyRes = await getStudentHistory(user.id);
        const attempts = historyRes.data.filter(
          item => item.assessmentId === parseInt(assessmentId)
        );
        
        if (attempts.length > 0) {
          // Get the best attempt
          const bestAttempt = attempts.reduce((best, current) => 
            current.percentage > best.percentage ? current : best
          );
          setPreviousAttempt(bestAttempt);
        }

      } catch (error) {
        console.error("Error loading assessment details:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAssessmentDetails();
  }, [assessmentId, user?.id]);

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return "#10b981";
    if (percentage >= 60) return "#f59e0b";
    return "#ef4444";
  };

  const getGrade = (percentage) => {
    if (percentage >= 90) return { grade: "A+", message: "Excellent!" };
    if (percentage >= 80) return { grade: "A", message: "Great work!" };
    if (percentage >= 70) return { grade: "B", message: "Good job!" };
    if (percentage >= 60) return { grade: "C", message: "Keep improving!" };
    return { grade: "D", message: "Need more practice" };
  };

  if (loading) {
    return (
      <div className="assessment-preview-wrapper">
        <div className="preview-card">
          <h2>Loading Assessment Details...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="assessment-preview-wrapper">
      <div className="preview-card">
        <div className="preview-header">
          <div className="preview-icon"></div>
          <h1>Assessment Overview</h1>
          <p>Review the details before starting</p>
        </div>

        <div className="preview-details">
          <div className="detail-item">
            <div className="detail-icon"></div>
            <div className="detail-info">
              <span className="detail-label">Total Questions</span>
              <span className="detail-value">{questionCount}</span>
            </div>
          </div>

          <div className="detail-item">
            <div className="detail-icon"></div>
            <div className="detail-info">
              <span className="detail-label">Estimated Time</span>
              <span className="detail-value">{Math.ceil(questionCount * 1.5)} mins</span>
            </div>
          </div>

          <div className="detail-item">
            <div className="detail-icon"></div>
            <div className="detail-info">
              <span className="detail-label">Passing Score</span>
              <span className="detail-value">60%</span>
            </div>
          </div>
        </div>

        {previousAttempt && (
          <div className="previous-attempt-card">
            <h3>Previous Best Attempt</h3>
            <div className="attempt-stats">
              <div 
                className="attempt-score-circle"
                style={{ borderColor: getScoreColor(previousAttempt.percentage) }}
              >
                <span 
                  className="attempt-percentage"
                  style={{ color: getScoreColor(previousAttempt.percentage) }}
                >
                  {previousAttempt.percentage.toFixed(0)}%
                </span>
                <span className="attempt-grade">
                  {getGrade(previousAttempt.percentage).grade}
                </span>
              </div>
              <div className="attempt-details">
                <p className="attempt-message">
                  {getGrade(previousAttempt.percentage).message}
                </p>
                <p className="attempt-fraction">
                  {previousAttempt.correctAnswers} / {previousAttempt.totalQuestions} correct
                </p>
                <p className="attempt-date">
                  Attempted: {new Date(previousAttempt.submittedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="preview-instructions">
          <h3>Instructions</h3>
          <ul>
            <li>Read each question carefully before selecting an answer</li>
            <li>You must answer each question before proceeding to the next</li>
            <li>You can navigate back to previous questions</li>
            <li>Your progress will be submitted when you click "Submit"</li>
            <li>One attempt per assessment is allowed</li>
          </ul>
        </div>

        <div className="preview-actions">
          <button 
            className="secondary-btn"
            onClick={() => navigate("/student/assessments")}
          >
            Back to Assessments
          </button>
          {questionCount === 0 ? (
            <button className="primary-btn" disabled>
              No Questions Available
            </button>
          ) : previousAttempt ? (
            <button
              className="primary-btn"
              onClick={() => navigate(`/student/review/${assessmentId}/${user.id}`)}
            >
              View Previous Review
            </button>
          ) : (
            <button
              className="primary-btn"
              onClick={() => navigate(`/student/attempt/${assessmentId}`)}
            >
              Start Assessment
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
