import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPersonalityQuestions, submitPersonalityTest } from "../services/api";
import "../styles/exam.css";
import "../styles/personality.css";

function TakePersonalityTest() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  const likertOptions = [
    { value: 1, label: "Strongly Disagree", emoji: "😟" },
    { value: 2, label: "Disagree", emoji: "🙁" },
    { value: 3, label: "Neutral", emoji: "😐" },
    { value: 4, label: "Agree", emoji: "🙂" },
    { value: 5, label: "Strongly Agree", emoji: "😄" },
  ];

  useEffect(() => {
    if (!user || user.role !== "STUDENT") {
      navigate("/");
      return;
    }
    fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await getPersonalityQuestions(testId);
      setQuestions(response.data);
    } catch (err) {
      setError("Failed to load test questions");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleClearAnswer = (questionId) => {
    setAnswers((prev) => {
      const newAnswers = { ...prev };
      delete newAnswers[questionId];
      return newAnswers;
    });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    // Check all questions answered
    const unanswered = questions.filter((q) => !answers[q.id]);
    if (unanswered.length > 0) {
      setError(`Please answer all questions. ${unanswered.length} questions remaining.`);
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const submissionData = {
        testId: parseInt(testId),
        studentId: user.id,
        answers: Object.entries(answers).map(([questionId, response]) => ({
          questionId: parseInt(questionId),
          response: response,
        })),
      };

      const response = await submitPersonalityTest(submissionData);
      
      // Navigate to results page with the result
      navigate("/student/personality-results", { 
        state: { newResult: response.data } 
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit test. Please try again.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const progress = questions.length > 0 
    ? Math.round((Object.keys(answers).length / questions.length) * 100) 
    : 0;

  if (loading) {
    return (
      <div className="exam-wrapper personality-exam">
        <header className="exam-header">
          <div className="exam-title">🧠 Personality Assessment</div>
          <div></div>
          <button className="exit-btn nav-btn" onClick={() => navigate("/student/personality-tests")}>
            Exit Test
          </button>
        </header>
        <main className="exam-content">
          <div className="question-box">
            <div className="loading-spinner">Loading questions...</div>
          </div>
        </main>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="exam-wrapper personality-exam">
        <header className="exam-header">
          <div className="exam-title">🧠 Personality Assessment</div>
          <div></div>
          <button className="exit-btn nav-btn" onClick={() => navigate("/student/personality-tests")}>
            Exit Test
          </button>
        </header>
        <main className="exam-content">
          <div className="question-box">
            <div className="error-message">No questions found for this test.</div>
            <button className="back-btn" onClick={() => navigate("/student/personality-tests")}>
              ← Back to Tests
            </button>
          </div>
        </main>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="exam-wrapper personality-exam">
      {/* HEADER */}
      <header className="exam-header">
        <div className="exam-title">🧠 Personality Assessment</div>
        <div className="exam-progress">
          <span>{Object.keys(answers).length} of {questions.length} answered</span>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
        <button className="exit-btn nav-btn" onClick={() => navigate("/student/personality-tests")}>
          Exit Test
        </button>
      </header>

      {/* CONTENT */}
      <main className="exam-content">
        <div className="question-box">
          {error && <div className="error-message">{error}</div>}
          
          <div className="question-number-badge">
            Question {currentQuestion + 1} of {questions.length}
          </div>
          
          <h3 className="question-text">{currentQ.questionText}</h3>
          
          <div className="likert-scale">
            {likertOptions.map((option) => (
              <button
                key={option.value}
                className={`likert-option ${answers[currentQ.id] === option.value ? 'selected' : ''}`}
                onClick={() => handleAnswer(currentQ.id, option.value)}
              >
                <span className="likert-emoji">{option.emoji}</span>
                <span className="likert-value">{option.value}</span>
                <span className="likert-label">{option.label}</span>
              </button>
            ))}
          </div>

          {/* Clear Button */}
          {answers[currentQ.id] && (
            <button 
              className="clear-btn"
              onClick={() => handleClearAnswer(currentQ.id)}
            >
              ✕ Clear Selection
            </button>
          )}

          <div className="test-tips">
            <h4>💡 Tips</h4>
            <ul>
              <li>There are no right or wrong answers</li>
              <li>Answer based on how you typically feel or behave</li>
              <li>Don't overthink - go with your first instinct</li>
            </ul>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="exam-footer">
        <div className="nav-group">
          <button 
            className="nav-btn" 
            onClick={handlePrev}
            disabled={currentQuestion === 0}
          >
            ← Previous
          </button>
        </div>

        <div className="question-dots">
          {questions.map((q, idx) => (
            <span
              key={q.id}
              className={`dot ${idx === currentQuestion ? 'current' : ''} ${answers[q.id] ? 'answered' : ''}`}
              onClick={() => setCurrentQuestion(idx)}
              title={`Question ${idx + 1}`}
            />
          ))}
        </div>

        <div className="nav-group">
          {currentQuestion === questions.length - 1 ? (
            <button 
              className="nav-btn primary-btn submit-btn"
              onClick={handleSubmit}
              disabled={submitting || Object.keys(answers).length !== questions.length}
            >
              {submitting ? "Submitting..." : "Submit Test ✓"}
            </button>
          ) : (
            <button 
              className="nav-btn primary-btn" 
              onClick={handleNext}
            >
              Next →
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}

export default TakePersonalityTest;
