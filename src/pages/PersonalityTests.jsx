import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPersonalityTests } from "../services/api";
import "../styles/personality.css";

function PersonalityTests() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user || user.role !== "STUDENT") {
      navigate("/");
      return;
    }
    fetchTests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const response = await getPersonalityTests(user.id);
      setTests(response.data);
    } catch (err) {
      setError("Failed to load personality tests");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = (testId) => {
    navigate(`/student/personality-test/${testId}`);
  };

  const handleViewResults = () => {
    navigate("/student/personality-results");
  };

  if (loading) {
    return (
      <div className="personality-wrapper">
        <div className="personality-container">
          <div className="loading-spinner">Loading personality tests...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="personality-wrapper">
      <div className="personality-container">
        <div className="personality-header">
          <div className="header-content">
            <h1>🧠 Personality Assessment</h1>
            <p>Discover your personality traits using the Big Five (OCEAN) model</p>
          </div>
          <button className="view-results-btn" onClick={handleViewResults}>
            📊 View My Results
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="personality-info-card">
          <h3>What is the Big Five Personality Test?</h3>
          <p>
            The Big Five personality traits, also known as the OCEAN model, is a widely 
            accepted framework for understanding human personality. It measures five key dimensions:
          </p>
          <div className="traits-grid">
            <div className="trait-item openness">
              <span className="trait-icon">💡</span>
              <div>
                <strong>Openness</strong>
                <p>Creativity, curiosity, and openness to new experiences</p>
              </div>
            </div>
            <div className="trait-item conscientiousness">
              <span className="trait-icon">📋</span>
              <div>
                <strong>Conscientiousness</strong>
                <p>Organization, dependability, and self-discipline</p>
              </div>
            </div>
            <div className="trait-item extraversion">
              <span className="trait-icon">🎉</span>
              <div>
                <strong>Extraversion</strong>
                <p>Sociability, assertiveness, and positive emotions</p>
              </div>
            </div>
            <div className="trait-item agreeableness">
              <span className="trait-icon">🤝</span>
              <div>
                <strong>Agreeableness</strong>
                <p>Cooperation, trust, and helpfulness</p>
              </div>
            </div>
            <div className="trait-item neuroticism">
              <span className="trait-icon">🎭</span>
              <div>
                <strong>Emotional Stability</strong>
                <p>Calmness, confidence, and emotional resilience</p>
              </div>
            </div>
          </div>
        </div>

        <div className="tests-section">
          <h2>Available Tests</h2>
          
          {tests.length === 0 ? (
            <div className="no-tests">
              <p>No personality tests available at the moment.</p>
            </div>
          ) : (
            <div className="tests-grid">
              {tests.map((test) => (
                <div key={test.id} className={`test-card ${test.alreadyTaken ? 'completed' : ''}`}>
                  <div className="test-card-header">
                    <h3>{test.title}</h3>
                    {test.alreadyTaken && <span className="completed-badge">✓ Completed</span>}
                  </div>
                  <p className="test-description">{test.description}</p>
                  <div className="test-meta">
                    <span>📝 {test.totalQuestions} Questions</span>
                    <span>⏱️ ~{test.estimatedMinutes} mins</span>
                  </div>
                  {test.alreadyTaken ? (
                    <button 
                      className="view-result-btn"
                      onClick={handleViewResults}
                    >
                      View Results
                    </button>
                  ) : (
                    <button 
                      className="start-test-btn"
                      onClick={() => handleStartTest(test.id)}
                    >
                      Start Test
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <button className="back-btn" onClick={() => navigate("/student-dashboard")}>
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default PersonalityTests;
