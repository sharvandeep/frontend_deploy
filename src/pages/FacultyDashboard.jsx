import { useEffect, useState, useMemo, useCallback } from "react";
import "../styles/facultydashboard.css";
import { useNavigate } from "react-router-dom";
import { getFacultyAssessments, getAssessmentResults } from "../services/api";

export default function FacultyDashboard() {

  const navigate = useNavigate();
  const user = useMemo(() => JSON.parse(localStorage.getItem("user")) || {}, []);

  const [assessments, setAssessments] = useState([]);
  const [allResults, setAllResults] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentSearch, setStudentSearch] = useState("");
  const [assessmentFilter, setAssessmentFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");

  const normalizeLabel = useCallback((value, fallback = "N/A") => {
    if (value == null) return fallback;
    if (typeof value === "string") {
      const trimmed = value.trim();
      return trimmed || fallback;
    }
    if (typeof value === "number" || typeof value === "boolean") {
      return String(value);
    }
    if (typeof value === "object") {
      if (typeof value.name === "string" && value.name.trim()) return value.name.trim();
      if (typeof value.title === "string" && value.title.trim()) return value.title.trim();
      if (value.id != null) return `ID ${value.id}`;
    }
    return fallback;
  }, []);

  // Calculate stats from real data
  const stats = useMemo(() => {
    const totalAssessments = assessments.length;
    const totalAttempts = allResults.length;
    
    let avgScore = 0;
    let highestScore = 0;
    
    if (allResults.length > 0) {
      const totalPercentage = allResults.reduce((sum, r) => sum + (r.percentage || 0), 0);
      avgScore = Math.round(totalPercentage / allResults.length);
      highestScore = Math.round(Math.max(...allResults.map(r => r.percentage || 0)));
    }
    
    return { totalAssessments, totalAttempts, avgScore, highestScore };
  }, [assessments, allResults]);

  // Calculate performance insights
  const performanceInsights = useMemo(() => {
    if (allResults.length === 0) {
      return { weakest: "N/A", strongest: "N/A", passRate: 0 };
    }

    // Group results by assessment
    const assessmentStats = {};
    allResults.forEach(result => {
      const key = result.assessmentTitle || result.assessmentId;
      if (!assessmentStats[key]) {
        assessmentStats[key] = { total: 0, sum: 0, title: result.assessmentTitle || `Assessment ${result.assessmentId}` };
      }
      assessmentStats[key].total++;
      assessmentStats[key].sum += result.percentage || 0;
    });

    // Calculate averages per assessment
    const assessmentAverages = Object.entries(assessmentStats).map(([, data]) => ({
      title: data.title,
      average: data.sum / data.total
    }));

    assessmentAverages.sort((a, b) => a.average - b.average);

    const weakest = assessmentAverages.length > 0 ? assessmentAverages[0].title : "N/A";
    const strongest = assessmentAverages.length > 0 ? assessmentAverages[assessmentAverages.length - 1].title : "N/A";

    // Pass rate (>=40% is pass)
    const passCount = allResults.filter(r => (r.percentage || 0) >= 40).length;
    const passRate = allResults.length > 0 ? Math.round((passCount / allResults.length) * 100) : 0;

    return { weakest, strongest, passRate };
  }, [allResults]);

  const analytics = useMemo(() => {
    if (allResults.length === 0) {
      return {
        passCount: 0,
        failCount: 0,
        excellentCount: 0,
        averageCount: 0,
        strugglingCount: 0,
        topStudents: [],
      };
    }

    const passCount = allResults.filter(r => (r.percentage || 0) >= 40).length;
    const failCount = allResults.length - passCount;

    const excellentCount = allResults.filter(r => (r.percentage || 0) >= 85).length;
    const averageCount = allResults.filter(r => (r.percentage || 0) >= 50 && (r.percentage || 0) < 85).length;
    const strugglingCount = allResults.filter(r => (r.percentage || 0) < 50).length;

    const byStudent = {};
    allResults.forEach((result) => {
      const name = result.studentName || `Student ${result.studentId || "N/A"}`;
      if (!byStudent[name]) {
        byStudent[name] = { total: 0, count: 0 };
      }
      byStudent[name].total += result.percentage || 0;
      byStudent[name].count += 1;
    });

    const topStudents = Object.entries(byStudent)
      .map(([name, data]) => ({
        name,
        avg: data.count > 0 ? Math.round(data.total / data.count) : 0,
      }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 3);

    return {
      passCount,
      failCount,
      excellentCount,
      averageCount,
      strugglingCount,
      topStudents,
    };
  }, [allResults]);

  const loadDashboardData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      // Fetch assessments
      const assessmentsRes = await getFacultyAssessments(user.id);
      const assessmentsData = assessmentsRes.data || [];
      setAssessments(assessmentsData);

      // Fetch all results for each assessment
      const allResultsData = [];
      const activities = [];

      await Promise.all(
        assessmentsData.map(async (assessment) => {
          try {
            const resultsRes = await getAssessmentResults(assessment.id);
            const results = resultsRes.data || [];
            
            results.forEach(result => {
              const assessmentTitle = normalizeLabel(assessment.title, `Assessment ${assessment.id}`);
              const branchName = normalizeLabel(
                assessment.branchName ?? assessment.branch?.name ?? assessment.branch,
                "N/A"
              );

              allResultsData.push({
                ...result,
                assessmentTitle,
                assessmentId: assessment.id,
                branchName,
              });
              
              // Create activity entries
              activities.push({
                type: 'submission',
                message: `${result.studentName || 'Student'} completed "${assessmentTitle}" – ${Math.round(result.percentage || 0)}%`,
                date: result.submittedAt || new Date().toISOString()
              });
            });
          } catch (err) {
            console.error(`Error fetching results for assessment ${assessment.id}:`, err);
          }
        })
      );

      // Add assessment creation activities
      assessmentsData.forEach(assessment => {
        const assessmentTitle = normalizeLabel(assessment.title, `Assessment ${assessment.id}`);
        activities.push({
          type: 'created',
          message: `Assessment "${assessmentTitle}" created`,
          date: assessment.createdAt || new Date().toISOString()
        });
      });

      // Sort by date descending and take recent 5
      activities.sort((a, b) => new Date(b.date) - new Date(a.date));
      setRecentActivity(activities.slice(0, 5));
      
      setAllResults(allResultsData);
    } catch (error) {
      console.error("Dashboard Load Error:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, normalizeLabel]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const assessmentOptions = useMemo(() => {
    const map = new Map();
    allResults.forEach((r) => {
      map.set(String(r.assessmentId), normalizeLabel(r.assessmentTitle, `Assessment ${r.assessmentId}`));
    });
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
  }, [allResults, normalizeLabel]);

  const branchOptions = useMemo(() => {
    const unique = new Set(
      allResults.map((r) => normalizeLabel(r.branchName, "N/A"))
    );
    return Array.from(unique).filter(Boolean);
  }, [allResults, normalizeLabel]);

  const filteredSubmissions = useMemo(() => {
    return allResults.filter((r) => {
      const studentName = (r.studentName || "").toLowerCase();
      const matchesStudent = !studentSearch.trim() || studentName.includes(studentSearch.trim().toLowerCase());
      const matchesAssessment = assessmentFilter === "all" || String(r.assessmentId) === assessmentFilter;
      const matchesBranch = branchFilter === "all" || (r.branchName || "N/A") === branchFilter;
      return matchesStudent && matchesAssessment && matchesBranch;
    });
  }, [allResults, studentSearch, assessmentFilter, branchFilter]);

  return (
    <div className="fd-wrapper">
      <div className="fd-container">

        {/* ================= HEADER ================= */}
        <div className="fd-header">
          <div className="fd-header-content">
            <h2>Faculty Dashboard</h2>
            <p>Manage assessments and track student performance insights</p>

            <div className="welcome-badge">
              <div className="avatar">
                {user.name?.charAt(0).toUpperCase() || "F"}
              </div>
              <span>Welcome back, {user.name || "Faculty"}</span>
            </div>
          </div>

          {/* Stats Section */}
          <div className="fd-stats">
            <div className="fd-stat-card">
              <div className="fd-stat-value">{loading ? "..." : stats.totalAssessments}</div>
              <div className="fd-stat-label">Assessments</div>
            </div>
            <div className="fd-stat-card">
              <div className="fd-stat-value">{loading ? "..." : stats.totalAttempts}</div>
              <div className="fd-stat-label">Students Attempted</div>
            </div>
            <div className="fd-stat-card">
              <div className="fd-stat-value">{loading ? "..." : `${stats.avgScore}%`}</div>
              <div className="fd-stat-label">Avg Score</div>
            </div>
            <div className="fd-stat-card">
              <div className="fd-stat-value">{loading ? "..." : `${stats.highestScore}%`}</div>
              <div className="fd-stat-label">Highest Score</div>
            </div>
          </div>
        </div>

        {/* ================= MAIN ACTION ROW ================= */}
        <div className="fd-row">

          {/* CREATE ASSESSMENT */}
          <div className="fd-card">
            <h3>Create Assessment</h3>
            <p>
              Design and publish new career assessment tests for your students.
            </p>
            <button
              className="fd-btn primary"
              onClick={() => navigate("/faculty/create-assessment")}
            >
              Create Assessment
            </button>
          </div>

          {/* VIEW RESULTS */}
          <div className="fd-card">
            <h3>View Results</h3>
            <p>
              Review student submissions and analyze performance trends.
            </p>
            <button
              className="fd-btn success"
              onClick={() => navigate("/faculty/results")}
            >
              View Results
            </button>
{/* 
<button
  onClick={() =>
    navigate(`/faculty/add-remark/${student.id}/${student.assessmentId}`)
  }
>
  Add Remark
</button>
*/}
          </div>

        </div>

        {/* ================= PERFORMANCE OVERVIEW ================= */}
        <div className="fd-card fd-full">
          <h3>Performance Overview</h3>
          {loading ? (
            <p style={{ color: 'var(--fd-text-secondary)' }}>Loading performance data...</p>
          ) : allResults.length === 0 ? (
            <p style={{ color: 'var(--fd-text-secondary)' }}>No student submissions yet. Data will appear here once students attempt assessments.</p>
          ) : (
            <div className="performance-grid">
              <div className="performance-box">
                <h4>Weakest Topic</h4>
                <p>{performanceInsights.weakest}</p>
              </div>
              <div className="performance-box">
                <h4>Strongest Topic</h4>
                <p>{performanceInsights.strongest}</p>
              </div>
              <div className="performance-box">
                <h4>Pass Percentage</h4>
                <p>{performanceInsights.passRate}%</p>
              </div>
            </div>
          )}
        </div>

        {/* ================= RECENT ACTIVITY ================= */}
        <div className="fd-card fd-full">
          <h3>Recent Activity</h3>
          {loading ? (
            <p style={{ color: 'var(--fd-text-secondary)' }}>Loading activity...</p>
          ) : recentActivity.length === 0 ? (
            <p style={{ color: 'var(--fd-text-secondary)' }}>No recent activity. Create assessments and wait for student submissions.</p>
          ) : (
            <ul className="activity-list">
              {recentActivity.map((activity, index) => (
                <li key={index}>
                  {activity.type === 'submission' ? '📝 ' : '✨ '}
                  {activity.message}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ================= ANALYTICS SECTION ================= */}
        <div className="fd-card fd-full">
          <h3>Analytics Summary</h3>
          {loading ? (
            <p style={{ color: 'var(--fd-text-secondary)' }}>Loading analytics...</p>
          ) : allResults.length === 0 ? (
            <p style={{ color: 'var(--fd-text-secondary)' }}>
              No data available for analytics. Analytics will be generated once students submit assessments.
            </p>
          ) : (
            <>
              <p style={{ marginBottom: '20px', color: 'var(--fd-text-secondary)' }}>
                Based on {stats.totalAttempts} submissions across {stats.totalAssessments} assessments
              </p>
              <div className="performance-grid">
                <div className="performance-box">
                  <h4>Average Performance</h4>
                  <p>{stats.avgScore}%</p>
                </div>
                <div className="performance-box">
                  <h4>Total Submissions</h4>
                  <p>{stats.totalAttempts}</p>
                </div>
                <div className="performance-box">
                  <h4>Top Score</h4>
                  <p>{stats.highestScore}%</p>
                </div>
              </div>

              <div className="fd-analytics-grid">
                <div className="fd-analytics-card">
                  <h4>Pass vs Fail</h4>
                  <div className="fd-analytics-row">
                    <span className="fd-chip success">Pass: {analytics.passCount}</span>
                    <span className="fd-chip danger">Fail: {analytics.failCount}</span>
                  </div>
                </div>

                <div className="fd-analytics-card">
                  <h4>Performance Bands</h4>
                  <div className="fd-analytics-row">
                    <span className="fd-chip">Excellent: {analytics.excellentCount}</span>
                    <span className="fd-chip">Average: {analytics.averageCount}</span>
                    <span className="fd-chip warning">Struggling: {analytics.strugglingCount}</span>
                  </div>
                </div>

                <div className="fd-analytics-card">
                  <h4>Top Students (Avg)</h4>
                  {analytics.topStudents.length === 0 ? (
                    <p style={{ color: 'var(--fd-text-secondary)', margin: 0 }}>No student data yet</p>
                  ) : (
                    <ul className="fd-top-students-list">
                      {analytics.topStudents.map((student, index) => (
                        <li key={`${student.name}-${index}`}>
                          <span>{student.name}</span>
                          <strong>{student.avg}%</strong>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* ================= QUICK ACTIONS ================= */}
        <div className="fd-card fd-full">
          <h3>Submission Explorer</h3>

          <div className="fd-filter-row">
            <input
              type="text"
              className="fd-filter-input"
              placeholder="Search student"
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
            />

            <select
              className="fd-filter-select"
              value={assessmentFilter}
              onChange={(e) => setAssessmentFilter(e.target.value)}
            >
              <option value="all">All Assessments</option>
              {assessmentOptions.map((item) => (
                <option key={item.id} value={item.id}>{item.title}</option>
              ))}
            </select>

            <select
              className="fd-filter-select"
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
            >
              <option value="all">All Branches</option>
              {branchOptions.map((branch, index) => (
                <option key={`${branch}-${index}`} value={branch}>{branch}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <p style={{ color: 'var(--fd-text-secondary)' }}>Loading submissions...</p>
          ) : filteredSubmissions.length === 0 ? (
            <p style={{ color: 'var(--fd-text-secondary)' }}>No submissions match your current filters.</p>
          ) : (
            <div className="fd-submissions-table-wrap">
              <table className="fd-submissions-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Assessment</th>
                    <th>Branch</th>
                    <th>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.slice(0, 20).map((row, index) => (
                    <tr key={`${row.assessmentId}-${row.studentId || row.studentName}-${index}`}>
                      <td>{row.studentName || 'Student'}</td>
                      <td>{row.assessmentTitle || `Assessment ${row.assessmentId}`}</td>
                      <td>{row.branchName || 'N/A'}</td>
                      <td>{Math.round(row.percentage || 0)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="fd-quick-actions">
          <h4>Quick Actions</h4>
          <div className="quick-actions-grid">
            <button
              className="quick-action-btn"
              onClick={() => navigate("/faculty/create-assessment")}
            >
              New Assessment
            </button>

            <button
              className="quick-action-btn"
              onClick={() => navigate("/faculty/results")}
            >
              All Results
            </button>

            <button className="quick-action-btn">
              Export Report
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}