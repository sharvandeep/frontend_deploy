import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  exportStudentResultReport,
  getAssessmentQuestions,
  getStudentDetailedReview,
} from "../services/api";
import "../styles/student-report.css";

export default function StudentResultReport() {
  const { assessmentId, studentId } = useParams();
  const navigate = useNavigate();

  const [review, setReview] = useState(null);
  const [remark, setRemark] = useState(null);
  const [questions, setQuestions] = useState({});
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    const loadReport = async () => {
      try {
        const [reviewRes, questionsRes, remarkRes] = await Promise.all([
          getStudentDetailedReview(assessmentId, studentId),
          getAssessmentQuestions(assessmentId),
          axios
            .get(`http://localhost:8081/api/remarks/assessment/${assessmentId}/student/${studentId}`)
            .catch(() => ({ data: null })),
        ]);

        setReview(reviewRes.data);
        setRemark(remarkRes.data);

        const qMap = {};
        questionsRes.data.forEach((q) => {
          qMap[q.id] = {
            optiona: q.optiona,
            optionb: q.optionb,
            optionc: q.optionc,
            optiond: q.optiond,
          };
        });
        setQuestions(qMap);
      } catch (error) {
        console.error("Error loading report", error);
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, [assessmentId, studentId]);

  const getGrade = (percentage) => {
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B";
    if (percentage >= 60) return "C";
    return "D";
  };

  const getOptionText = (questionId, letter) => {
    if (!letter) return "No answer";
    const q = questions[questionId];
    if (!q) return letter;

    const key = `option${letter.toLowerCase()}`;
    return q[key] ? `${letter} - ${q[key]}` : letter;
  };

  const handleDownloadPdf = async () => {
    try {
      setDownloading(true);
      const response = await exportStudentResultReport(studentId, assessmentId);
      const contentDisposition = response?.headers?.["content-disposition"] || "";
      const match = contentDisposition.match(/filename="?([^";]+)"?/i);
      const fileName = match?.[1] || `assessment_report_${assessmentId}_${studentId}.pdf`;

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download PDF report", error);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="sr-page">
        <div className="sr-state">Loading report...</div>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="sr-page">
        <div className="sr-state">Unable to load report.</div>
      </div>
    );
  }

  return (
    <div className="sr-page">
      <div className="sr-shell">
        <div className="sr-header">
          <div>
            <h1>Assessment Report</h1>
            <p>Detailed performance view with question level breakdown.</p>
          </div>
          <button className="sr-back" onClick={() => navigate(-1)}>
            Back
          </button>
        </div>

        <section className="sr-summary-card">
          <div className="sr-score-wrap">
            <div className="sr-score">{review.percentage.toFixed(0)}%</div>
            <div className="sr-grade">Grade {getGrade(review.percentage)}</div>
          </div>
          <div className="sr-metrics">
            <div>
              <span>Correct</span>
              <strong>{review.correctAnswers}</strong>
            </div>
            <div>
              <span>Wrong</span>
              <strong>{review.wrongAnswers}</strong>
            </div>
            <div>
              <span>Total</span>
              <strong>{review.totalQuestions}</strong>
            </div>
          </div>
        </section>

        <section className="sr-report-meta">
          <div>
            <span>Student</span>
            <strong>{user?.name || `Student #${studentId}`}</strong>
          </div>
          <div>
            <span>Assessment ID</span>
            <strong>{assessmentId}</strong>
          </div>
          <div>
            <span>Generated On</span>
            <strong>{new Date().toLocaleString()}</strong>
          </div>
        </section>

        {remark && (
          <section className="sr-remark">
            <h2>Faculty Feedback</h2>
            <p>{remark.remark}</p>
          </section>
        )}

        <section className="sr-questions">
          <h2>Detailed Questions</h2>
          {review.questions.map((q, index) => (
            <article key={index} className={`sr-question ${q.marks === 1 ? "ok" : "bad"}`}>
              <div className="sr-question-top">
                <span>Question {index + 1}</span>
                <b>{q.marks === 1 ? "Correct" : "Incorrect"}</b>
              </div>
              <h3>{q.questionText}</h3>
              <div className="sr-answers">
                <div>
                  <label>Your Answer</label>
                  <p>{getOptionText(q.questionId, q.studentAnswer)}</p>
                </div>
                <div>
                  <label>Correct Answer</label>
                  <p>{getOptionText(q.questionId, q.correctAnswer)}</p>
                </div>
              </div>
            </article>
          ))}
        </section>

        <div className="sr-download-footer">
          <button className="sr-download" onClick={handleDownloadPdf} disabled={downloading}>
            {downloading ? "Preparing PDF..." : "Download PDF"}
          </button>
        </div>
      </div>
    </div>
  );
}
