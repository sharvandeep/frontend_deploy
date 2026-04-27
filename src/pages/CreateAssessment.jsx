import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api, { getBranchSkills } from "../services/api";
import "../styles/createassessment.css";

export default function CreateAssessment() {

  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("user"));

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [branchSkills, setBranchSkills] = useState([]);

  const [questions, setQuestions] = useState([
    {
      questionText: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctAnswer: "A",
      skillCategory: ""
    }
  ]);

  // Load branch skills dynamically
  useEffect(() => {

    const loadSkills = async () => {
      try {
        if (!user?.branchId) return;

        const res = await getBranchSkills(user.branchId);
        setBranchSkills(res.data);
      } catch (error) {
        console.error("Error loading skills", error);
      }
    };

    loadSkills();

  }, [user?.branchId]);

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correctAnswer: "A",
        skillCategory: ""
      }
    ]);
  };

  const removeQuestion = (index) => {
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      await api.post(
        `/faculty/assessment/${user.id}/create`,
        {
          title,
          description,
          questions
        }
      );

      alert("Assessment Created Successfully!");
      navigate("/faculty-dashboard");

    } catch (error) {
      console.error("Error creating assessment", error);
      alert("Failed to create assessment.");
    }
  };

  return (
    <div className="ca-wrapper">
      <div className="ca-container">

        {/* Back Button */}
        <button 
          type="button" 
          className="ca-back-btn" 
          onClick={() => navigate("/faculty-dashboard")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="ca-header">
          <div className="ca-header-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              <path d="M12 11v6M9 14h6" />
            </svg>
          </div>
          <div className="ca-header-content">
            <h2>Create Assessment</h2>
            <p>Design a new assessment for your students</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>

          {/* Basic Info Card */}
          <div className="ca-form-card">
            <div className="ca-section-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Basic Information
            </div>

            <div className="ca-form-group">
              <label>Assessment Title</label>
              <input
                type="text"
                placeholder="Enter a descriptive title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="ca-form-group">
              <label>Description</label>
              <textarea
                placeholder="Describe what this assessment covers..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Questions Card */}
          <div className="ca-form-card">
            <div className="ca-questions-header">
              <div className="ca-section-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
                  <path d="M12 17h.01" />
                </svg>
                Questions
              </div>
              <div className="ca-questions-count">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                </svg>
                {questions.length} {questions.length === 1 ? 'Question' : 'Questions'}
              </div>
            </div>

            {questions.map((q, index) => (
              <div key={index} className="question-card">

                <div className="question-card-header">
                  <div className="question-number">
                    <div className="question-number-badge">{index + 1}</div>
                    <span>Question {index + 1}</span>
                  </div>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      className="ca-btn danger"
                      onClick={() => removeQuestion(index)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Remove
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  className="question-text-input"
                  placeholder="Enter your question here..."
                  value={q.questionText}
                  onChange={(e) =>
                    handleQuestionChange(index, "questionText", e.target.value)
                  }
                  required
                />

                <div className="options-grid">
                  <div className="option-input-group">
                    <span className="option-label">A</span>
                    <input
                      type="text"
                      placeholder="Option A"
                      value={q.optionA}
                      onChange={(e) =>
                        handleQuestionChange(index, "optionA", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="option-input-group">
                    <span className="option-label">B</span>
                    <input
                      type="text"
                      placeholder="Option B"
                      value={q.optionB}
                      onChange={(e) =>
                        handleQuestionChange(index, "optionB", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="option-input-group">
                    <span className="option-label">C</span>
                    <input
                      type="text"
                      placeholder="Option C"
                      value={q.optionC}
                      onChange={(e) =>
                        handleQuestionChange(index, "optionC", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="option-input-group">
                    <span className="option-label">D</span>
                    <input
                      type="text"
                      placeholder="Option D"
                      value={q.optionD}
                      onChange={(e) =>
                        handleQuestionChange(index, "optionD", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                <div className="select-row">
                  <select
                    value={q.skillCategory}
                    onChange={(e) =>
                      handleQuestionChange(index, "skillCategory", e.target.value)
                    }
                    required
                  >
                    <option value="">Select Skill Category</option>
                    {branchSkills.map(skill => (
                      <option key={skill.id} value={skill.skillName}>
                        {skill.skillName}
                      </option>
                    ))}
                  </select>

                  <select
                    value={q.correctAnswer}
                    onChange={(e) =>
                      handleQuestionChange(index, "correctAnswer", e.target.value)
                    }
                  >
                    <option value="A">Correct Answer: A</option>
                    <option value="B">Correct Answer: B</option>
                    <option value="C">Correct Answer: C</option>
                    <option value="D">Correct Answer: D</option>
                  </select>
                </div>

              </div>
            ))}

            <button type="button" className="ca-btn secondary" onClick={addQuestion}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add Question
            </button>
          </div>

          {/* Action Buttons */}
          <div className="ca-actions">
            <button type="button" className="ca-btn secondary" onClick={() => navigate("/faculty-dashboard")}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </button>
            <button type="submit" className="ca-btn success">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 13l4 4L19 7" />
              </svg>
              Create Assessment
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}