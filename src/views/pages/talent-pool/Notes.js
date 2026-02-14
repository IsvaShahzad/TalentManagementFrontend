import React, { useEffect, useState, useRef } from "react";
import { Mail, BellRing, ChevronLeft, ChevronRight } from "lucide-react";
import {
  CCard, CCardBody, CButton, CFormInput,
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
  CContainer, CAlert, CDropdown, CDropdownMenu, CDropdownItem, CDropdownToggle
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilX } from "@coreui/icons";
import NoteModals from "../../../components/NoteModals";
import {
  handleEdit as editHandler,
  handleSave as saveHandler,
  handleDelete as deleteHandler,
  handleConfirmDelete as confirmDeleteHandler,
  handleConfirmDeleteReminder as confirmDeleteHandlerReminder,
  handleDeleteRem as deleteHandlerRem
} from '../../../components/NoteHandler';
import './Notes.css';
import { addReminderApi, getNotesByPageApi } from '../../../api/api';

const Notes = () => {
  // ==========================
  // State variables
  // ==========================
  const [alerts, setAlerts] = useState([]);
  const [notes, setNotes] = useState([]); // Only current page notes
  const [totalNotes, setTotalNotes] = useState(0); // Total notes count
  const [page, setPage] = useState(1); // Current page
  const pageSize = 6; // Notes per page
  const [creatingNote, setCreatingNote] = useState(false)

  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderDate, setReminderDate] = useState("");
  const [reminderTime, setReminderTime] = useState("");
  const [reminderText, setReminderText] = useState("");
  const [editNote, setEditNote] = useState(false);
  const [deletingNote, setDeletingNote] = useState(null);
  const [deletingRem, setDeletingRem] = useState(null);
  const [selectedNoteForReminder, setSelectedNoteForReminder] = useState(null);
  const [durationHours, setDurationHours] = useState(0);
  const [durationMinutes, setDurationMinutes] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [expandedNoteId, setExpandedNoteId] = useState(null);
  const scrollRef = useRef(null); // Horizontal scroll ref
  const [addingReminder, setAddingReminder] = useState(false);

  // ==========================
  // Alerts
  // ==========================
  const showCAlert = (message, color = 'success', duration = 5000) => {
    const id = new Date().getTime();
    setAlerts(prev => [...prev, { id, message, color }]);
    setTimeout(() => setAlerts(prev => prev.filter(alert => alert.id !== id)), duration);
  };




  const refreshPage = () => {
    window.location.reload();
  };


  // ==========================
  // Fetch notes for current page
  // ==========================
  const fetchNotes = async (pageNumber = 1) => {
    try {
      const userObj = localStorage.getItem('user');
      const user = JSON.parse(userObj);
      const userId = user?.user_id;

      const data = await getNotesByPageApi(pageNumber, pageSize, userId); // pass userId
      if (data.success) {
        setNotes(data.notes); // only notes for this page
        setTotalNotes(data.total || 0); // total notes of this user
      } else {
        showCAlert("Failed to fetch notes", "danger");
      }
    } catch (error) {
      console.error(error);
      showCAlert("Error fetching notes", "danger");
    }
  };


  useEffect(() => {
    fetchNotes(page); // Fetch notes whenever page changes
  }, [page]);

  // Listen for noteCreated event to refresh notes instantly
  useEffect(() => {
    const handleNoteCreated = () => {
      fetchNotes(page);
    };
    window.addEventListener('noteCreated', handleNoteCreated);
    return () => window.removeEventListener('noteCreated', handleNoteCreated);
  }, [page]);

  // ==========================
  // Preserve scroll & refresh
  // ==========================
  const preserveScrollRefresh = async (newNoteAdded = false) => {
    const scrollY = window.scrollY;
    let newPage = page;

    if (newNoteAdded) {
      // Move to last page to show the new note
      const lastPage = Math.ceil((totalNotes + 1) / pageSize);
      newPage = lastPage;

      // Fetch notes for last page immediately
      const data = await fetchNotes(lastPage); // fetchNotes should return data
      if (data) {
        setNotes(data.notes);
        setTotalNotes(data.total || 0);
      }
      setPage(lastPage); // optional, just to update UI page indicator
    } else {
      await fetchNotes(page); // just refresh current page
    }

    setTimeout(() => window.scrollTo(0, scrollY), 0);
  };




  const addNoteToState = (newNote) => {
    if (!newNote) return;
    setNotes(prev => [newNote, ...prev]); // add new note at the top
    setTotalNotes(prev => prev + 1);      // update total notes
  };



  // ==========================
  // Reminder modal functions
  // ==========================
  const resetReminderModal = () => {
    setReminderDate("");
    setReminderTime("");
    setReminderText("");
    setSelectedNoteForReminder(null);
  };




  const addReminder = async (e) => {
    e.preventDefault();
    if (!reminderDate || !reminderText || !selectedNoteForReminder) {
      showCAlert("Please enter date, time, and text", "danger");
      return;
    }

    // Default to current time if time not provided
    const timeToUse = reminderTime || new Date().toTimeString().slice(0, 5); // HH:MM format

    try {
      setAddingReminder(true);
      const userObj = localStorage.getItem('user');
      const user = JSON.parse(userObj);
      const userId = user?.user_id;
      // Combine date and time: "YYYY-MM-DD" + "T" + "HH:MM:SS"
      const combinedDate = new Date(`${reminderDate}T${timeToUse}:00`).toISOString();

      // // Prevent duplicate note for same candidate
      // const candidateNotes = notes.filter(n => n.Candidate?.candidate_id === selectedNoteForReminder.Candidate?.candidate_id);
      // if (candidateNotes.length > 0) {
      //   showCAlert("Note for this candidate already exists", "warning");
      //   return;
      // }

      await addReminderApi({
        note_id: selectedNoteForReminder.note_id,
        message: reminderText,
        remind_at: combinedDate,
        userId,
      });

      setShowReminderModal(false);
      resetReminderModal();
      showCAlert("Reminder added successfully", "success");
      preserveScrollRefresh();
    } catch (error) {
      console.error("Adding reminder failed:", error);
      showCAlert("Failed to add reminder", "danger");
    } finally {
      setAddingReminder(false);
    }
  };

  // ==========================
  // Note handlers
  // ==========================
  const handleEdit = (note) => editHandler(note, setEditNote);
  const handleDelete = (note) => deleteHandler(note, setDeletingNote);
  const handleDeleteRem = (reminder) => deleteHandlerRem(reminder, setDeletingRem);

  const handleConfirmDelete = async () => {
    await confirmDeleteHandler({ deletingNote, setDeletingNote, showCAlert, refreshNotes: preserveScrollRefresh });
  };

  const handleConfirmDeleteReminder = async () => {
    await confirmDeleteHandlerReminder({ deletingRem, setDeletingRem, showCAlert, refreshNotes: preserveScrollRefresh });
  };

  const getTotalDurationInSeconds = (hours, minutes, seconds) => {
    const h = parseInt(hours) || 0;
    const m = parseInt(minutes) || 0;
    const s = parseInt(seconds) || 0;
    return h * 3600 + m * 60 + s;
  };

  const handleSave = async () => {
    const totalDuration = getTotalDurationInSeconds(durationHours, durationMinutes, durationSeconds);
    await saveHandler({ editNote, totalDuration, refreshNotes: preserveScrollRefresh, showCAlert, setEditNote });
  };

  const formatDuration = (totalSeconds) => {
    if (!totalSeconds) return "-";
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0) parts.push(`${seconds}s`);
    return parts.join(" ") || "0s";
  };

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -scrollRef.current.offsetWidth / 3, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: scrollRef.current.offsetWidth / 3, behavior: "smooth" });
    }
  };

  // ==========================
  // JSX
  // ==========================
  return (
    <CContainer style={{ fontFamily: 'Inter, sans-serif', marginTop: '1.5rem', maxWidth: '95vw', fontSize: '0.95rem', lineHeight: 1.5 }}>
      {/* Alerts */}
      <div style={{ position: 'fixed', top: '10px', right: '10px', zIndex: 9999 }}>
        {alerts.map(alert => <CAlert key={alert.id} color={alert.color} dismissible>{alert.message}</CAlert>)}
      </div>

      <CCard className="mt-3 no-shadow-card">



        <CCardBody>
          {/* Horizontal scroll */}
          <div style={{ position: "relative", width: "100%" }}>
            <button onClick={scrollLeft} style={{
              position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
              zIndex: 10, background: "#fff", borderRadius: "50%", border: "1px solid #ccc",
              width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer"
            }}><ChevronLeft size={20} /></button>

            <div ref={scrollRef} style={{ display: "flex", gap: "12px", overflowX: 'hidden', padding: "10px 40px", scrollBehavior: "smooth" }}>
              {notes.length > 0 ? notes.map(n => (
                <div key={n.note_id} style={{ flex: "0 0 30%", minWidth: "300px" }}>
                  <div className="notes-column" style={{
                    padding: '1.25rem',
                    borderRadius: '0.8rem',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                    height: '450px', // fixed height for consistent ratio
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}>
                    <div className="note-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <h5 style={{ fontWeight: 600, fontSize: '1rem', margin: 0 }}>Call Note for {n.Candidate?.name || "-"}</h5>
                      <CDropdown>
                        <CDropdownToggle color="transparent" className="p-0" style={{ border: "none", fontSize: "1.2rem" }} caret={false}>⋮</CDropdownToggle>
                        <CDropdownMenu>
                          <CDropdownItem onClick={() => handleEdit(n)}>Edit</CDropdownItem>
                          <CDropdownItem onClick={() => handleDelete(n)}>Delete</CDropdownItem>
                        </CDropdownMenu>
                      </CDropdown>
                    </div>

                    {/* Note Content with Click Panel */}
                    <div className="note-text-container" style={{ position: 'relative' }}>
                      <p
                        style={{
                          fontSize: '0.9rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          cursor: 'pointer',
                        }}
                        onClick={() => setExpandedNoteId(prev => prev === n.note_id ? null : n.note_id)}
                      >
                        {'->'} {n.note || ""}
                      </p>

                      {/* Click Panel */}
                      {expandedNoteId === n.note_id && (
                        <div className="hover-note-panel" style={{
                          position: 'absolute',
                          top: '100%', // shows below the text
                          left: 0,
                          width: '300px',
                          backgroundColor: '#fff',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          padding: '10px',
                          borderRadius: '8px',
                          zIndex: 100,
                          fontSize: '0.9rem',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          whiteSpace: 'pre-wrap',
                        }}>
                          {n.note}
                        </div>
                      )}
                    </div>
                    <p><strong>Duration: </strong>{formatDuration(n.duration)}</p>
                    <p style={{ display: 'flex', alignItems: 'center', gap: '5px', margin: '0.3rem 0', fontSize: '0.9rem' }}>
                      <Mail size={17} color="#3971cbff" />
                      <a href={`https://mail.google.com/mail/?view=cm&to=${n.Candidate?.email || ""}`} target="_blank" rel="noreferrer" style={{ color: '#3971cbff', textDecoration: 'none' }}>
                        {n.Candidate?.email || "-"}
                      </a>
                    </p>
                    <p style={{ fontSize: "0.8rem", color: "#555" }}>{new Date(n.created_at).toLocaleString()}</p>




                    <div
                      className="reminder-scroll"
                      style={{
                        display: 'flex',
                        gap: '12px',
                        overflowX: 'auto',
                        paddingBottom: '0.4rem',
                        // minHeight: "105px",
                        alignItems: n.reminders?.length ? "flex-start" : "center",
                        justifyContent: n.reminders?.length ? "flex-start" : "center",
                      }}
                    >
                      {n.reminders?.length > 0 ? (
                        n.reminders.map(reminder => (
                          <div
                            key={reminder.reminder_id}
                            style={{
                              flex: "0 0 220px",
                              maxWidth: "220px",
                              backgroundColor: "#fff",
                              borderRadius: "14px",
                              padding: "16px",
                              marginBottom: "8px",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.07)",
                              position: "relative",
                              display: "flex",
                              flexDirection: "column",
                              gap: "8px",
                              fontSize: '0.85rem',
                              wordWrap: 'break-word',
                              overflowWrap: 'break-word',
                              overflow: 'hidden',
                            }}
                          >
                            <CIcon
                              icon={cilX}
                              style={{
                                color: "#ef4444",
                                cursor: "pointer",
                                position: "absolute",
                                top: 8,
                                right: 8
                              }}
                              onClick={() => handleDeleteRem(reminder)}
                            />
                            <p style={{ margin: 0 }}>
                              <strong>Created by:</strong> {reminder.User?.full_name || "Unknown"}
                            </p>
                            <p style={{ margin: 0 }}>
                              <strong>{reminder.message}</strong>
                            </p>
                            <p
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                margin: 0
                              }}
                            >
                              <BellRing color="#facc15" size={17} />{" "}
                              {new Date(reminder.remind_at).toLocaleString()}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div
                          style={{
                            textAlign: "center",
                            width: "100%",
                            marginTop: "8px",
                            fontSize: "0.85rem",
                            color: "#888",
                            minHeight: "110px", // ensures similar height as reminder cards
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            gap: "12px", // adds vertical spacing inside the placeholder
                            padding: "16px",
                            backgroundColor: "#fff",
                          }}
                        >
                          <p>No Reminders</p>

                        </div>
                      )}
                    </div>



                    <CButton color="primary" className="mt-2" style={{ fontSize: '0.9rem', backgroundColor: '#1f3c88' }} onClick={() => { setSelectedNoteForReminder(n); setShowReminderModal(true); }}>
                      + Add Reminder
                    </CButton>
                  </div>
                </div>
              )) : <p className="text-center text-muted">No notes found.</p>}
            </div>

            <button onClick={scrollRight} style={{
              position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)",
              zIndex: 10, background: "#fff", borderRadius: "50%", border: "1px solid #ccc",
              width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer"
            }}><ChevronRight size={20} /></button>
          </div>

          {/* Pagination */}
          <div style={{ display: "flex", justifyContent: "center", marginTop: 20, gap: 10 }}>
            <CButton disabled={page === 1} onClick={() => setPage(prev => prev - 1)}>Prev</CButton>
            <span style={{ alignSelf: "center" }}>Page {page}</span>
            <CButton disabled={page >= Math.ceil(totalNotes / pageSize)} onClick={() => setPage(prev => prev + 1)}>Next</CButton>

          </div>

          {/* Reminder Modal */}
          <CModal visible={showReminderModal} onClose={() => { resetReminderModal(); setShowReminderModal(false); }}>
            <CModalHeader><CModalTitle>Add Reminder</CModalTitle></CModalHeader>
            <CModalBody>
              <CFormInput type="date" className="mb-2"

                label="Reminder Date" value={reminderDate} onChange={(e) => setReminderDate(e.target.value)} />
              <CFormInput type="time" className="mb-2" label="Reminder Time" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} />
              <CFormInput type="text" label="Reminder Text" value={reminderText} onChange={(e) => setReminderText(e.target.value)} />
            </CModalBody>
            <CModalFooter>
              <CButton color="secondary" onClick={() => {
                setShowReminderModal(false)
                refreshPage()
              }


              }>Cancel</CButton>

              <CButton
                //color="primary"
                onClick={addReminder}
                disabled={addingReminder}

                style={{
                  color: "#ffffff",
                  backgroundColor: " #1f3c88"
                }}
              >
                {addingReminder ? 'Adding...' : 'Add'}
              </CButton>
            </CModalFooter>
          </CModal>

        </CCardBody>





      </CCard>

      <NoteModals
        editNote={editNote}
        setEditNote={setEditNote}
        handleSave={handleSave}
        deletingNote={deletingNote}
        deletingRem={deletingRem}
        setDeletingNote={setDeletingNote}
        setDeletingRem={setDeletingRem}
        handleConfirmDelete={handleConfirmDelete}
        handleConfirmDeleteReminder={handleConfirmDeleteReminder}
        refreshNotes={preserveScrollRefresh}
        showCAlert={showCAlert}
        durationHours={durationHours}
        durationMinutes={durationMinutes}
        durationSeconds={durationSeconds}
        setDurationHours={setDurationHours}
        setDurationMinutes={setDurationMinutes}
        setDurationSeconds={setDurationSeconds}
        addNoteToState={addNoteToState} // ✅ add here


        creatingNote={creatingNote}           // ✅ add this
        setCreatingNote={setCreatingNote}     // ✅ add this
        notes={notes}

      />

    </CContainer>
  );
};

export default Notes;
