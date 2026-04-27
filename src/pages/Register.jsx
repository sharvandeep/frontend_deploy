import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";
import "../styles/auth.css";

export default function Register() {

  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "STUDENT",
    branchName: "CSE"
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    // If role changes to FACULTY, keep branch enabled
    // If needed later you can customize logic here
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await registerUser(form);

      setSuccessMessage("Registered Successfully! Redirecting to login...");

      // Optional: Clear form
      setForm({
        name: "",
        email: "",
        password: "",
        role: "STUDENT",
        branchName: "CSE"
      });

      // Redirect after short delay
      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (error) {

      // Extract backend message safely
      const backendMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Something went wrong. Please try again.";

      setErrorMessage(backendMessage);

    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-wrapper">

      {/* LEFT BRAND PANEL */}
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="brand-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
          <h1>Career-Compass</h1>
          <p>
            Create your account.<br />
            Start your career journey.<br />
            Unlock your potential.
          </p>
        </div>
      </div>

      {/* RIGHT REGISTER PANEL */}
      <div className="auth-right">
        <div className="login-card register-card">

          <div className="card-header">
            <h2 className="auth-title">Create Account</h2>
            <p className="auth-subtitle">
              Join the platform and explore career insights
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form register-form">

            {/* ERROR MESSAGE */}
            {errorMessage && (
              <div style={{
                color: "#ff4d4f",
                background: "#fff1f0",
                padding: "10px",
                borderRadius: "6px",
                marginBottom: "10px",
                fontSize: "14px"
              }}>
                {errorMessage}
              </div>
            )}

            {/* SUCCESS MESSAGE */}
            {successMessage && (
              <div style={{
                color: "#389e0d",
                background: "#f6ffed",
                padding: "10px",
                borderRadius: "6px",
                marginBottom: "10px",
                fontSize: "14px"
              }}>
                {successMessage}
              </div>
            )}

            <div className="input-group">
              <input
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <input
                name="email"
                type="email"
                placeholder="Email Address"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group password-group">
              <div className="password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
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
            </div>

            <div className="select-row">

              <div className="select-group">
                <label>Role</label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                >
                  <option value="STUDENT">🎓 Student</option>
                  <option value="FACULTY">👨‍🏫 Faculty</option>
                </select>
              </div>

              <div className="select-group">
                <label>Branch</label>
                <select
                  name="branchName"
                  value={form.branchName}
                  onChange={handleChange}
                >
                  <option value="CSE">CSE</option>
                  <option value="ECE">ECE</option>
                  <option value="CSIT">CSIT</option>
                  <option value="AIDS">AIDS</option>
                  <option value="MECH">MECH</option>
                  <option value="BIO-TECH">BIO-TECH</option>
                </select>
              </div>

            </div>

            <button
              type="submit"
              className="auth-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </button>

          </form>

          <div className="auth-footer">
            <span>Already have an account?</span>
            <Link to="/login">Sign In</Link>
          </div>

        </div>
      </div>
    </div>
  );
}