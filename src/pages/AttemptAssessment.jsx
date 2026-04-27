import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getAssessmentQuestions,
  submitAssessment,
  getStudentAssessments,
  getStudentHistory,
} from "../services/api";
import "../styles/attempt.css";

export default function AttemptAssessment() {

  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [assessmentTitle, setAssessmentTitle] = useState("Assessment");
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [existingAttempt, setExistingAttempt] = useState(null);

  // ==========================
  // Load Questions and Assessment Info
  // ==========================
  useEffect(() => {

    const loadData = async () => {
      try {
        // Fetch questions
        const [questionsRes, historyRes] = await Promise.all([
          getAssessmentQuestions(assessmentId),
          user?.id ? getStudentHistory(user.id) : Promise.resolve({ data: [] }),
        ]);

        setQuestions(questionsRes.data || []);

        const attempt = (historyRes.data || []).find(
          item => item.assessmentId === parseInt(assessmentId)
        );
        if (attempt) {
          setExistingAttempt(attempt);
        }

        // Fetch assessment title
        if (user?.id) {
          const assessmentsRes = await getStudentAssessments(user.id);
          const currentAssessment = assessmentsRes.data.find(
            a => a.id === parseInt(assessmentId)
          );
          if (currentAssessment) {
            setAssessmentTitle(currentAssessment.title);
          }
        }
      } catch (error) {
        console.error("Error loading data", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

  }, [assessmentId, user?.id]);

  // ==========================
  // Handle Option Select
  // ==========================
  const handleSelect = (questionId, option) => {
    setAnswers({
      ...answers,
      [questionId]: option
    });
  };

  // ==========================
  // Navigation
  // ==========================
  const handleNext = () => {
    if (!answers[questions[currentIndex].id]) {
      setFeedback({ type: "error", message: "Please select an answer before proceeding." });
      return;
    }

    setFeedback({ type: "", message: "" });

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // ==========================
  // Submit Assessment
  // ==========================
  const handleSubmit = async () => {

    if (existingAttempt) {
      setFeedback({ type: "error", message: "You already attempted this assessment. Review your previous result." });
      return;
    }

    const unanswered = questions.filter(q => !answers[q.id]);
    if (unanswered.length > 0) {
      setFeedback({
        type: "error",
        message: `Please answer all questions before submitting. ${unanswered.length} question(s) remaining.`,
      });
      return;
    }

    const formattedAnswers = Object.keys(answers).map(qId => ({
      questionId: parseInt(qId),
      selectedAnswer: answers[qId]
    }));

    try {
      setSubmitting(true);
      setFeedback({ type: "", message: "" });

      const res = await submitAssessment({
        studentId: user.id,
        assessmentId: parseInt(assessmentId),
        answers: formattedAnswers
      });

      setFeedback({
        type: "success",
        message: `Assessment Submitted Successfully. Score: ${res.data.correctAnswers}/${res.data.totalQuestions} (${res.data.percentage.toFixed(2)}%)`,
      });

      setTimeout(() => {
        navigate("/student-dashboard", { state: { refresh: Date.now() } });
      }, 1400);

    } catch (error) {
      setFeedback({
        type: "error",
        message: error.response?.data?.message || "Submission failed. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="exam-wrapper">
        <div className="exam-header">
          <div className="exam-title">Assessment</div>
          <div className="exam-progress">
            <span>Loading...</span>
          </div>
        </div>
        <div className="exam-content">
          <div className="question-box">
            <h3>Loading Questions...</h3>
          </div>
        </div>
        <div className="exam-footer">
          <button className="nav-btn exit-btn" onClick={() => navigate("/student-dashboard")}>
            Exit
          </button>
          <div className="nav-group"></div>
        </div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="exam-wrapper">
        <div className="exam-header">
          <div className="exam-title">Assessment</div>
          <div className="exam-progress">
            <span>No Questions</span>
          </div>
        </div>
        <div className="exam-content">
          <div className="question-box">
            <h3>No questions found for this assessment.</h3>
            <p style={{ color: '#64748b', marginTop: '12px' }}>Please contact your faculty.</p>
          </div>
        </div>
        <div className="exam-footer">
          <button className="nav-btn exit-btn" onClick={() => navigate("/student-dashboard")}>
            Exit
          </button>
          <div className="nav-group"></div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="exam-wrapper">

      {/* HEADER */}
      <div className="exam-header" style={{ background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="exam-title" style={{ background: 'transparent', fontWeight: 600, fontSize: '18px', color: '#0f172a' }}>
          {assessmentTitle}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>
            {currentIndex + 1}/{questions.length}
          </span>
          <div style={{ width: '100px', height: '8px', background: '#e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${((currentIndex + 1) / questions.length) * 100}%`,
                background: 'linear-gradient(135deg, #5a4bff, #7c6cff)',
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        </div>
      </div>

      {/* QUESTION AREA */}
      <div className="exam-content">

        <div className="question-box">

          {feedback.message && (
            <div className={`exam-feedback ${feedback.type === "success" ? "success" : "error"}`}>
              {feedback.message}
            </div>
          )}

          {existingAttempt && (
            <div className="exam-feedback warning">
              You already attempted this assessment on {new Date(existingAttempt.submittedAt).toLocaleString()}. Duplicate attempts are disabled.
              <div className="exam-feedback-actions">
                <button
                  className="nav-btn"
                  onClick={() => navigate(`/student/review/${assessmentId}/${user.id}`)}
                >
                  View Previous Review
                </button>
                <button
                  className="nav-btn"
                  onClick={() => navigate("/student/assessments")}
                >
                  Back to Assessments
                </button>
              </div>
            </div>
          )}

          <h3>
            {currentIndex + 1}. {currentQuestion.questionText || currentQuestion.question || currentQuestion.text || "Question"}
          </h3>

          <div className="options-container">
            {["A", "B", "C", "D"].map((letter, index) => {

              // Try multiple possible field names
              let optionValue = 
                currentQuestion[`option${letter}`] || 
                currentQuestion[`option${letter.toLowerCase()}`] ||
                currentQuestion[`option_${letter.toLowerCase()}`] ||
                currentQuestion[letter.toLowerCase()] ||
                currentQuestion[letter] ||
                "";
              
              // Check if options are in an array
              if (!optionValue && currentQuestion.options && Array.isArray(currentQuestion.options)) {
                optionValue = currentQuestion.options[index] || "";
              }

              return (
                <button
                  key={letter}
                  className={`option-btn ${
                    answers[currentQuestion.id] === letter ? "selected" : ""
                  }`}
                  onClick={() => handleSelect(currentQuestion.id, letter)}
                >
                  <span className="option-letter">{letter}</span>
                  <span className="option-text">{optionValue || `Option ${letter}`}</span>
                </button>
              );
            })}
          </div>

        </div>

      </div>

      {/* FOOTER */}
      <div className="exam-footer">

        <button
          className="nav-btn exit-btn"
          onClick={() => navigate("/student-dashboard")}
        >
          Exit
        </button>

        <div className="nav-group">

          <button
            className="nav-btn"
            disabled={currentIndex === 0}
            onClick={handlePrevious}
          >
            Back
          </button>

          <button
            className="nav-btn primary-btn"
            onClick={handleNext}
            disabled={submitting || !!existingAttempt}
          >
            {submitting
              ? "Submitting..."
              : currentIndex === questions.length - 1
              ? "Submit"
              : "Next"}
          </button>

        </div>

      </div>

    </div>
  );
}