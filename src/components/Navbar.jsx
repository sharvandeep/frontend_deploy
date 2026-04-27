import { Link, useNavigate, useLocation } from "react-router-dom";
import "../styles/navbar.css";
import NotificationBell from "./NotificationBell";

export default function Navbar() {

  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  // Student navigation items
  const studentLinks = [
    { path: "/student-dashboard", label: "Dashboard" },
    { path: "/student/assessments", label: "Assessments" },
    { path: `/student/results/${user?.id}`, label: "Results" },
    { path: "/student/skills", label: "Skills" },
    { path: "/student/history", label: "History" }
  ];

  // Faculty navigation items
  const facultyLinks = [
    { path: "/faculty-dashboard", label: "Dashboard" },
    { path: "/faculty/results", label: "Results" },
    { path: "/faculty/create-assessment", label: "Create Assessment" }
  ];

  const navLinks = user?.role === "STUDENT" ? studentLinks : 
                   user?.role === "FACULTY" ? facultyLinks : [];

  return (
    <nav className="navbar">
      <div className="nav-container">

        <div className="nav-logo">
          Career Compass
        </div>

        {user && (
          <div className="nav-menu">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link ${isActive(link.path) ? "active" : ""}`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}

        <div className="nav-links">
          {user ? (
            <>
              {/* Notification Bell - visible for all authenticated users */}
              <NotificationBell userId={user.id} autoRefreshInterval={30000} />
              <span className="nav-user">
                {user.name}
              </span>
              <button onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>

      </div>
    </nav>
  );
}
