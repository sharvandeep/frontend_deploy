import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getStudentHistory } from "../services/api";
import "../styles/studentdashboard.css";
import "../styles/global.css";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

// Section IDs in order they appear on the page (defined outside component to avoid re-creation)
const SECTION_IDS = ['profile', 'stats', 'performance', 'skills', 'actions', 'history'];

export default function StudentDashboard() {

  const navigate = useNavigate();
  const user = useMemo(() => JSON.parse(localStorage.getItem("user")) || {}, []);

  const [history, setHistory] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const wrapperRef = useRef(null);
  const sectionsRef = useRef([]);

  // Scroll progress tracker with section detection (rAF-throttled)
  useEffect(() => {
    let animationFrame;
    let isTicking = false;

    sectionsRef.current = SECTION_IDS.map((id) => document.querySelector(`[data-section="${id}"]`));

    const updateOnScroll = () => {
      if (!wrapperRef.current) return;

      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const targetProgress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

      const safeProgress = Math.min(targetProgress, 100);
      setScrollProgress((prev) => (Math.abs(prev - safeProgress) > 0.1 ? safeProgress : prev));

      // Detect active section - improved logic for bottom of page
      const sections = sectionsRef.current;
      const viewportCenter = window.innerHeight / 2;

      let activeIndex = 0;
      let foundInCenter = false;

      // First, check if any section is centered in viewport
      sections.forEach((section, index) => {
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= viewportCenter && rect.bottom >= viewportCenter) {
            activeIndex = index;
            foundInCenter = true;
          }
        }
      });

      // If no section is centered (e.g., at bottom of page), find the last section that's visible
      if (!foundInCenter) {
        for (let i = sections.length - 1; i >= 0; i--) {
          const section = sections[i];
          if (section) {
            const rect = section.getBoundingClientRect();
            // Section is visible (at least partially in viewport)
            if (rect.top < window.innerHeight && rect.bottom > 0) {
              activeIndex = i;
              break;
            }
          }
        }
      }

      setActiveSectionIndex((prev) => (prev === activeIndex ? prev : activeIndex));
      isTicking = false;
    };

    const handleScroll = () => {
      if (isTicking) return;
      isTicking = true;
      animationFrame = requestAnimationFrame(updateOnScroll);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    updateOnScroll(); // Initial call
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  const [stats, setStats] = useState({
    total: 0,
    average: 0,
    best: 0,
    latest: 0
  });

  // Load dashboard data function
  const loadDashboardData = useCallback(async () => {
    if (!user?.id) return;

    try {
      const res = await getStudentHistory(user.id);
      const data = res.data;

      setHistory(data);

      if (data.length > 0) {
        const totalAttempts = data.length;
        const average = data.reduce((sum, item) => sum + item.percentage, 0) / totalAttempts;
        const best = Math.max(...data.map(item => item.percentage));
        const latest = data[0].percentage;

        setStats({
          total: totalAttempts,
          average: average.toFixed(2),
          best: best.toFixed(2),
          latest: latest.toFixed(2)
        });

        const formatted = data.map((item, index) => ({
          name: `Attempt ${index + 1}`,
          percentage: item.percentage
        }));

        setChartData(formatted.reverse());
      } else {
        // Reset stats if no data
        setStats({ total: 0, average: 0, best: 0, latest: 0 });
        setChartData([]);
      }
    } catch (error) {
      console.error("Dashboard Load Error:", error);
    }
  }, [user?.id]);

  // Load data on mount
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Milestone data for the journey with section IDs
  const milestones = [
    { icon: '👤', label: 'Profile', color: '#6366f1', section: 'profile' },
    { icon: '📊', label: 'Statistics', color: '#8b5cf6', section: 'stats' },
    { icon: '📈', label: 'Progress', color: '#a855f7', section: 'performance' },
    { icon: '🎯', label: 'Skills', color: '#06b6d4', section: 'skills' },
    { icon: '📝', label: 'Assess', color: '#10b981', section: 'actions' },
    { icon: '🏆', label: 'Results', color: '#f59e0b', section: 'actions' },
    { icon: '📜', label: 'History', color: '#ec4899', section: 'history' }
  ];

  // Scroll to section handler
  const scrollToSection = (sectionId) => {
    const element = document.querySelector(`[data-section="${sectionId}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="sd-wrapper" ref={wrapperRef}>

      {/* Floating Background Elements */}
      <div className="sd-floating-elements">
        <div className="floating-shape shape-1" style={{ transform: `translateY(${scrollProgress * 2}px)` }}></div>
        <div className="floating-shape shape-2" style={{ transform: `translateY(${scrollProgress * -1.5}px) rotate(${scrollProgress}deg)` }}></div>
        <div className="floating-shape shape-3" style={{ transform: `translateY(${scrollProgress * 1}px)` }}></div>
        <div className="floating-shape shape-4" style={{ transform: `translateY(${scrollProgress * -2}px) rotate(${-scrollProgress * 0.5}deg)` }}></div>
        <div className="floating-shape shape-5" style={{ transform: `translateY(${scrollProgress * 1.5}px)` }}></div>
      </div>

      {/* Simplified Journey Roadmap */}
      <div className="sd-journey-path">
        {/* Simple vertical line */}
        <div className="journey-line-simple"></div>
        
        {/* Milestone Nodes */}
        <div className="journey-milestones">
          {milestones.map((milestone, index) => {
            // Find the section index for this milestone
            const sectionIndex = SECTION_IDS.indexOf(milestone.section);
            const isActive = sectionIndex !== -1 && activeSectionIndex >= sectionIndex;
            const isCurrent = sectionIndex !== -1 && activeSectionIndex === sectionIndex;
            const isPassed = sectionIndex !== -1 && activeSectionIndex > sectionIndex;
            
            return (
              <div 
                key={index} 
                className={`milestone-node ${isActive ? 'active' : ''} ${isPassed ? 'passed' : ''} ${isCurrent ? 'current' : ''}`}
                style={{ 
                  top: `${8 + (index * 13)}%`,
                  '--milestone-color': milestone.color,
                  cursor: 'pointer'
                }}
                onClick={() => scrollToSection(milestone.section)}
                title={`Go to ${milestone.label}`}
              >
                {/* Main dot */}
                <div className="milestone-dot">
                  <div className="milestone-dot-inner">
                    <span className="milestone-icon">{milestone.icon}</span>
                  </div>
                </div>
                
                {/* Label */}
                <div className="milestone-label-container">
                  <span className="milestone-label">{milestone.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Enhanced Scroll Progress Indicator */}
      <div className="sd-progress-indicator">
        <div className="progress-label-top">Start</div>
        <div className="progress-track">
          <div className="progress-track-bg"></div>
          <div 
            className="progress-fill" 
            style={{ height: `${scrollProgress}%` }}
          >
            <div className="progress-fill-glow"></div>
          </div>
          {/* Progress markers */}
          {[0, 25, 50, 75, 100].map(mark => (
            <div 
              key={mark}
              className={`progress-marker ${scrollProgress >= mark ? 'passed' : ''}`}
              style={{ bottom: `${mark}%` }}
            />
          ))}
        </div>
        <div className="progress-label-bottom">End</div>
        <div className="progress-percentage">
          <span className="progress-number">{Math.round(scrollProgress)}</span>
          <span className="progress-symbol">%</span>
        </div>
      </div>

      <div className="sd-container">

        {/* HEADER */}
        <div className="sd-header">
          <h2>Student Dashboard</h2>
          <p>Welcome back, {user.name}</p>
        </div>

        {/* PROFILE SECTION */}
        <div className="sd-profile-card sd-animate-card" data-section="profile">
          
          <div className="profile-header">
            <div className="profile-avatar">
              <div className="avatar-ring"></div>
              <div className="avatar-inner">
                <span className="avatar-emoji">👤</span>
              </div>
              <div className="avatar-status online"></div>
            </div>
            <div className="profile-title">
              <h3>{user.name || 'Student'}</h3>
              <span className="profile-role-badge">{user.role}</span>
            </div>
          </div>

          <div className="profile-details">
            <div className="profile-detail-item">
              <span className="detail-icon">📧</span>
              <div className="detail-content">
                <span className="detail-label">Email</span>
                <span className="detail-value">{user.email}</span>
              </div>
            </div>
            <div className="profile-detail-item">
              <span className="detail-icon">🎓</span>
              <div className="detail-content">
                <span className="detail-label">Branch</span>
                <span className="detail-value">{user.branchName || user.branch || 'N/A'}</span>
              </div>
            </div>
          </div>

        </div>

        {/* STATS SECTION */}
        <div className="sd-stats-grid sd-animate-row" data-section="stats">
          <div className="sd-stat-card stat-attempts">
            <div className="stat-icon-ring">
              <svg className="stat-ring-svg" viewBox="0 0 36 36">
                <circle className="stat-ring-bg" cx="18" cy="18" r="16" />
                <circle 
                  className="stat-ring-progress" 
                  cx="18" cy="18" r="16"
                  style={{ strokeDasharray: `${Math.min(stats.total * 10, 100)}, 100` }}
                />
              </svg>
              <div className="stat-icon">📝</div>
            </div>
            <div className="stat-content">
              <span className="stat-value-big">{stats.total}</span>
              <span className="stat-label">Total Attempts</span>
            </div>
            <div className="stat-card-shine"></div>
          </div>

          <div className="sd-stat-card stat-average">
            <div className="stat-icon-ring">
              <svg className="stat-ring-svg" viewBox="0 0 36 36">
                <circle className="stat-ring-bg" cx="18" cy="18" r="16" />
                <circle 
                  className="stat-ring-progress" 
                  cx="18" cy="18" r="16"
                  style={{ strokeDasharray: `${stats.average}, 100` }}
                />
              </svg>
              <div className="stat-icon">📊</div>
            </div>
            <div className="stat-content">
              <span className="stat-value-big">{stats.average}<small>%</small></span>
              <span className="stat-label">Average Score</span>
            </div>
            <div className="stat-card-shine"></div>
          </div>

          <div className="sd-stat-card stat-best">
            <div className="stat-icon-ring">
              <svg className="stat-ring-svg" viewBox="0 0 36 36">
                <circle className="stat-ring-bg" cx="18" cy="18" r="16" />
                <circle 
                  className="stat-ring-progress" 
                  cx="18" cy="18" r="16"
                  style={{ strokeDasharray: `${stats.best}, 100` }}
                />
              </svg>
              <div className="stat-icon">🏆</div>
            </div>
            <div className="stat-content">
              <span className="stat-value-big">{stats.best}<small>%</small></span>
              <span className="stat-label">Best Score</span>
            </div>
            <div className="stat-card-shine"></div>
          </div>

          <div className="sd-stat-card stat-latest">
            <div className="stat-icon-ring">
              <svg className="stat-ring-svg" viewBox="0 0 36 36">
                <circle className="stat-ring-bg" cx="18" cy="18" r="16" />
                <circle 
                  className="stat-ring-progress" 
                  cx="18" cy="18" r="16"
                  style={{ strokeDasharray: `${stats.latest}, 100` }}
                />
              </svg>
              <div className="stat-icon">⭐</div>
            </div>
            <div className="stat-content">
              <span className="stat-value-big">{stats.latest}<small>%</small></span>
              <span className="stat-label">Latest Score</span>
            </div>
            <div className="stat-card-shine"></div>
          </div>
        </div>

        {/* PERFORMANCE GRAPH */}
        <div className="sd-card sd-full sd-animate-card" data-section="performance">
          <div className="card-glow"></div>
          <h3>Performance Trend</h3>

          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="percentage"
                  stroke="#6366f1"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p>No performance data available yet.</p>
          )}
        </div>
        

        {/* MAIN ACTIONS */}
        <div className="sd-card sd-animate-card" data-section="skills">
          <div className="card-glow"></div>
  <h3>Skill Analysis</h3>
  <p>
    View detailed breakdown of your performance by skill.
  </p>
  <button className="sd-action-btn primary" onClick={() => navigate("/student/skills")}>
    View Skill Analysis
  </button>
</div>
        <div className="sd-row sd-animate-row" data-section="actions">

          <div className="sd-card">
            <div className="card-glow"></div>
            <h3>Take Assessment</h3>
            <p>
              Attempt the career assessment to discover your strengths
              and suitable career paths.
            </p>
            <button className="sd-action-btn primary" onClick={() => navigate("/student/assessments")}>
              Start Assessment
            </button>
          </div>

          <div className="sd-card">
            <div className="card-glow"></div>
            <h3>My Results</h3>
            <p>
              View your completed assessments and performance analysis.
            </p>
            <button className="sd-action-btn primary" onClick={() => navigate(`/student/results/${user.id}`)}>
              View Results
            </button>
          </div>

          <div className="sd-card">
            <div className="card-glow"></div>
            <h3>Career Recommendations</h3>
            <p>
              Explore career paths that match your skills and interests.
            </p>
            <button className="sd-action-btn primary" onClick={() => navigate("/student/career-recommendations")}>
              View Careers
            </button>
          </div>

          <div className="sd-card">
            <div className="card-glow"></div>
            <h3>Personality Tests</h3>
            <p>
              Discover your personality traits and how they align with careers.
            </p>
            <button className="sd-action-btn primary" onClick={() => navigate("/student/personality-tests")}>
              Take Test
            </button>
          </div>

        </div>

        {/* HISTORY BUTTON */}
        <div className="sd-history-card sd-animate-card" data-section="history">
          <div className="card-glow"></div>
          <div className="glacier-sweep"></div>
          
          <div className="history-content">
            <span className="history-icon">📜</span>
            <h3>Assessment History</h3>
            <p>View all your past assessment attempts and scores</p>
            <button 
              className="history-btn"
              onClick={() => navigate("/student/history")}
            >
              View History
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}