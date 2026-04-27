import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/addremark.css";

export default function AddRemark() {
  const { studentId, assessmentId } = useParams();
  const navigate = useNavigate();
  const faculty = JSON.parse(localStorage.getItem("user"));
  const [remark, setRemark] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!remark.trim()) {
      setMessage("Please enter a remark before submitting.");
      setIsSuccess(false);
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(
        "http://localhost:8081/api/remarks/faculty/add",
        {
          facultyId: faculty.id,
          studentId: studentId,
          assessmentId: assessmentId,
          remark: remark,
        }
      );
      setMessage("✅ Remark added successfully!");
      setIsSuccess(true);
      setTimeout(() => {
        navigate(-1);
      }, 1500);
    } catch (error) {
      console.error("Error:", error);
      setMessage("❌ Failed to add remark. Please try again.");
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="addremark-wrapper">
      <div className="addremark-container">
        <button 
          onClick={() => navigate(-1)} 
          className="addremark-back-btn"
        >
          ← Back
        </button>

        <div className="addremark-header">
          <h1>Add Feedback for Student</h1>
          <p>Provide constructive feedback on the student's assessment performance</p>
        </div>

        <form onSubmit={handleSubmit} className="addremark-form">
          <div className="addremark-form-group">
            <label htmlFor="remark">Your Feedback</label>
            <textarea
              id="remark"
              placeholder="Write your feedback here... Be specific and constructive."
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              className="addremark-textarea"
              rows="8"
            />
            <span className="addremark-char-count">
              {remark.length} / 1000 characters
            </span>
          </div>

          {message && (
            <div className={`addremark-message ${isSuccess ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <div className="addremark-buttons">
            <button 
              type="button" 
              onClick={() => navigate(-1)}
              className="addremark-btn-secondary"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="addremark-btn-primary"
              disabled={isLoading}
            >
              {isLoading ? "Submitting..." : "Submit Feedback"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}