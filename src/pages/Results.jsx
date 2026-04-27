import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/student-results.css";
import { getSkillAnalysis, getStudentResults } from "../services/api";

export default function Results() {

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const loadResults = async () => {
      if (!user?.id) return;

      try {
        const [resultsRes, skillsRes] = await Promise.all([
          getStudentResults(user.id),
          getSkillAnalysis(user.id),
        ]);

        setResults(resultsRes.data || []);
        setSkills(skillsRes.data || []);
      } catch (error) {
        console.error("Error loading results", error);
      } finally {
        setLoading(false);
      }
    };

    loadResults();

  }, [user?.id]);

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

  const strongestSkill = skills.length
    ? [...skills].sort((a, b) => (b.percentage || 0) - (a.percentage || 0))[0]
    : null;

  const weakestSkill = skills.length
    ? [...skills].sort((a, b) => (a.percentage || 0) - (b.percentage || 0))[0]
    : null;

  return (
    <div className="rr-page">
      <div className="rr-container">
        <div className="rr-header">
          <div>
            <h2>My Assessment Results</h2>
            <p>
              {results.length > 0
                ? `You have completed ${results.length} assessment${results.length > 1 ? "s" : ""}`
                : "Your completed assessments will appear here"}
            </p>
          </div>

          {results.length > 0 && (
            <div className="rr-kpi-grid">
              <div className="rr-kpi-card">
                <span>Completed</span>
                <strong>{results.length}</strong>
              </div>
              <div className="rr-kpi-card">
                <span>Avg Score</span>
                <strong>{(results.reduce((acc, r) => acc + r.percentage, 0) / results.length).toFixed(0)}%</strong>
              </div>
              <div className="rr-kpi-card">
                <span>Best Score</span>
                <strong>{Math.max(...results.map((r) => r.percentage)).toFixed(0)}%</strong>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="rr-grid">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rr-card rr-skeleton-card">
                <div className="rr-skeleton rr-skeleton-title"></div>
                <div className="rr-skeleton rr-skeleton-line"></div>
                <div className="rr-skeleton rr-skeleton-line short"></div>
              </div>
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="rr-empty-state">
            <div className="rr-empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h3>No Results Yet</h3>
            <p>You haven't completed any assessments yet. Start taking assessments to see your results here.</p>
          </div>
        ) : (
          <>
            <div className="rr-insights-grid">
              <article className="rr-insight-card strength">
                <h4>Strength</h4>
                {strongestSkill ? (
                  <>
                    <p className="rr-insight-main">{strongestSkill.skill}</p>
                    <span className="rr-insight-sub">{strongestSkill.percentage.toFixed(1)}% mastery</span>
                  </>
                ) : (
                  <p className="rr-insight-main">Not enough data yet</p>
                )}
              </article>

              <article className="rr-insight-card weakness">
                <h4>Weakness</h4>
                {weakestSkill ? (
                  <>
                    <p className="rr-insight-main">{weakestSkill.skill}</p>
                    <span className="rr-insight-sub">{weakestSkill.percentage.toFixed(1)}% current level</span>
                  </>
                ) : (
                  <p className="rr-insight-main">Not enough data yet</p>
                )}
              </article>

              <article className="rr-insight-card suggestion">
                <h4>Career Suggestion Page</h4>
                <p className="rr-insight-main">Explore paths based on your complete skill profile</p>
                <button className="rr-btn rr-btn-primary" onClick={() => navigate("/student/career-recommendations")}>
                  Open Career Suggestions
                </button>
              </article>
            </div>

            <div className="rr-grid">
              {results.map((result, index) => (
                <article key={index} className="rr-card" style={{ animationDelay: `${index * 0.08}s` }}>
                  <header className="rr-card-header">
                    <div className="rr-icon-wrap">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>

                    <div className="rr-title-wrap">
                      <h3>{result.assessmentTitle}</h3>
                      <span className={`rr-status rr-${getScoreClass(result.percentage)}`}>{getScoreLabel(result.percentage)}</span>
                    </div>
                  </header>

                  <div className="rr-score-block">
                    <div className="rr-score-ring">
                      <svg viewBox="0 0 36 36" className="rr-chart">
                        <path
                          className="rr-circle-bg"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className={`rr-circle rr-${getScoreClass(result.percentage)}`}
                          strokeDasharray={`${result.percentage}, 100`}
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <div className="rr-score-text">{result.percentage.toFixed(0)}%</div>
                    </div>

                    <div className="rr-score-meta">
                      <div className="rr-meta-item">
                        <span>Correct</span>
                        <strong className="correct">{result.correctAnswers}</strong>
                      </div>
                      <span className="rr-divider">/</span>
                      <div className="rr-meta-item">
                        <span>Total</span>
                        <strong>{result.totalQuestions}</strong>
                      </div>
                    </div>
                  </div>

                  <footer className="rr-card-footer">
                    <div className="rr-submitted">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v6l4 2" />
                      </svg>
                      <span>Submitted: {new Date(result.submittedAt).toLocaleString()}</span>
                    </div>

                    <button className="rr-btn rr-btn-primary rr-btn-full" onClick={() => navigate(`/student/report/${result.assessmentId}/${user.id}`)}>
                      View Report
                    </button>
                  </footer>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}