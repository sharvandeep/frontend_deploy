import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";
import "../styles/auth.css";

export default function Login() {

  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: ""
  });
  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaError, setCaptchaError] = useState("");

  const generateCaptcha = () => {
    const captchaChars = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const captchaLength = 6;
    let text = "";

    for (let i = 0; i < captchaLength; i += 1) {
      const randomIndex = Math.floor(Math.random() * captchaChars.length);
      text += captchaChars[randomIndex];
    }

    setCaptchaQuestion(text);
    setCaptchaAnswer(text);
    setCaptchaInput("");
    setCaptchaError("");
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    generateCaptcha();
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedRole) {
      alert("Please select a role");
      return;
    }

    if (captchaInput.trim().toUpperCase() !== captchaAnswer) {
      setCaptchaError("Captcha verification failed. Please try again.");
      generateCaptcha();
      return;
    }

    try {
      const res = await loginUser({
        ...form,
        role: selectedRole
      });

      const user = res.data;
      const userRole = String(user?.role || "").toUpperCase();

      if (userRole !== selectedRole) {
        localStorage.removeItem("user");
        alert("Selected role does not match these credentials.");
        return;
      }

      localStorage.setItem("user", JSON.stringify(user));

      if (userRole === "STUDENT") {
        navigate("/student-dashboard");
      } else if (userRole === "FACULTY") {
        navigate("/faculty-dashboard");
      } else if (userRole === "ADMIN") {
        navigate("/admin-dashboard");
      }

    } catch {
      alert("Login failed. Check credentials.");
    }
  };

  return (
    <div className="auth-wrapper">

      {/* LEFT PANEL */}
      <div className="auth-left">
        <h1>Career-Compass</h1>
        <p>
          Discover your strengths.  
          Analyze your skills.  
          Build your future.
        </p>
      </div>

      {/* RIGHT PANEL */}
      <div className="auth-right">

        <div className="login-card">

          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">
            Select your role to continue
          </p>

          {/* THREE ROLE CARDS */}
          <div className="role-selection">

            <div
              className={`role-card ${selectedRole === "STUDENT" ? "active" : ""}`}
              onClick={() => handleRoleSelect("STUDENT")}
            >
              <div className="role-icon">🎓</div>
              <h4>Student</h4>
              <p>Take assessments & view results</p>
            </div>

            <div
              className={`role-card ${selectedRole === "FACULTY" ? "active" : ""}`}
              onClick={() => handleRoleSelect("FACULTY")}
            >
              <div className="role-icon">👨‍🏫</div>
              <h4>Faculty</h4>
              <p>Create & manage assessments</p>
            </div>

            <div
              className={`role-card ${selectedRole === "ADMIN" ? "active" : ""}`}
              onClick={() => handleRoleSelect("ADMIN")}
            >
              <div className="role-icon">⚙️</div>
              <h4>Admin</h4>
              <p>Manage platform & users</p>
            </div>

          </div>

          {/* FORM APPEARS AFTER SELECT */}
          {selectedRole && (
            <form onSubmit={handleSubmit} className="auth-form fade-in" autoComplete="on">

              <input
                type="email"
                name="email"
                placeholder="Enter Email"
                value={form.email}
                onChange={handleChange}
                autoComplete="username"
                required
              />

              <div className="password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter Password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>

              <div className="captcha-box">
                <div className="captcha-challenge">
                  <span className="captcha-label">Captcha:</span>
                  <strong className="captcha-question">{captchaQuestion}</strong>
                  <button
                    type="button"
                    className="captcha-refresh"
                    onClick={generateCaptcha}
                  >
                    Refresh
                  </button>
                </div>

                <input
                  type="text"
                  name="captcha"
                  placeholder="Enter captcha letters"
                  value={captchaInput}
                  onChange={(e) => {
                    setCaptchaInput(e.target.value);
                    if (captchaError) {
                      setCaptchaError("");
                    }
                  }}
                  required
                />

                {captchaError && <p className="captcha-error">{captchaError}</p>}
              </div>

              <button type="submit" className="auth-btn">
                Login as {selectedRole}
              </button>

            </form>
          )}

        </div>

      </div>
    </div>
  );
}