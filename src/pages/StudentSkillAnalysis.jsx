import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getSkillAnalysis } from "../services/api";
import "../styles/student-skills.css";

export default function StudentSkillAnalysis() {

  const navigate = useNavigate();
  const user = useMemo(() => JSON.parse(localStorage.getItem("user")) || {}, []);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const loadSkills = async () => {

      if (!user?.id) return;

      try {
        const res = await getSkillAnalysis(user.id);
        setSkills(res.data);
      } catch (error) {
        console.error("Skill Analysis Error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSkills();

  }, [user?.id]);

  const getColor = (percentage) => {
    if (percentage >= 70) return "#22c55e";   // green
    if (percentage >= 40) return "#f59e0b";   // yellow
    return "#ef4444";                         // red
  };

  // Strength Classification
  const strongSkills = skills.filter(s => s.percentage >= 70);
  const moderateSkills = skills.filter(
    s => s.percentage >= 40 && s.percentage < 70
  );
  const weakSkills = skills.filter(s => s.percentage < 40);

  const avgScore = skills.length
    ? (skills.reduce((sum, s) => sum + s.percentage, 0) / skills.length).toFixed(1)
    : 0;

  return (
    <div className="ss-page">
      <div className="ss-container">

        <div className="ss-header">
          <button 
            className="ss-back-btn" 
            onClick={() => navigate("/student-dashboard")}
          >
            ← Back to Dashboard
          </button>
          <h2>Skill Analysis</h2>
          <p>Track your strengths, identify improvement zones, and plan smarter next steps.</p>

          <div className="ss-top-stats">
            <div className="ss-top-stat">
              <span>Skills Tracked</span>
              <strong>{skills.length}</strong>
            </div>
            <div className="ss-top-stat">
              <span>Average Score</span>
              <strong>{avgScore}%</strong>
            </div>
            <div className="ss-top-stat">
              <span>Strong Skills</span>
              <strong>{strongSkills.length}</strong>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="ss-loading">
            <div className="ss-loading-spinner"></div>
            <p>Loading skill analysis...</p>
          </div>
        ) : skills.length === 0 ? (
          <div className="ss-empty-state">
            <div className="ss-empty-icon">📊</div>
            <h3>No Assessment Data</h3>
            <p>Complete some assessments to see your skill analysis.</p>
            <button 
              className="ss-btn ss-btn-primary"
              onClick={() => navigate("/student/assessments")}
            >
              Take Assessments
            </button>
          </div>
        ) : (
          <>
            {/* Performance Summary */}
            <div className="ss-summary-grid">
              <article className="ss-summary-card strong">
                <h3>Strong Skills</h3>
                <p>
                  {strongSkills.length > 0
                    ? strongSkills.map(s => s.skill).join(", ")
                    : "No strong skills yet"}
                </p>
              </article>

              <article className="ss-summary-card moderate">
                <h3>Moderate Skills</h3>
                <p>
                  {moderateSkills.length > 0
                    ? moderateSkills.map(s => s.skill).join(", ")
                    : "No moderate skill category yet"}
                </p>
              </article>

              <article className="ss-summary-card weak">
                <h3>Needs Improvement</h3>
                <p>
                  {weakSkills.length > 0
                    ? weakSkills.map(s => s.skill).join(", ")
                    : "None - Excellent consistency"}
                </p>
              </article>
            </div>

            {/* Career Recommendations Link */}
            <div className="ss-career-card">
              <h3>Career Recommendations</h3>
              <p>
                Based on your skill profile, explore career paths that match your strengths and interests.
              </p>
              <button 
                className="ss-btn ss-btn-primary"
                onClick={() => navigate("/student/career-recommendations")}
              >
                View Career Recommendations →
              </button>
            </div>

            {/* Skill Breakdown Cards */}
            <div className="ss-skill-grid">
              {skills.map((skill, index) => (
                <article key={index} className="ss-skill-card">

                  <header className="ss-skill-header">
                    <h3>{skill.skill}</h3>
                    <span className="ss-skill-percent" style={{ color: getColor(skill.percentage) }}>
                      {skill.percentage.toFixed(1)}%
                    </span>
                  </header>

                  <p className="ss-skill-meta">
                    {skill.correct} / {skill.total} correct
                  </p>

                  <div className="ss-progress-track">
                    <div
                      className="ss-progress-fill"
                      style={{
                        width: `${skill.percentage}%`,
                        background: `linear-gradient(90deg, ${getColor(skill.percentage)}, ${getColor(skill.percentage)}cc)`
                      }}
                    />
                  </div>

                </article>
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  );
}