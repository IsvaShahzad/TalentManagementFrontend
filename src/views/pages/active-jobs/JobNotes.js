import { useEffect, useState } from "react";
import { CButton, CAlert, CFormTextarea } from "@coreui/react";
import { addJobNoteApi, getJobNotesApi } from "../../../api/api";

const JobNotes = ({ jobId }) => {
  const [notes, setNotes] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const userObj = localStorage.getItem("user");
  const user = userObj ? JSON.parse(userObj) : null;
  const recruiterId = user?.user_id;

  const fetchNotes = async () => {
    if (!jobId) return;
    try {
      setLoading(true);
      const res = await getJobNotesApi(jobId, 1, 10);
      if (res?.data?.success) setNotes(res.data.notes);
    } catch (err) {
      console.error("Error fetching job notes:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Alert helper function
  const showAlert = (message, color = "success", duration = 5000) => {
    const id = new Date().getTime();
    setAlerts((prev) => [...prev, { id, message, color }]);
    setTimeout(() => {
      setAlerts((prev) => prev.filter((alert) => alert.id !== id));
    }, duration);
  };

  const addNote = async () => {
    if (!feedback.trim() || !recruiterId) return;

    try {
      await addJobNoteApi({
        job_id: jobId,
        user_id: recruiterId,
        feedback,
        visibility: "client",
      });
      setFeedback("");
      showAlert("Note added successfully", "success"); // ✅ use showAlert instead of CAlert
      fetchNotes();
    } catch (err) {
      showAlert("Failed to add note", "danger");
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [jobId]);

  return (
    <>
      {/* Alerts */}
      <div style={{ position: "fixed", top: 10, right: 10, zIndex: 9999 }}>
        {alerts.map((a) => (
          <CAlert key={a.id} color={a.color} dismissible>
            {a.message}
          </CAlert>
        ))}
      </div>

      <CFormTextarea
        rows={3}
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="Add feedback..."
      />
      <CButton
        color="primary"
        size="sm"
        className="mt-2 mb-3"
        onClick={addNote}
      >
        Add Feedback
      </CButton>

      {loading ? (
        <p>Loading notes...</p>
      ) : notes.length === 0 ? (
        <p>No notes for this job yet.</p>
      ) : (
        notes.map((n) => (
          <div key={n.job_note_id} className="mb-3 border-bottom pb-2">
            <strong>{n.User?.full_name || "You"}</strong>
            <p className="mb-1">{n.feedback}</p>
            <small className="text-muted">
              {new Date(n.created_at).toLocaleString()}
            </small>
          </div>
        ))
      )}
    </>
  );
};

export default JobNotes;
