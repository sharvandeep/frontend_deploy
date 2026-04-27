import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";

import StudentDashboard from "./pages/StudentDashboard";
import StudentAssessments from "./pages/StudentAssessments";
import Assessment from "./pages/Assessment";
import Results from "./pages/Results";

import FacultyDashboard from "./pages/FacultyDashboard";
import CreateAssessment from "./pages/CreateAssessment";
import AttemptAssessment from "./pages/AttemptAssessment";
import StudentHistory from "./pages/StudentHistory"; 
import StudentReview from "./pages/StudentReview";
import StudentSkillAnalysis from "./pages/StudentSkillAnalysis";

import FacultyResults from "./pages/FacultyResults";
import AssessmentResults from "./pages/AssessmentResults";
import StudentAnswerReview from "./pages/StudentAnswerReview";
import AddRemark from "./pages/AddRemark";
import StudentCareerRecommendations from "./pages/StudentCareerRecommendations";
import PersonalityTests from "./pages/PersonalityTests";
import TakePersonalityTest from "./pages/TakePersonalityTest";
import PersonalityResults from "./pages/PersonalityResults";
import NotificationHistory from "./pages/NotificationHistory";
import StudentResultReport from "./pages/StudentResultReport";

import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminAssessments from "./pages/AdminAssessments";
import AdminCareerPaths from "./pages/AdminCareerPaths";

import { useEffect, useRef } from "react";
import Navbar from "./components/Navbar";

function App() {
  const cursorRef = useRef(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!hasFinePointer || prefersReducedMotion) {
      return;
    }

    document.body.classList.add("custom-cursor-enabled");

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let rafId = null;

    const interactiveSelector = "button, a, input, select, textarea, label, [role='button'], [data-cursor='hover']";

    const moveCursor = (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      cursor.classList.remove("cursor-hidden");
    };

    const animate = () => {
      // Higher interpolation value makes tracking more accurate and less laggy.
      currentX += (targetX - currentX) * 0.34;
      currentY += (targetY - currentY) * 0.34;

      cursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;

      rafId = requestAnimationFrame(animate);
    };

    const onPointerOver = (e) => {
      if (e.target.closest(interactiveSelector)) {
        cursor.classList.add("cursor-hover");
      }
    };

    const onPointerOut = (e) => {
      const fromInteractive = e.target.closest(interactiveSelector);
      const toInteractive = e.relatedTarget?.closest?.(interactiveSelector);

      if (fromInteractive && !toInteractive) {
        cursor.classList.remove("cursor-hover");
      }
    };

    const onPointerDown = () => cursor.classList.add("cursor-active");
    const onPointerUp = () => cursor.classList.remove("cursor-active");
    const onVisibilityChange = () => {
      if (document.hidden) {
        cursor.classList.add("cursor-hidden");
      }
    };
    const onWindowBlur = () => cursor.classList.add("cursor-hidden");
    const onWindowFocus = () => cursor.classList.remove("cursor-hidden");

    document.addEventListener("pointermove", moveCursor);
    document.addEventListener("pointerover", onPointerOver);
    document.addEventListener("pointerout", onPointerOut);
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("pointerup", onPointerUp);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("blur", onWindowBlur);
    window.addEventListener("focus", onWindowFocus);

    animate();

    return () => {
      document.removeEventListener("pointermove", moveCursor);
      document.removeEventListener("pointerover", onPointerOver);
      document.removeEventListener("pointerout", onPointerOut);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", onWindowBlur);
      window.removeEventListener("focus", onWindowFocus);
      document.body.classList.remove("custom-cursor-enabled");
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);

  return (
    <>
      <Router>
        <AppContent cursorRef={cursorRef} />
      </Router>
    </>
  );
}

function AppContent({ cursorRef }) {
  const location = useLocation();
  const hideNavbar = location.pathname.includes('/student/attempt/');

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>

        {/* Redirect root to /login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Student Routes */}
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/student/assessments" element={<StudentAssessments />} />
        <Route path="/student/assessment/:assessmentId" element={<Assessment />} />
        <Route path="/student/results/:studentId" element={<Results />} />
        <Route path="/student/attempt/:assessmentId" element={<AttemptAssessment />} />
        <Route path="/student/review/:assessmentId/:studentId" element={<StudentReview />} />
        <Route path="/student/report/:assessmentId/:studentId" element={<StudentResultReport />} />
        <Route path="/results" element={<Results />} />
        <Route path="/student/skills" element={<StudentSkillAnalysis />} />
        <Route path="/student/career-recommendations" element={<StudentCareerRecommendations />} />
        <Route path="/student/personality-tests" element={<PersonalityTests />} />
        <Route path="/student/personality-test/:testId" element={<TakePersonalityTest />} />
        <Route path="/student/personality-results" element={<PersonalityResults />} />
        <Route path="/notifications/history" element={<NotificationHistory />} />

        {/* Faculty Routes */}
        <Route path="/faculty-dashboard" element={<FacultyDashboard />} />
        <Route path="/faculty/results" element={<FacultyResults />} />
        <Route path="/faculty/assessment/:assessmentId/results" element={<AssessmentResults />} />
        <Route path="/faculty/assessment/:assessmentId/student/:studentId" element={<StudentAnswerReview />} />
        <Route path="/faculty/create-assessment" element={<CreateAssessment />} />
        <Route path="/student/history" element={<StudentHistory />} />
        <Route path="/faculty/add-remark/:studentId/:assessmentId" element={<AddRemark />} />

        {/* Admin Routes */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/assessments" element={<AdminAssessments />} />
        <Route path="/admin/career-paths" element={<AdminCareerPaths />} />

      </Routes>

      {/* Custom Cursor */}
      <div ref={cursorRef} className="custom-cursor" aria-hidden="true">
        <div className="cursor-dot"></div>
        <div className="cursor-box"></div>
        <div className="cursor-orbit cursor-orbit-one"></div>
        <div className="cursor-orbit cursor-orbit-two"></div>
      </div>
    </>
  );
}

export default App;