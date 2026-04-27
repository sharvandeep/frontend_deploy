import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFacultyAssessments, getAssessmentResults } from "../services/api";
import "../styles/facultydashboard.css";

export default function FacultyResults() {

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [assessments, setAssessments] = useState([]);
  const [submissionCounts, setSubmissionCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {

    const loadAssessments = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const res = await getFacultyAssessments(user.id);
        const assessmentsData = res.data;
        setAssessments(assessmentsData);

        // Fetch submission counts for each assessment
        const counts = {};
        await Promise.all(
          assessmentsData.map(async (assessment) => {
            try {
              const resultsRes = await getAssessmentResults(assessment.id);
              counts[assessment.id] = resultsRes.data?.length || 0;
            } catch {
              counts[assessment.id] = 0;
            }
          })
        );
        setSubmissionCounts(counts);

      } catch (error) {
        console.error("Error loading assessments", error);
      } finally {
        setLoading(false);
      }
    };

    loadAssessments();

  }, [user?.id]);

  return (
    <div className="fd-wrapper">
      <div className="fd-container">

        {/* Header */}
        <div className="fd-header">
          <div className="fd-header-content">
            <h2>Assessment Results</h2>
            <p>Review student submissions and track performance</p>
          </div>
          
          <div className="fd-stats">
            <div className="fd-stat-card">
              <div className="fd-stat-value">{assessments.length}</div>
              <div className="fd-stat-label">Assessments</div>
            </div>
            <div className="fd-stat-card">
              <div className="fd-stat-value">
                {Object.values(submissionCounts).reduce((sum, count) => sum + count, 0)}
              </div>
              <div className="fd-stat-label">Submissions</div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="fd-card" style={{ textAlign: 'center', padding: '60px' }}>
            <div className="fd-card-icon results" style={{ margin: '0 auto 20px' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
              </svg>
            </div>
            <p style={{ color: 'var(--fd-text-secondary)' }}>Loading assessments...</p>
          </div>
        ) : assessments.length === 0 ? (
          /* Empty State */
          <div className="fd-card" style={{ textAlign: 'center', padding: '60px' }}>
            <div className="fd-card-icon results" style={{ margin: '0 auto 20px' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 style={{ marginBottom: '12px', color: 'var(--fd-text-primary)' }}>No Assessments Yet</h3>
            <p style={{ color: 'var(--fd-text-secondary)', marginBottom: '24px' }}>
              Create your first assessment to start tracking student results.
            </p>
            <button 
              className="fd-btn primary"
              onClick={() => navigate("/faculty/create-assessment")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Create Assessment
            </button>
          </div>
        ) : (
          /* Assessment Grid */
          <div className="fd-row">
            {assessments.map((assessment, index) => (
              <div 
                key={assessment.id} 
                className="fd-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="fd-card-icon results">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                </div>
                
                <h3>{assessment.title}</h3>
                <p>{assessment.description || "No description provided"}</p>
                
                {/* Assessment Stats */}
                <div style={{ 
                  display: 'flex', 
                  gap: '16px', 
                  marginBottom: '20px',
                  paddingTop: '16px',
                  borderTop: '1px solid rgba(99, 102, 241, 0.1)'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      fontSize: '20px', 
                      fontWeight: '700',
                      color: 'var(--fd-primary)'
                    }}>
                      {assessment.questionCount || assessment.questions?.length || '--'}
                    </div>
                    <div style={{ 
                      fontSize: '11px', 
                      color: 'var(--fd-text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>Questions</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      fontSize: '20px', 
                      fontWeight: '700',
                      color: 'var(--fd-success)'
                    }}>
                      {submissionCounts[assessment.id] !== undefined ? submissionCounts[assessment.id] : '--'}
                    </div>
                    <div style={{ 
                      fontSize: '11px', 
                      color: 'var(--fd-text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>Submissions</div>
                  </div>
                </div>

                <button
                  className="fd-btn success"
                  onClick={() => navigate(`/faculty/assessment/${assessment.id}/results`)}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View Results
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Back Button */}
        <div className="fd-quick-actions" style={{ marginTop: '40px' }}>
          <div className="quick-actions-grid">
            <button className="quick-action-btn" onClick={() => navigate("/faculty-dashboard")}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </button>
            <button className="quick-action-btn" onClick={() => navigate("/faculty/create-assessment")}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
              New Assessment
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}