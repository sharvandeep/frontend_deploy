import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { exportPersonalityResultReport, getPersonalityResults } from "../services/api";
import "../styles/personality.css";

function PersonalityResults() {
  const [results, setResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadingReport, setDownloadingReport] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user || user.role !== "STUDENT") {
      navigate("/");
      return;
    }
    fetchResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Check if we have a new result from submission
    if (location.state?.newResult) {
      setSelectedResult(location.state.newResult);
    }
  }, [location.state]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await getPersonalityResults(user.id);
      setResults(response.data);
      
      // Select the most recent result if available and no new result
      if (response.data.length > 0 && !location.state?.newResult) {
        setSelectedResult(response.data[0]);
      }
    } catch (err) {
      setError("Failed to load personality results");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getTraitColor = (trait) => {
    const colors = {
      OPENNESS: "#9b59b6",
      CONSCIENTIOUSNESS: "#3498db",
      EXTRAVERSION: "#e74c3c",
      AGREEABLENESS: "#2ecc71",
      NEUROTICISM: "#f39c12",
    };
    return colors[trait] || "#95a5a6";
  };

  const getLevelClass = (level) => {
    switch (level) {
      case "HIGH": return "level-high";
      case "MODERATE": return "level-moderate";
      case "LOW": return "level-low";
      default: return "";
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDownloadPersonalityReport = async () => {
    if (!selectedResult?.id) return;

    try {
      setDownloadingReport(true);
      const response = await exportPersonalityResultReport(selectedResult.id);
      const contentDisposition = response?.headers?.["content-disposition"] || "";
      const match = contentDisposition.match(/filename="?([^";]+)"?/i);
      const fileName = match?.[1] || `personality-report-${selectedResult.id}.pdf`;

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download personality report", err);
    } finally {
      setDownloadingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="personality-wrapper">
        <div className="personality-container">
          <div className="loading-spinner">Loading results...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="personality-wrapper">
      <div className="results-container">
        <div className="results-header">
          <h1>🧠 Your Personality Profile</h1>
          <p>Understanding your Big Five personality traits</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {results.length === 0 && !selectedResult ? (
          <div className="no-results">
            <div className="no-results-icon">📝</div>
            <h3>No Results Yet</h3>
            <p>You haven't taken any personality tests yet.</p>
            <button 
              className="take-test-btn"
              onClick={() => navigate("/student/personality-tests")}
            >
              Take a Personality Test
            </button>
          </div>
        ) : selectedResult && (
          <>
            {/* Dominant Traits Card */}
            <div className="dominant-traits-card">
              <h2>Your Dominant Traits</h2>
              <div className="dominant-traits">
                <div className="dominant-trait primary">
                  <span className="trait-label">Primary</span>
                  <h3>{selectedResult.dominantTrait}</h3>
                  <p>{selectedResult.dominantTraitDescription}</p>
                </div>
                <div className="dominant-trait secondary">
                  <span className="trait-label">Secondary</span>
                  <h3>{selectedResult.secondaryTrait}</h3>
                  <p>{selectedResult.secondaryTraitDescription}</p>
                </div>
              </div>
            </div>

            {/* Trait Scores Chart */}
            <div className="trait-scores-card">
              <h2>Trait Breakdown</h2>
              <div className="trait-bars">
                {selectedResult.traitScores?.map((trait) => (
                  <div key={trait.trait} className="trait-bar-item">
                    <div className="trait-bar-header">
                      <span className="trait-name">{trait.displayName}</span>
                      <span className={`trait-level ${getLevelClass(trait.level)}`}>
                        {trait.level}
                      </span>
                    </div>
                    <div className="trait-bar-container">
                      <div 
                        className="trait-bar-fill"
                        style={{ 
                          width: `${trait.score}%`,
                          backgroundColor: getTraitColor(trait.trait)
                        }}
                      >
                        <span className="trait-score">{Math.round(trait.score)}%</span>
                      </div>
                    </div>
                    <p className="trait-description">{trait.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Radar Chart Visual */}
            <div className="radar-chart-card">
              <h2>Personality Overview</h2>
              <div className="radar-visual">
                <div className="radar-center">
                  <div className="radar-point openness" style={{ '--score': selectedResult.opennessScore }}>
                    <span>O</span>
                    <span className="radar-value">{Math.round(selectedResult.opennessScore)}%</span>
                  </div>
                  <div className="radar-point conscientiousness" style={{ '--score': selectedResult.conscientiousnessScore }}>
                    <span>C</span>
                    <span className="radar-value">{Math.round(selectedResult.conscientiousnessScore)}%</span>
                  </div>
                  <div className="radar-point extraversion" style={{ '--score': selectedResult.extraversionScore }}>
                    <span>E</span>
                    <span className="radar-value">{Math.round(selectedResult.extraversionScore)}%</span>
                  </div>
                  <div className="radar-point agreeableness" style={{ '--score': selectedResult.agreeablenessScore }}>
                    <span>A</span>
                    <span className="radar-value">{Math.round(selectedResult.agreeablenessScore)}%</span>
                  </div>
                  <div className="radar-point neuroticism" style={{ '--score': selectedResult.neuroticismScore }}>
                    <span>N</span>
                    <span className="radar-value">{Math.round(selectedResult.neuroticismScore)}%</span>
                  </div>
                </div>
              </div>
              <div className="radar-legend">
                <span><strong>O</strong> - Openness</span>
                <span><strong>C</strong> - Conscientiousness</span>
                <span><strong>E</strong> - Extraversion</span>
                <span><strong>A</strong> - Agreeableness</span>
                <span><strong>N</strong> - Emotional Stability</span>
              </div>
            </div>

            {/* Test Info */}
            <div className="test-info-card">
              <h3>Test Information</h3>
              <p><strong>Test:</strong> {selectedResult.testTitle}</p>
              <p><strong>Completed:</strong> {formatDate(selectedResult.submittedAt)}</p>
            </div>

            {/* History */}
            {results.length > 1 && (
              <div className="history-card">
                <h3>Test History</h3>
                <div className="history-list">
                  {results.map((result) => (
                    <div 
                      key={result.id} 
                      className={`history-item ${selectedResult.id === result.id ? 'selected' : ''}`}
                      onClick={() => setSelectedResult(result)}
                    >
                      <span className="history-date">{formatDate(result.submittedAt)}</span>
                      <span className="history-dominant">{result.dominantTrait}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div className="results-actions">
          <button
            className="action-btn report-btn"
            onClick={handleDownloadPersonalityReport}
            disabled={!selectedResult || downloadingReport}
          >
            {downloadingReport ? "Preparing Report..." : "Download Personality Report"}
          </button>
          <button 
            className="action-btn career-btn"
            onClick={() => navigate("/student/career-recommendations")}
          >
            🎯 View Career Recommendations
          </button>
          <button 
            className="action-btn tests-btn"
            onClick={() => navigate("/student/personality-tests")}
          >
            📝 Take Another Test
          </button>
          <button 
            className="back-btn"
            onClick={() => navigate("/student-dashboard")}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default PersonalityResults;
