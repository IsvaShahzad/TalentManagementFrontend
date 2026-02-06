import { useEffect, useState, useRef } from "react";
import {
  CAlert,
  CButton,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CFormInput,
  CContainer,
} from "@coreui/react";
import { getAllJNotes, deleteJobNoteApi } from "../../../api/api";
import CIcon from "@coreui/icons-react";
import { cilTrash, cilSearch } from "@coreui/icons";
import "./NotesCard.css";

const NotesCard = ({ refreshKey }) => {

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userRole, setRole] = useState("");
  const [alerts, setAlerts] = useState([]);
  const [deletingNote, setDeletingNote] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const notesPerPage = 4;

  const [filter, setFilter] = useState("");
  const scrollRef = useRef(null);


  const showAlert = (message, color = "success", duration = 5000) => {
    const id = new Date().getTime();
    setAlerts((prev) => [...prev, { id, message, color }]);
    setTimeout(() => {
      setAlerts((prev) => prev.filter((alert) => alert.id !== id));
    }, duration);
  };

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

  useEffect(() => {
    fetchNotes();
  }, [refreshKey]);



  const handleDelete = async (job_note_id) => {
    try {
      setDeleting(true);
      const role = localStorage.getItem("role");
      const user_id = localStorage.getItem("user_id");

      await deleteJobNoteApi(job_note_id, role, user_id);
      setNotes((prev) => prev.filter((n) => n.job_note_id !== job_note_id));
      showAlert("Note deleted", "success");
      setDeletingNote(null);
    } catch (err) {
      showAlert("Failed to delete note", "danger");
    } finally {
      setDeleting(false);
    }
  };

  const filteredNotes = notes.filter((n) =>
    n.Job?.title.toLowerCase().includes(filter.toLowerCase())
  );

  const indexOfLastNote = currentPage * notesPerPage;
  const indexOfFirstNote = indexOfLastNote - notesPerPage;
  const currentNotes = filteredNotes.slice(indexOfFirstNote, indexOfLastNote);
  const totalPages = Math.ceil(filteredNotes.length / notesPerPage);

  const handlePageClick = (page) => setCurrentPage(page);

  const scrollLeft = () => scrollRef.current.scrollBy({ left: -340, behavior: "smooth" });
  const scrollRight = () => scrollRef.current.scrollBy({ left: 340, behavior: "smooth" });

  if (userRole === "Client") return null;
  if (loading) return <p>Loading notes...</p>;
  if (!notes.length) return null;

  return (
    <CContainer className="notes-container">
      {/* Alerts */}
      <div className="notes-alerts">
        {alerts.map((a) => (
          <CAlert key={a.id} color={a.color} dismissible>{a.message}</CAlert>
        ))}
      </div>

      {/* Card Box */}
      <div className="notes-card-box">
        {/* Search Bar */}
        <div className="notes-card-header">
          <div className="search-wrapper">
            <CFormInput
              placeholder="Search by job name"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="notes-search-bar"
            />
            <CIcon icon={cilSearch} className="notes-search-icon-inside" />
          </div>
        </div>

        {/* Cards with arrows */}
        <div className="notes-scroll-wrapper">
          <CButton className="scroll-btn left" onClick={scrollLeft}>&lt;</CButton>
          <div className="notes-grid" ref={scrollRef}>
            {currentNotes.map((n) => (
              <div className="note-card" key={n.job_note_id}>
                {(userRole === "Admin" || userRole === "Recruiter") && (
                  <CButton
                    color="danger"
                    variant="ghost"
                    size="sm"
                    className="note-delete-btn"
                    onClick={() => setDeletingNote(n)}
                  >
                    <CIcon icon={cilTrash} />
                  </CButton>
                )}
                <div className="note-header">
                  <h3 className="note-title">{n.Job?.title || "N/A"}</h3>
                  <div className="note-meta">{new Date(n.created_at).toLocaleString()}</div>
                </div>
                <div className="note-description-section">
                  <p><strong>Job Feedback:</strong> {n.feedback}</p>
                  <small><strong>Posted by:</strong> {n.User?.full_name || "You"}</small>
                </div>
              </div>
            ))}
          </div>
          <CButton className="scroll-btn right" onClick={scrollRight}>&gt;</CButton>
        </div>
      </div>

      {/* Pagination */}
      {filteredNotes.length > notesPerPage && (
        <div className="notes-pagination">
          <button onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}>&lt;</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageClick(page)}
              className={currentPage === page ? "active-page" : ""}
            >
              {page}
            </button>
          ))}
          <button onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}>&gt;</button>
        </div>
      )}



      {/* Delete Modal */}
      <CModal
        visible={!!deletingNote}
        onClose={() => setDeletingNote(null)}
        className="custom-delete-modal"
      >
        <CModalHeader closeButton>Confirm Delete</CModalHeader>
        <CModalBody>
          <p>Are you sure you want to delete this note?</p>
          <p className="feedback-heading">Job Feedback:</p>
          <p>{deletingNote?.feedback}</p>
          <p className="delete-job-title">
            Job: <strong>{deletingNote?.Job?.title}</strong>
          </p>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setDeletingNote(null)} disabled={deleting}>
            Cancel
          </CButton>
          <CButton 
            color="danger" 
            onClick={() => handleDelete(deletingNote.job_note_id)}
            disabled={deleting}
            style={{ opacity: deleting ? 0.85 : 1 }}
          >
            {deleting ? "Deleting..." : "Delete"}
          </CButton>
        </CModalFooter>
      </CModal>

    </CContainer>



  );
};

export default NotesCard;
