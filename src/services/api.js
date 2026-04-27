import axios from "axios";

// ✅ AUTO SWITCH BASE URL (LOCAL + PRODUCTION)
const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:8081"
    : "https://backenddeployment-production-c3ed.up.railway.app";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// =======================
// USER AUTH
// =======================

export const registerUser = (data) => {
  return api.post("/users/register", data);
};

export const loginUser = (data) => {
  return api.post("/users/login", data);
};

// =======================
// STUDENT
// =======================

export const getStudentAssessments = (studentId) => {
  return api.get(`/student/assessments/${studentId}`);
};

export const getAssessmentQuestions = (assessmentId) => {
  return api.get(`/student/assessment/${assessmentId}/questions`);
};

export const submitAssessment = (data) => {
  return api.post("/student/submit", data);
};

export const getStudentResults = (studentId) => {
  return api.get(`/student/results/${studentId}?_t=${Date.now()}`);
};

export const exportStudentResultReport = (studentId, assessmentId) => {
  return api.get(
    `/student/results/${studentId}/assessment/${assessmentId}/export`,
    {
      responseType: "blob",
    }
  );
};

export const getCareerRecommendations = (studentId) => {
  return api.get(`/student/career-recommendations/${studentId}`);
};

// ============================
// FACULTY
// ============================

export const getFacultyAssessments = (facultyId) => {
  return api.get(`/faculty/assessment/${facultyId}`);
};

export const getAssessmentResults = (assessmentId) => {
  return api.get(`/faculty/assessment/${assessmentId}/results`);
};

export const getStudentAnswerReview = (assessmentId, studentId) => {
  return api.get(
    `/faculty/assessment/${assessmentId}/student/${studentId}`
  );
};

export const getStudentHistory = (studentId) => {
  return api.get(`/student/results/${studentId}?_t=${Date.now()}`);
};

export const getStudentDetailedReview = (assessmentId, studentId) => {
  return api.get(
    `/faculty/assessment/${assessmentId}/student/${studentId}`
  );
};

export const getSkillAnalysis = (studentId) => {
  return api.get(`/student/skill-analysis/${studentId}`);
};

export const getBranchSkills = (branchId) =>
  api.get(`/skills/${branchId}`);

// =======================
// ADMIN
// =======================

export const getAdminDashboard = () => {
  return api.get("/admin/dashboard");
};

export const getAdminUsers = () => {
  return api.get("/admin/users");
};

export const deleteAdminUser = (userId) => {
  return api.delete(`/admin/users/${userId}`);
};

export const getAdminAssessments = () => {
  return api.get("/admin/assessments");
};

export const deleteAdminAssessment = (assessmentId) => {
  return api.delete(`/admin/assessments/${assessmentId}`);
};

export const getCareerPaths = () => {
  return api.get("/admin/career-paths");
};

export const createCareerPath = (data) => {
  return api.post("/admin/career-paths", data);
};

export const updateCareerPath = (id, data) => {
  return api.put(`/admin/career-paths/${id}`, data);
};

export const deleteCareerPath = (id) => {
  return api.delete(`/admin/career-paths/${id}`);
};

export const getBranches = () => {
  return api.get("/branches");
};

// =======================
// PERSONALITY TESTS
// =======================

export const getPersonalityTests = (studentId) => {
  return api.get(`/personality/tests/${studentId}`);
};

export const getPersonalityQuestions = (testId) => {
  return api.get(`/personality/test/${testId}/questions`);
};

export const submitPersonalityTest = (data) => {
  return api.post("/personality/submit", data);
};

export const getPersonalityResults = (studentId) => {
  return api.get(`/personality/results/${studentId}`);
};

export const getLatestPersonalityResult = (studentId) => {
  return api.get(`/personality/results/${studentId}/latest`);
};

export const getPersonalityResultById = (resultId) => {
  return api.get(`/personality/result/${resultId}`);
};

export const exportPersonalityResultReport = (resultId) => {
  return api.get(`/personality/result/${resultId}/export`, {
    responseType: "blob",
  });
};

export const getAllPersonalityTests = () => {
  return api.get("/personality/admin/tests");
};

// =======================
// NOTIFICATIONS
// =======================

export const getNotificationsForUser = (userId) => {
  return api.get(`/notifications/user/${userId}`);
};

export const getUnreadNotifications = (userId) => {
  return api.get(`/notifications/user/${userId}/unread`);
};

export const getUnreadNotificationCount = (userId) => {
  return api.get(`/notifications/user/${userId}/unread-count`);
};

export const getRecentNotifications = (userId) => {
  return api.get(`/notifications/user/${userId}/recent`);
};

export const getNotificationHistory = (userId, limit = 50) => {
  return api.get(`/notifications/user/${userId}/history?limit=${limit}`);
};

export const exportNotificationHistoryReport = (userId) => {
  return api.get(`/notifications/user/${userId}/history/export`, {
    responseType: "blob",
  });
};

export const getNotificationsByType = (userId, type) => {
  return api.get(`/notifications/user/${userId}/type/${type}`);
};

export const markNotificationAsRead = (id) => {
  return api.put(`/notifications/${id}/read`);
};

export const markAllNotificationsAsRead = (userId) => {
  return api.put(`/notifications/user/${userId}/read-all`);
};

export const deleteNotification = (id) => {
  return api.delete(`/notifications/${id}`);
};

export const deleteAllNotifications = (userId) => {
  return api.delete(`/notifications/user/${userId}/delete-all`);
};

export const migrateLegacyReviewNotificationLinks = () => {
  return api.put("/notifications/migrate/legacy-review-links");
};

export default api;