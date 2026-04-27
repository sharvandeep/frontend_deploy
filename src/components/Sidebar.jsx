import { useNavigate, useLocation } from "react-router-dom";


export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(sessionStorage.getItem("user"));

  const logout = () => {
    sessionStorage.removeItem("user");
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="sidebar">

      {/* LOGO */}
      <div className="sidebar__logo">
        CareerAssess
      </div>

      {/* MENU */}
      <nav className="sidebar__menu">

        {user?.role === "STUDENT" && (
          <button
            className={`sidebar__link ${
              isActive("/student-dashboard") ? "sidebar__link--active" : ""
            }`}
            onClick={() => navigate("/student-dashboard")}
          >
            Dashboard
          </button>
        )}

        {user?.role === "FACULTY" && (
          <button
            className={`sidebar__link ${
              isActive("/faculty-dashboard") ? "sidebar__link--active" : ""
            }`}
            onClick={() => navigate("/faculty-dashboard")}
          >
            Dashboard
          </button>
        )}

      </nav>

      {/* FOOTER */}
      <div className="sidebar__footer">
        <button className="btn btn--danger" onClick={logout}>
          Logout
        </button>
      </div>

    </aside>
  );
}
