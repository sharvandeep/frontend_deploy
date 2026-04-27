import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getStudentAnswerReview, getAssessmentQuestions } from "../services/api";
import "../styles/studentdashboard.css";

export default function StudentAnswerReview() {

  const { assessmentId, studentId } = useParams();
  const [review, setReview] = useState(null);
  const [questions, setQuestions] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {

    const loadReview = async () => {
      try {
        // Fetch both review and questions data
        const [reviewRes, questionsRes] = await Promise.all([
          getStudentAnswerReview(assessmentId, studentId),
          getAssessmentQuestions(assessmentId)
        ]);
        
        setReview(reviewRes.data);
        
        // Create a map of question id to options
        const questionsMap = {};
        questionsRes.data.forEach(q => {
          questionsMap[q.id] = {
            optiona: q.optiona,
            optionb: q.optionb,
            optionc: q.optionc,
            optiond: q.optiond
          };
        });
        setQuestions(questionsMap);
        
      } catch (error) {
        console.error("Error loading review", error);
      } finally {
        setLoading(false);
      }
    };

    loadReview();

  }, [assessmentId, studentId]);

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return "#10b981";
    if (percentage >= 60) return "#f59e0b";
    return "#ef4444";
  };

  const getGrade = (percentage) => {
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B";
    if (percentage >= 60) return "C";
    return "D";
  };

  // Helper to get option text from letter
  const getOptionText = (questionId, letter) => {
    if (!letter) return 'No answer';
    const questionOptions = questions[questionId];
    if (questionOptions) {
      const optionKey = `option${letter.toLowerCase()}`;
      const optionText = questionOptions[optionKey];
      return optionText ? `${letter} - ${optionText}` : letter;
    }
    return letter;
  };

  if (loading) {
    return (
      <div className="review-page-wrapper">
        <div className="review-loading">
          <div className="review-loading-spinner"></div>
          <p>Loading student answers...</p>
        </div>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="review-page-wrapper">
        <div className="review-empty">
          <h3>No Data Found</h3>
          <p>Unable to load the student's answers.</p>
          <button onClick={() => navigate(-1)} className="review-back-btn">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="review-page-wrapper">
      
      {/* Header Section */}
      <div className="review-header">
        <button onClick={() => navigate(-1)} className="review-back-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Results
        </button>
        
        <div className="review-header-content">
          <h1>Student Answer Review</h1>
          <p>Detailed breakdown of student responses</p>
        </div>

        {/* Summary Card */}
        <div className="review-summary-card">
          <div className="review-score-circle" style={{ borderColor: getScoreColor(review.percentage) }}>
            <span className="review-percentage" style={{ color: getScoreColor(review.percentage) }}>
              {review.percentage.toFixed(0)}%
            </span>
            <span className="review-grade">{getGrade(review.percentage)}</span>
          </div>
          <div className="review-summary-stats">
            <div className="review-stat">
              <span className="review-stat-value correct">{review.correctAnswers}</span>
              <span className="review-stat-label">Correct</span>
            </div>
            <div className="review-stat">
              <span className="review-stat-value wrong">{review.wrongAnswers}</span>
              <span className="review-stat-label">Wrong</span>
            </div>
            <div className="review-stat">
              <span className="review-stat-value">{review.totalQuestions}</span>
              <span className="review-stat-label">Total</span>
            </div>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="review-questions-container">
        <h2 className="review-section-title">Question Breakdown</h2>
        
        <div className="review-questions-list">
          {review.questions.map((q, index) => (
            <div 
              key={index} 
              className={`review-question-card ${q.marks === 1 ? 'correct' : 'wrong'}`}
            >
              <div className="review-question-header">
                <span className="review-question-number">Q{index + 1}</span>
                <span className={`review-question-status ${q.marks === 1 ? 'correct' : 'wrong'}`}>
                  {q.marks === 1 ? '✓ Correct' : '✗ Incorrect'}
                </span>
              </div>
              
              <h4 className="review-question-text">{q.questionText}</h4>
              
              <div className="review-answers-grid">
                <div className={`review-answer-box student ${q.marks === 1 ? 'correct' : 'wrong'}`}>
                  <span className="review-answer-label">Student's Answer</span>
                  <span className="review-answer-value">{getOptionText(q.questionId, q.studentAnswer)}</span>
                </div>
                
                {q.marks !== 1 && (
                  <div className="review-answer-box correct-answer">
                    <span className="review-answer-label">Correct Answer</span>
                    <span className="review-answer-value">{getOptionText(q.questionId, q.correctAnswer)}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}