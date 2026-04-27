import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getCareerRecommendations } from "../services/api";
import "../styles/studentdashboard.css";

export default function StudentCareerRecommendations() {
  const navigate = useNavigate();
  const user = useMemo(() => JSON.parse(localStorage.getItem("user")) || {}, []);

  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.id) {
      navigate("/login");
      return;
    }

    const loadRecommendations = async () => {
      try {
        const res = await getCareerRecommendations(user.id);
        setRecommendations(res.data);
      } catch (err) {
        console.error("Career Recommendations Error:", err);
        setError("Unable to load career recommendations. Please complete some assessments first.");
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, [user?.id, navigate]);

  const getMatchLevelConfig = (level) => {
    switch (level) {
      case "EXCELLENT":
        return { color: "#22c55e", bg: "rgba(34, 197, 94, 0.1)", icon: "🌟", label: "Excellent Match" };
      case "GOOD":
        return { color: "#3b82f6", bg: "rgba(59, 130, 246, 0.1)", icon: "✨", label: "Good Match" };
      case "FAIR":
        return { color: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)", icon: "💡", label: "Fair Match" };
      case "DEVELOPING":
        return { color: "#94a3b8", bg: "rgba(148, 163, 184, 0.1)", icon: "🌱", label: "Developing" };
      default:
        return { color: "#6366f1", bg: "rgba(99, 102, 241, 0.1)", icon: "📊", label: "Potential" };
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return "#22c55e";
    if (percentage >= 60) return "#3b82f6";
    if (percentage >= 40) return "#f59e0b";
    return "#94a3b8";
  };

  // Sort recommendations by match percentage
  const sortedRecommendations = [...recommendations].sort(
    (a, b) => b.matchPercentage - a.matchPercentage
  );

  const topMatches = sortedRecommendations.filter(r => r.matchPercentage >= 70);
  const goodMatches = sortedRecommendations.filter(r => r.matchPercentage >= 50 && r.matchPercentage < 70);
  const otherMatches = sortedRecommendations.filter(r => r.matchPercentage < 50);

  return (
    <div className="sd-wrapper">
      <div className="sd-container">
        {/* Header */}
        <div className="sd-header">
          <button 
            className="sd-back-btn" 
            onClick={() => navigate("/student-dashboard")}
          >
            ← Back to Dashboard
          </button>
          <h2>Career Recommendations</h2>
          <p>Discover career paths that match your skills and interests</p>
        </div>

        {loading ? (
          <div className="sd-loading">
            <div className="loading-spinner"></div>
            <p>Analyzing your skills and finding career matches...</p>
          </div>
        ) : error ? (
          <div className="sd-empty-state">
            <div className="empty-icon">📋</div>
            <h3>No Data Available</h3>
            <p>{error}</p>
            <button 
              className="sd-action-btn primary"
              onClick={() => navigate("/student/assessments")}
            >
              Take Assessments
            </button>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="sd-empty-state">
            <div className="empty-icon">🎯</div>
            <h3>No Recommendations Yet</h3>
            <p>Complete more assessments to get personalized career recommendations based on your skill profile.</p>
            <button 
              className="sd-action-btn primary"
              onClick={() => navigate("/student/assessments")}
            >
              Browse Assessments
            </button>
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="career-summary">
              <div className="career-stat-card">
                <span className="stat-icon">🎯</span>
                <div className="stat-info">
                  <span className="stat-value">{recommendations.length}</span>
                  <span className="stat-label">Career Paths</span>
                </div>
              </div>
              <div className="career-stat-card">
                <span className="stat-icon">🌟</span>
                <div className="stat-info">
                  <span className="stat-value">{topMatches.length}</span>
                  <span className="stat-label">Top Matches</span>
                </div>
              </div>
              <div className="career-stat-card">
                <span className="stat-icon">📈</span>
                <div className="stat-info">
                  <span className="stat-value">
                    {recommendations.length > 0 
                      ? Math.round(recommendations[0]?.matchPercentage || 0) 
                      : 0}%
                  </span>
                  <span className="stat-label">Best Match</span>
                </div>
              </div>
            </div>

            {/* Top Matches Section */}
            {topMatches.length > 0 && (
              <div className="career-section">
                <h3 className="section-title">
                  <span className="title-icon">🌟</span> Top Career Matches
                </h3>
                <div className="career-cards-grid">
                  {topMatches.map((career) => (
                    <CareerCard key={career.id} career={career} getMatchLevelConfig={getMatchLevelConfig} getProgressColor={getProgressColor} featured />
                  ))}
                </div>
              </div>
            )}

            {/* Good Matches Section */}
            {goodMatches.length > 0 && (
              <div className="career-section">
                <h3 className="section-title">
                  <span className="title-icon">✨</span> Good Career Matches
                </h3>
                <div className="career-cards-grid">
                  {goodMatches.map((career) => (
                    <CareerCard key={career.id} career={career} getMatchLevelConfig={getMatchLevelConfig} getProgressColor={getProgressColor} />
                  ))}
                </div>
              </div>
            )}

            {/* Other Matches Section */}
            {otherMatches.length > 0 && (
              <div className="career-section">
                <h3 className="section-title">
                  <span className="title-icon">💡</span> Explore More Careers
                </h3>
                <div className="career-cards-grid">
                  {otherMatches.map((career) => (
                    <CareerCard key={career.id} career={career} getMatchLevelConfig={getMatchLevelConfig} getProgressColor={getProgressColor} />
                  ))}
                </div>
              </div>
            )}

            {/* Tips Section */}
            <div className="career-tips">
              <h3>💡 How to Improve Your Matches</h3>
              <ul>
                <li>Complete more skill assessments to refine your profile</li>
                <li>Focus on improving skills in areas where you scored lower</li>
                <li>Explore career paths that align with your strongest skills</li>
                <li>Consider careers in the "Good Match" category as growth opportunities</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Career Card Component
function CareerCard({ career, getMatchLevelConfig, getProgressColor, featured }) {
  const levelConfig = getMatchLevelConfig(career.matchLevel);
  const progressColor = getProgressColor(career.matchPercentage);

  return (
    <div className={`career-card ${featured ? 'featured' : ''}`}>
      <div className="career-card-header">
        <div className="career-match-badge" style={{ background: levelConfig.bg, color: levelConfig.color }}>
          <span>{levelConfig.icon}</span>
          <span>{levelConfig.label}</span>
        </div>
        <div className="career-match-percentage">
          <svg className="progress-ring" width="60" height="60">
            <circle
              className="progress-ring-bg"
              cx="30"
              cy="30"
              r="24"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="6"
            />
            <circle
              className="progress-ring-circle"
              cx="30"
              cy="30"
              r="24"
              fill="none"
              stroke={progressColor}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${career.matchPercentage * 1.508} 150.8`}
              transform="rotate(-90 30 30)"
            />
          </svg>
          <span className="percentage-text">{Math.round(career.matchPercentage)}%</span>
        </div>
      </div>

      <div className="career-card-body">
        <h4 className="career-name">{career.careerName}</h4>
        <p className="career-description">{career.description}</p>

        <div className="career-skills">
          <span className="skills-label">Required Skills:</span>
          <div className="skills-tags">
            {career.requiredSkills && (
              Array.isArray(career.requiredSkills) 
                ? career.requiredSkills 
                : career.requiredSkills.split(',').map(s => s.trim())
            ).map((skill, index) => (
              <span key={index} className="skill-tag">{skill}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
