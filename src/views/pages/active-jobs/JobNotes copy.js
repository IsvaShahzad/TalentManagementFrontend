import { useEffect, useState } from "react";
import { CButton, CFormTextarea } from "@coreui/react";
import { addJobNoteApi, getJobNotesApi } from "../../../api/api";

const JobNotes = ({ jobId }) => {
  const [notes, setNotes] = useState([]);
  const [feedback, setFeedback] = useState("");

  const fetchNotes = async () => {
    if (!jobId) return;
    try {
      setLoading(true);
      const res = await getJobNotesApi(jobId, 1, 10); // fetch per-job notes
      if (res?.data?.success) setNotes(res.data.notes);
    } catch (err) {
      console.error("Error fetching job notes:", err);
    } finally {
      setLoading(false);
    }
  };
  const [loading, setLoading] = useState(false);
  const addNote = async () => {
    if (!feedback.trim()) return;

    const userObj = localStorage.getItem('user')
    if (!userObj) return showAlert('User not logged in', 'danger')

    const user = JSON.parse(userObj)
    const userId = user.user_id
    if (!userId) return showAlert('User not logged in', 'danger')
    await addJobNoteApi({
      job_id: jobId,
      user_id: userId,
      feedback,
      visibility: "client",
    });

    setFeedback("");
    fetchNotes();
  };

  useEffect(() => {
    fetchNotes();
  }, [jobId]);

  return (
    <>
      <CFormTextarea
        rows={3}
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="Add feedback..."
      />

      <CButton color="primary" size="sm" className="mt-2 mb-3" onClick={addNote}>
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
            <small className="text-muted">{new Date(n.created_at).toLocaleString()}</small>
          </div>
        ))
      )}
    </>
  );
};

export default JobNotes;
