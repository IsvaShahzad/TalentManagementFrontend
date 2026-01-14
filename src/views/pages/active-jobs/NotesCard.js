import { useEffect, useState } from "react";
import {
    CAlert,
    CCard,
    CCardBody,
    CButton,
    CModal,
    CModalBody,
    CModalFooter,
    CModalHeader,
} from "@coreui/react";
import { getAllJNotes, deleteJobNoteApi } from "../../../api/api";
import CIcon from "@coreui/icons-react";
import { cilTrash } from "@coreui/icons";

const NotesCard = () => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [userRole, setRole] = useState("");
    const [alerts, setAlerts] = useState([]);
    const [deletingNote, setDeletingNote] = useState(null);

    const fetchNotes = async () => {
        try {
            const role = localStorage.getItem("role");
            const user_id = localStorage.getItem("user_id");
            setRole(role);
            setLoading(true);

            const res = await getAllJNotes({ role, user_id });
            if (res?.success) setNotes(res.notes);
        } catch (err) {
            console.error("Error fetching job notes:", err);
        } finally {
            setLoading(false);
        }
    };

    // ✅ Show alerts correctly
    const showAlert = (message, color = "success", duration = 5000) => {
        const id = new Date().getTime();
        setAlerts((prev) => [...prev, { id, message, color }]);
        setTimeout(() => {
            setAlerts((prev) => prev.filter((alert) => alert.id !== id));
        }, duration);
    };

    useEffect(() => {
        fetchNotes();
    }, []);

    const handleDelete = async (job_note_id) => {
        try {
            const role = localStorage.getItem("role");
            const user_id = localStorage.getItem("user_id");

            await deleteJobNoteApi(job_note_id, role, user_id);

            setNotes((prev) => prev.filter((n) => n.job_note_id !== job_note_id));
            showAlert("Note deleted", "success"); // ✅ use showAlert instead of CAlert
            setDeletingNote(null);
        } catch (err) {
            showAlert("Failed to delete note", "danger");
        }
    };

    if (userRole === "Client") return null;
    if (loading) return <p>Loading notes...</p>;
    if (!notes.length) return <p>No notes available.</p>;

    return (
        <>
            {/* Render alerts */}
            <div style={{ position: "fixed", top: 10, right: 10, zIndex: 9999 }}>
                {alerts.map((a) => (
                    <CAlert key={a.id} color={a.color} dismissible>
                        {a.message}
                    </CAlert>
                ))}
            </div>

            <CCard className="mt-4">
                <CCardBody>
                    <h5>All Notes</h5>

                    {notes.map((n) => (
                        <div
                            key={n.job_note_id}
                            className="mb-3 border-bottom pb-2 position-relative"
                        >
                            {(userRole === "Admin" || userRole === "Recruiter") && (
                                <CButton
                                    color="danger"
                                    variant="ghost"
                                    size="sm"
                                    className="position-absolute top-0 end-0"
                                    onClick={() => setDeletingNote(n)}
                                >
                                    <CIcon icon={cilTrash} />
                                </CButton>
                            )}

                            <strong>{n.User?.full_name || "You"}</strong>
                            <p className="mb-1">{n.feedback}</p>
                            <small className="text-muted">
                                {new Date(n.created_at).toLocaleString()} — Job:{" "}
                                {n.Job?.title || "N/A"}
                            </small>
                        </div>
                    ))}
                </CCardBody>
            </CCard>

            {/* Delete Modal */}
            <CModal visible={!!deletingNote} onClose={() => setDeletingNote(null)}>
                <CModalHeader closeButton>Confirm Delete</CModalHeader>
                <CModalBody>
                    Are you sure you want to delete this note?
                    <br />
                    <strong>{deletingNote?.feedback}</strong>
                    <br />
                    Job: <strong>{deletingNote?.Job?.title}</strong>
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setDeletingNote(null)}>
                        Cancel
                    </CButton>
                    <CButton
                        color="danger"
                        onClick={() => handleDelete(deletingNote.job_note_id)}
                        style={{ color: "white" }}
                    >
                        Delete
                    </CButton>
                </CModalFooter>
            </CModal>
        </>
    );
};

export default NotesCard;
