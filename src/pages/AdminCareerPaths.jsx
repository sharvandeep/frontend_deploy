import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCareerPaths,
  createCareerPath,
  updateCareerPath,
  deleteCareerPath,
  getBranches,
  getBranchSkills
} from "../services/api";
import "../styles/admin.css";

export default function AdminCareerPaths() {

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [careerPaths, setCareerPaths] = useState([]);
  const [branches, setBranches] = useState([]);
  const [branchSkills, setBranchSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    careerName: "",
    description: "",
    selectedSkills: [],
    minimumSkillPercentage: 50,
    branchId: ""
  });

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      navigate("/login");
      return;
    }

    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    try {
      const [pathsRes, branchesRes] = await Promise.all([
        getCareerPaths(),
        getBranches()
      ]);
      setCareerPaths(pathsRes.data);
      setBranches(branchesRes.data);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      careerName: "",
      description: "",
      selectedSkills: [],
      minimumSkillPercentage: 50,
      branchId: ""
    });
    setEditingId(null);
    setBranchSkills([]);
  };

  const handleOpenModal = async (careerPath = null) => {
    if (careerPath) {
      // Parse existing skills
      const existingSkills = careerPath.requiredSkills 
        ? careerPath.requiredSkills.split(",").map(s => s.trim())
        : [];
      
      setForm({
        careerName: careerPath.careerName,
        description: careerPath.description || "",
        selectedSkills: existingSkills,
        minimumSkillPercentage: careerPath.minimumSkillPercentage || 50,
        branchId: careerPath.branchId || ""
      });
      setEditingId(careerPath.id);
      
      // Load skills for the branch
      if (careerPath.branchId) {
        try {
          const res = await getBranchSkills(careerPath.branchId);
          setBranchSkills(res.data);
        } catch (err) {
          console.error("Error loading branch skills:", err);
        }
      } else {
        // Load all skills from all branches for universal careers
        await loadAllSkills();
      }
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const loadAllSkills = async () => {
    try {
      // Load skills from all branches
      const allSkills = [];
      for (const branch of branches) {
        const res = await getBranchSkills(branch.id);
        res.data.forEach(s => {
          if (!allSkills.some(existing => existing.skillName === s.skillName)) {
            allSkills.push(s);
          }
        });
      }
      setBranchSkills(allSkills);
    } catch (err) {
      console.error("Error loading all skills:", err);
    }
  };

  const handleBranchChange = async (e) => {
    const branchId = e.target.value;
    setForm({ ...form, branchId: branchId === "" ? "" : Number(branchId), selectedSkills: [] });
    
    if (branchId) {
      try {
        const res = await getBranchSkills(branchId);
        setBranchSkills(res.data);
      } catch (err) {
        console.error("Error loading branch skills:", err);
      }
    } else {
      await loadAllSkills();
    }
  };

  const handleSkillToggle = (skillName) => {
    setForm(prev => ({
      ...prev,
      selectedSkills: prev.selectedSkills.includes(skillName)
        ? prev.selectedSkills.filter(s => s !== skillName)
        : [...prev.selectedSkills, skillName]
    }));
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === "minimumSkillPercentage" ? (value === "" ? "" : Number(value)) : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.careerName || form.selectedSkills.length === 0) {
      alert("Please fill in career name and select at least one skill");
      return;
    }

    try {
      const payload = {
        careerName: form.careerName,
        description: form.description,
        requiredSkills: form.selectedSkills.join(","),
        minimumSkillPercentage: form.minimumSkillPercentage,
        branchId: form.branchId || null
      };

      if (editingId) {
        await updateCareerPath(editingId, payload);
        alert("Career path updated successfully!");
      } else {
        await createCareerPath(payload);
        alert("Career path created successfully!");
      }

      handleCloseModal();
      loadData();
    } catch (error) {
      alert(error.response?.data || "Error saving career path");
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      await deleteCareerPath(id);
      setCareerPaths(careerPaths.filter(cp => cp.id !== id));
      alert("Career path deleted successfully!");
    } catch (error) {
      alert(error.response?.data || "Error deleting career path");
    }
  };

  const getMatchLevelColor = (percentage) => {
    if (percentage >= 70) return "#22c55e";
    if (percentage >= 50) return "#f59e0b";
    return "#ef4444";
  };

  if (loading) {
    return (
      <div className="admin-wrapper">
        <div className="admin-container">
          <p className="admin-loading">Loading career paths...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-wrapper">
      <div className="admin-container">

        {/* Header */}
        <div className="admin-header">
          <div className="admin-header-content">
            <button className="back-btn" onClick={() => navigate("/admin-dashboard")}>
              ← Back to Dashboard
            </button>
            <h2>Career Path Management</h2>
            <p>Create and manage career recommendations</p>
          </div>
          <button className="add-btn" onClick={() => handleOpenModal()}>
            + Add Career Path
          </button>
        </div>

        {/* Stats */}
        <div className="admin-mini-stats">
          <span>Total Career Paths: <strong>{careerPaths.length}</strong></span>
        </div>

        {/* Career Paths Grid */}
        <div className="admin-cards-grid">
          {careerPaths.length === 0 ? (
            <p className="no-data-full">No career paths found. Create one!</p>
          ) : (
            careerPaths.map((cp) => (
              <div key={cp.id} className="admin-career-card">
                <div className="career-header">
                  <h4>{cp.careerName}</h4>
                  <span className="branch-tag">
                    {cp.branchName || "All Branches"}
                  </span>
                </div>
                <p className="career-desc">
                  {cp.description || "No description"}
                </p>
                <div className="career-skills">
                  <strong>Required Skills:</strong>
                  <div className="skill-tags">
                    {cp.requiredSkills?.split(",").map((skill, i) => (
                      <span key={i} className="skill-tag">{skill.trim()}</span>
                    ))}
                  </div>
                </div>
                <div className="career-threshold">
                  <span>Minimum Score:</span>
                  <span
                    className="threshold-value"
                    style={{ color: getMatchLevelColor(cp.minimumSkillPercentage) }}
                  >
                    {cp.minimumSkillPercentage}%
                  </span>
                </div>
                <div className="career-actions">
                  <button
                    className="edit-btn"
                    onClick={() => handleOpenModal(cp)}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(cp.id, cp.careerName)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{editingId ? "Edit Career Path" : "Add Career Path"}</h3>
                <button className="close-btn" onClick={handleCloseModal}>×</button>
              </div>
              <form onSubmit={handleSubmit} className="modal-form">

                <div className="form-group">
                  <label>Career Name *</label>
                  <input
                    type="text"
                    name="careerName"
                    value={form.careerName}
                    onChange={handleChange}
                    placeholder="e.g., Software Developer"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Describe this career path..."
                    rows={3}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Branch (select first to see skills)</label>
                    <select
                      name="branchId"
                      value={form.branchId}
                      onChange={handleBranchChange}
                    >
                      <option value="">All Branches (Universal)</option>
                      {branches.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                          {branch.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Minimum Skill Percentage</label>
                    <input
                      type="number"
                      name="minimumSkillPercentage"
                      value={form.minimumSkillPercentage}
                      onChange={handleChange}
                      min={0}
                      max={100}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Required Skills * (select skills for this career)</label>
                  {branchSkills.length === 0 ? (
                    <p className="skill-hint">Select a branch above to load available skills, or click "All Branches" to see all skills.</p>
                  ) : (
                    <div className="skill-checkbox-grid">
                      {branchSkills.map((skill) => (
                        <label key={skill.id} className="skill-checkbox-item">
                          <input
                            type="checkbox"
                            checked={form.selectedSkills.includes(skill.skillName)}
                            onChange={() => handleSkillToggle(skill.skillName)}
                          />
                          <span className="skill-checkbox-label">{skill.skillName}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  {form.selectedSkills.length > 0 && (
                    <div className="selected-skills-preview">
                      Selected: {form.selectedSkills.join(", ")}
                    </div>
                  )}
                </div>

                <div className="modal-actions">
                  <button type="button" className="cancel-btn" onClick={handleCloseModal}>
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn">
                    {editingId ? "Update" : "Create"}
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
