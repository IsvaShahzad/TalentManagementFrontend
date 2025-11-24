// import React, { useState, useEffect } from "react";
// import { Mail, BellRing } from "lucide-react";

// import {
//     CCard, CCardBody, CButton, CFormInput, CFormTextarea,
//     CRow, CCol, CTable, CTableHead, CTableRow, CTableHeaderCell,
//     CTableBody, CTableDataCell, CModal, CModalHeader,
//     CModalTitle, CModalBody, CModalFooter,
//     CContainer,
//     CAlert
// } from "@coreui/react";
// import { getAll_Notes, addReminderApi } from "../../../api/api";
// import CIcon from "@coreui/icons-react";
// import { cilBook, cilPencil, cilTrash, cilX, cilEnvelopeClosed, cilBell} from "@coreui/icons";
// import { CDropdown, CDropdownMenu, CDropdownItem, CDropdownToggle } from "@coreui/react";
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


// import {
//     handleEdit as editHandler,
//     handleSave as saveHandler,
//     handleDelete as deleteHandler,
//     handleConfirmDelete as confirmDeleteHandler,
//     handleConfirmDeleteReminder as confirmDeleteHandlerReminder,
//     handleDeleteRem as deleteHandlerRem
// } from '../../../components/NoteHandler'
// import NoteModals from "../../../components/NoteModals";
// import './Notes.css'

// const Notes = ({ notes, refreshNotes }) => {
//     const [data, setData] = useState(null);

//     // UI state
//     const [noteText, setNoteText] = useState("");
//     const [noteDuration, setNoteDuration] = useState(0)
//     const [reminders, setReminders] = useState([]);
//     const [alerts, setAlerts] = useState([])
//     const [showReminderModal, setShowReminderModal] = useState(false);
//     const [showNoteModal, setShowNoteModal] = useState(false);
//     const [reminderDate, setReminderDate] = useState("");
//     const [noteDate, setNoteDate] = useState("");
//     const [reminderText, setReminderText] = useState("");
//     const [editNote, setEditNote] = useState(false)
//     const [deletingNote, setDeletingNote] = useState(null)
//     const [deletingRem, setDeletingRem] = useState(null)
//     const [selectedNoteForReminder, setSelectedNoteForReminder] = useState(null);
//     const [userId, setUserId] = useState('')
//     const [currentUser, setCurrentUser] = useState(null);
//     const [durationHours, setDurationHours] = useState(0);
//     const [durationMinutes, setDurationMinutes] = useState(0);
//     const [durationSeconds, setDurationSeconds] = useState(0);



//     const chartData = notes?.map(note => ({
//     date: new Date(note.created_at).toLocaleDateString(),
//     duration: note.duration / 60, // Convert seconds to minutes
// })) || [];


//     // 🔹 Alerts
//     const showCAlert = (message, color = 'success', duration = 5000) => {
//         const id = new Date().getTime()
//         setAlerts(prev => [...prev, { id, message, color }])
//         setTimeout(() => setAlerts(prev => prev.filter(alert => alert.id !== id)), duration)
//     }

//     const addReminder = () => {
//         if (!reminderDate || !reminderText) {
//             showCAlert("Enter date & text", "danger");
//             return;
//         }

//         try {

//             const userObj = localStorage.getItem('user');
//             setCurrentUser(JSON.parse(userObj));
//             const user = JSON.parse(userObj);

//             const userId = user.user_id;
//             setUserId(userId)
//             console.log("user id for getting searches for now logged in user", userId)


//             // Automatically set time to 00:00 (12 AM)
//             const combinedDate = new Date(`${reminderDate}T00:00:00`).toISOString();

//             //   const combinedDate = new Date(`${reminderDate}T${reminderTime}:00.000Z`).toISOString();
//             // Combine date & time as local time (PKT)
//             // const localDate = new Date(`${reminderDate}T${reminderTime}:00`);
//             // Convert to UTC string before sending to API
//             //const combinedDateUTC = new Date(localDate.getTime() - (localDate.getTimezoneOffset() * 60000)).toISOString();
//             //is storing at the same time as UTC and then displaying after converting in local so 1:00 is stored and 6:00 is displayed using this approach

//             console.log("sending new reminder data", selectedNoteForReminder.note_id,
//                 combinedDate,
//                 reminderText,
//                 userId)
//             addReminderApi(
//                 {
//                     note_id: selectedNoteForReminder.note_id,
//                     message: reminderText || null,
//                     remind_at: combinedDate || null,
//                     userId,
//                 })
//             setShowReminderModal(false);
//             setReminderDate("");
//             setReminderText("");
//             showCAlert('Reminder added', 'success');
//             refreshNotes()

//         } catch (error) {
//             console.error('Adding reminder failed:', error);
//             showCAlert('Failed to add reminder', 'danger');
//         }

//     };


//     const handleEdit = (note) => editHandler(note, setEditNote)


//     const getTotalDurationInSeconds = (hours, minutes, seconds) => {
//         const h = parseInt(hours) || 0;
//         const m = parseInt(minutes) || 0;
//         const s = parseInt(seconds) || 0;
//         return h * 3600 + m * 60 + s;
//     };


//     const handleSave = async () => {
//         try {

//             // const hours = parseInt(editNote.durationHours) || 0;
//             //const minutes = parseInt(editNote.durationMinutes) || 0;
//             //const seconds = parseInt(editNote.durationSeconds) || 0;

//             //const duration = hours * 3600 + minutes * 60 + seconds;
//             const totalDuration = getTotalDurationInSeconds(
//                 durationHours,
//                 durationMinutes,
//                 durationSeconds
//             );
//             await saveHandler({
//                 editNote,
//                 totalDuration,
//                 refreshNotes,
//                 showCAlert,
//                 setEditNote,
//             });

//             setEditNote(null);
//             showCAlert("Note updated successfully", "success");
//         } catch (err) {
//             console.error(err);
//             showCAlert("Failed to save changes", "danger");
//         }
//     };

//     const handleDelete = (note) => deleteHandler(note, setDeletingNote)
//     const handleDeleteRem = (reminder) => deleteHandlerRem(reminder, setDeletingRem)
//     const handleConfirmDelete = () => {
//         confirmDeleteHandler({
//             deletingNote,
//             setDeletingNote,
//             showCAlert,
//             refreshNotes
//         })
//     }

//     const handleConfirmDeleteReminder = () => {
//         confirmDeleteHandlerReminder({
//             deletingRem,
//             setDeletingRem,
//             showCAlert,
//             refreshNotes
//         })
//     }
//     //  if (!data) return <p>Loading...</p>;
//     const formatDuration = (totalSeconds) => {
//         if (!totalSeconds) return "-";
//         const hours = Math.floor(totalSeconds / 3600);
//         const minutes = Math.floor((totalSeconds % 3600) / 60);
//         const seconds = totalSeconds % 60;

//         const parts = [];
//         if (hours > 0) parts.push(`${hours}h`);
//         if (minutes > 0) parts.push(`${minutes}m`);
//         if (seconds > 0) parts.push(`${seconds}s`);

//         return parts.join(" ") || "0s";
//     };


//     return (
//         <CContainer
//             style={{
//                 fontFamily: 'Inter, sans-serif',
//                 marginTop: '2rem',
//                 maxWidth: '95vw',
//             }}
//         >
//             {/* Alerts */}
//             <div

//                 style={{ position: 'fixed', top: '10px', right: '10px', zIndex: 9999 }}>
//                 {alerts.map(alert => <CAlert key={alert.id} color={alert.color} dismissible>{alert.message}</CAlert>)}
//             </div>


//             {/* <h3
//                 style={{
//                     fontWeight: 550,
//                     marginBottom: '1.5rem',
//                     textAlign: 'center', // ✅ centers the heading
//                 }}
//             >
//                 Notes
//             </h3> */}
//            <CCard className="mt-3 no-shadow-card">

//                 <CCardBody>
//                     <CRow>
//                         {notes && notes.length > 0 ? notes.map(n => (
//                             <CCol key={n.note_id} xs={12} md={6} lg={4}>
//                                 <div
//                                     className="notes-column"

//                                     onMouseEnter={(e) => {
//                                         // e.currentTarget.style.transform = "translateY(-3px)";
//                                         // e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.25)";
//                                     }}
//                                     onMouseLeave={(e) => {
//                                         // e.currentTarget.style.transform = "translateY(0)";
//                                         // e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
//                                     }}
//                                 >
//                                     <div
//                                         className="note-header"

//                                     >
//                                         {/* Title */}
//                                         <h5 style={{ fontWeight: 600, margin: 0 }}>
//                                             Call Note for {n.Candidate?.name || "-"}
//                                         </h5>

//                                         {/* Icons on the right
//                                         <div style={{ display: "flex", gap: "12px" }}>
//                                             <CIcon
//                                                 icon={cilPencil}
//                                                 style={{ color: "#3b82f6", cursor: "pointer" }}
//                                                 onClick={() => handleEdit(n)}
//                                             />
//                                             <CIcon
//                                                 icon={cilTrash}
//                                                 style={{ color: "#ef4444", cursor: "pointer" }}
//                                                 onClick={() => handleDelete(n)}
//                                             />
//                                         </div> */}


// <CDropdown>
//   <CDropdownToggle
//     color="transparent"
//     className="p-0"
//     style={{ border: "none", fontSize: "1.2rem", lineHeight: "1" }}
//     caret={false} // <- THIS removes the arrow
//   >
//     ⋮
//   </CDropdownToggle>
//   <CDropdownMenu>
//     <CDropdownItem onClick={() => handleEdit(n)}>Edit</CDropdownItem>
//     <CDropdownItem onClick={() => handleDelete(n)}>Delete</CDropdownItem>
//   </CDropdownMenu>
// </CDropdown>








//                                     </div>
//                                     <p style={{ marginTop: "2.5rem" }}>{'->'} {n.note || ""}</p>


//                                     {/* Candidate details */}
//                                      <p><strong>Duration: </strong>{formatDuration(n.duration)}</p>

//                                     {/* <p><strong>Candidate:</strong> {n.Candidate?.name || "-"}</p> */}
// <p style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '0.3rem 0' }}>
//   <Mail size={16} color="#3971cbff" />
//   <a 
//     href={`https://mail.google.com/mail/?view=cm&to=${n.Candidate?.email || ""}`} 
//     target="_blank" 
//     rel="noopener noreferrer"
//     style={{ color: '#3971cbff', textDecoration: 'none' }}
//   >
//     {n.Candidate?.email || "-"}
//   </a>
// </p>


// <p style={{ fontSize: "0.85rem", color: "#555" }}>
//                                         {new Date(n.created_at).toLocaleString()}
//                                     </p>
//                                     {/* <h6 style={{ textAlign: "center", marginTop: "1.5rem", opacity: 0.7 }}>Follow Up Reminders</h6> */}


// <div className="reminder-scroll">
//   {n.reminders?.length > 0 && n.reminders.map(reminder => (

//     <div
//       key={reminder.reminder_id}
//       style={{
//         flex: "0 0 250px",   // fixed width, no shrinking
//         backgroundColor: "#fff",
//         borderRadius: "16px",
//         padding: "18px",
//         marginBottom: "14px",
//         boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
//         position: "relative",
//         display: "flex",
//         flexDirection: "column",
//         gap: "10px"
//       }}
//     >
//       <div className="rem-delete">
//         <CIcon
//           icon={cilX}
//           style={{
//             color: "#ef4444",
//             cursor: "pointer",
//             position: "absolute",
//             top: 10,
//             right: 10
//           }}
//           onClick={() => handleDeleteRem(reminder)}
//         />
//       </div>

//       <p style={{ margin: "0 0 4px 0" }}>
//         <strong>Created by:</strong> {reminder.User?.full_name || "Unknown"}
//       </p>

//       <p style={{ margin: "0 0 6px 0", lineHeight: "1.4" }}>
//         <strong>{reminder.message}</strong>
//       </p>

//       {/* Follow Up with BellRing from lucide */}
//       <p style={{ 
//         display: "flex",
//         alignItems: "center",
//         gap: "12px",        // space between bell and text
//         marginTop: "4px"
//       }}>
//         <BellRing color="#facc15" size={18} /> 
//         <span style={{ lineHeight: 1.3 }}>
//           {new Date(reminder.remind_at).toLocaleDateString()}
//         </span>
//       </p>

//     </div>

//   ))}
// </div>




//                                     {/* Add Reminder Button */}
//                                     <CButton
//                                         color="primary"
//                                         className="mt-3"
//                                         onClick={() => {
//                                             setSelectedNoteForReminder(n);
//                                             setShowReminderModal(true);
//                                         }}
//                                     >
//                                         + Add Reminder
//                                     </CButton>



//                                 </div>
//                             </CCol>
//                         )) : (
//                             <p className="text-center text-muted">No notes found.</p>
//                         )}
//                     </CRow>



//                     {/* Add Reminder Modal */}
//                     < CModal visible={showReminderModal} onClose={() => setShowReminderModal(false)}>
//                         <CModalHeader>
//                             <CModalTitle>Add Reminder</CModalTitle>
//                         </CModalHeader>
//                         <CModalBody>
//                             <CFormInput
//                                 type="date"
//                                 className="mb-3"
//                                 label="Reminder Date"
//                                 value={reminderDate}
//                                 onChange={(e) => setReminderDate(e.target.value)}
//                             />
//                             {/* Time 
//                             <CFormInput
//                                 type="time"
//                                 className="mb-3"
//                                 label="Reminder Time"
//                                 value={reminderTime}
//                                 onChange={(e) => setReminderTime(e.target.value)}
//                             />*/}
//                             <CFormInput
//                                 type="text"
//                                 label="Reminder Text"
//                                 value={reminderText}
//                                 onChange={(e) => setReminderText(e.target.value)}
//                             />
//                         </CModalBody>
//                         <CModalFooter>
//                             <CButton color="secondary" onClick={() => setShowReminderModal(false)}>
//                                 Cancel
//                             </CButton>
//                             <CButton color="primary" onClick={addReminder}>
//                                 Add
//                             </CButton>
//                         </CModalFooter>
//                     </CModal >

//                 </CCardBody >
//             </CCard >





//             <NoteModals
//                 editNote={editNote}
//                 setEditNote={setEditNote}
//                 handleSave={handleSave}
//                 deletingNote={deletingNote}
//                 deletingRem={deletingRem}
//                 setDeletingNote={setDeletingNote}
//                 setDeletingRem={setDeletingRem}
//                 handleConfirmDelete={handleConfirmDelete}
//                 handleConfirmDeleteReminder={handleConfirmDeleteReminder}
//                 refreshNotes={refreshNotes}
//                 noteText={noteText}
//                 setNoteText={setNoteText}
//                 showCAlert={showCAlert}
//                 durationHours={durationHours}
//                 durationMinutes={durationMinutes}
//                 durationSeconds={durationSeconds}
//                 setDurationHours={setDurationHours}
//                 setDurationMinutes={setDurationMinutes}
//                 setDurationSeconds={setDurationSeconds}

//             />

//         </CContainer >
//     );

// };

// export default Notes;


import React, { useState } from "react";
import { Mail, BellRing } from "lucide-react";
import {
  CCard, CCardBody, CButton, CFormInput,
  CRow, CCol, CModal, CModalHeader,
  CModalTitle, CModalBody, CModalFooter,
  CContainer, CAlert, CDropdown, CDropdownMenu, CDropdownItem, CDropdownToggle
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilX } from "@coreui/icons";
import NoteModals from "../../../components/NoteModals";
import { handleEdit as editHandler, handleSave as saveHandler, handleDelete as deleteHandler, handleConfirmDelete as confirmDeleteHandler, handleConfirmDeleteReminder as confirmDeleteHandlerReminder, handleDeleteRem as deleteHandlerRem } from '../../../components/NoteHandler';
import './Notes.css';
import { addReminderApi } from '../../../api/api';

const Notes = ({ notes, refreshNotes }) => {
  const [alerts, setAlerts] = useState([]);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderDate, setReminderDate] = useState("");
  const [reminderText, setReminderText] = useState("");
  const [editNote, setEditNote] = useState(false);
  const [deletingNote, setDeletingNote] = useState(null);
  const [deletingRem, setDeletingRem] = useState(null);
  const [selectedNoteForReminder, setSelectedNoteForReminder] = useState(null);
  const [durationHours, setDurationHours] = useState(0);
  const [durationMinutes, setDurationMinutes] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);

  const showCAlert = (message, color = 'success', duration = 5000) => {
    const id = new Date().getTime();
    setAlerts(prev => [...prev, { id, message, color }]);
    setTimeout(() => setAlerts(prev => prev.filter(alert => alert.id !== id)), duration);
  }

  const handleEdit = (note) => editHandler(note, setEditNote);
  const handleDelete = (note) => deleteHandler(note, setDeletingNote);
  const handleDeleteRem = (reminder) => deleteHandlerRem(reminder, setDeletingRem);
  const handleConfirmDelete = () => {
    confirmDeleteHandler({ deletingNote, setDeletingNote, showCAlert, refreshNotes });
  }
  const handleConfirmDeleteReminder = () => {
    confirmDeleteHandlerReminder({ deletingRem, setDeletingRem, showCAlert, refreshNotes });
  }

  const getTotalDurationInSeconds = (hours, minutes, seconds) => {
    const h = parseInt(hours) || 0;
    const m = parseInt(minutes) || 0;
    const s = parseInt(seconds) || 0;
    return h * 3600 + m * 60 + s;
  };

  const handleSave = async () => {
    try {
      const totalDuration = getTotalDurationInSeconds(durationHours, durationMinutes, durationSeconds);
      await saveHandler({ editNote, totalDuration, refreshNotes, showCAlert, setEditNote });
      setEditNote(null);
      showCAlert("Note updated successfully", "success");
    } catch (err) {
      console.error(err);
      showCAlert("Failed to save changes", "danger");
    }
  };

  const addReminder = async () => {
    if (!reminderDate || !reminderText || !selectedNoteForReminder) {
      showCAlert("Please enter both date and text", "danger");
      return;
    }

    try {
      const userObj = localStorage.getItem('user');
      const user = JSON.parse(userObj);
      const userId = user?.user_id;
      const combinedDate = new Date(`${reminderDate}T00:00:00`).toISOString();

      await addReminderApi({
        note_id: selectedNoteForReminder.note_id,
        message: reminderText,
        remind_at: combinedDate,
        userId,
      });

      setShowReminderModal(false);
      setReminderDate("");
      setReminderText("");
      setSelectedNoteForReminder(null);
      showCAlert("Reminder added successfully", "success");
      refreshNotes();
    } catch (error) {
      console.error("Adding reminder failed:", error);
      showCAlert("Failed to add reminder", "danger");
    }
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

  return (
    <CContainer style={{ fontFamily: 'Inter, sans-serif', marginTop: '1.5rem', maxWidth: '95vw', fontSize: '0.95rem', lineHeight: 1.5 }}>
      {/* Alerts */}
      <div style={{ position: 'fixed', top: '10px', right: '10px', zIndex: 9999 }}>
        {alerts.map(alert => <CAlert key={alert.id} color={alert.color} dismissible>{alert.message}</CAlert>)}
      </div>

      <CCard className="mt-3 no-shadow-card">
        <CCardBody>
          <CRow>
            {notes && notes.length > 0 ? notes.map(n => (
              <CCol key={n.note_id} xs={12} md={6} lg={4}>
                <div className="notes-column" style={{ padding: '1.25rem', borderRadius: '0.8rem', boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}>
                  <div className="note-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <h5 style={{ fontWeight: 600, fontSize: '1rem', margin: 0 }}>Call Note for {n.Candidate?.name || "-"}</h5>
                    <CDropdown>
                      <CDropdownToggle color="transparent" className="p-0" style={{ border: "none", fontSize: "1.2rem", lineHeight: "1" }} caret={false}>
                        ⋮
                      </CDropdownToggle>
                      <CDropdownMenu>
                        <CDropdownItem onClick={() => handleEdit(n)}>Edit</CDropdownItem>
                        <CDropdownItem onClick={() => handleDelete(n)}>Delete</CDropdownItem>
                      </CDropdownMenu>
                    </CDropdown>
                  </div>

                  <p style={{ marginTop: "0.6rem", fontSize: '0.9rem' }}>{'->'} {n.note || ""}</p>
                  <p><strong>Duration: </strong>{formatDuration(n.duration)}</p>

                  <p style={{ display: 'flex', alignItems: 'center', gap: '5px', margin: '0.3rem 0', fontSize: '0.9rem' }}>
                    <Mail size={17} color="#3971cbff" />
                    <a href={`https://mail.google.com/mail/?view=cm&to=${n.Candidate?.email || ""}`} target="_blank" rel="noopener noreferrer" style={{ color: '#3971cbff', textDecoration: 'none' }}>
                      {n.Candidate?.email || "-"}
                    </a>
                  </p>

                  <p style={{ fontSize: "0.8rem", color: "#555" }}>{new Date(n.created_at).toLocaleString()}</p>

                  {/* Reminders */}
                  {/* Reminders */}
                  <div className="reminder-scroll" style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '0.4rem' }}>
                    {n.reminders?.length > 0 && n.reminders.map(reminder => (
                      <div key={reminder.reminder_id} style={{
                        flex: "0 0 220px", // reduced width
                        backgroundColor: "#fff",
                        borderRadius: "14px",
                        padding: "16px",
                        marginBottom: "8px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                        position: "relative",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                        fontSize: '0.85rem'
                      }}>
                        <CIcon icon={cilX} style={{ color: "#ef4444", cursor: "pointer", position: "absolute", top: 8, right: 8 }} onClick={() => handleDeleteRem(reminder)} />
                        <p style={{ margin: 0 }}><strong>Created by:</strong> {reminder.User?.full_name || "Unknown"}</p>
                        <p style={{ margin: 0, lineHeight: 1.3 }}><strong>{reminder.message}</strong></p>
                        <p style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "2px" }}><BellRing color="#facc15" size={17} /> {new Date(reminder.remind_at).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>


                  <CButton color="primary" className="mt-2" style={{ fontSize: '0.95rem', padding: '6px 12px' }} onClick={() => { setSelectedNoteForReminder(n); setShowReminderModal(true); }}>
                    + Add Reminder
                  </CButton>
                </div>
              </CCol>
            )) : (
              <p className="text-center text-muted" style={{ fontSize: '0.95rem' }}>No notes found.</p>
            )}
          </CRow>

          {/* Add Reminder Modal */}
          <CModal visible={showReminderModal} onClose={() => setShowReminderModal(false)}>
            <CModalHeader>
              <CModalTitle>Add Reminder</CModalTitle>
            </CModalHeader>
            <CModalBody>
              <CFormInput type="date" className="mb-2" label="Reminder Date" value={reminderDate} onChange={(e) => setReminderDate(e.target.value)} />
              <CFormInput type="text" label="Reminder Text" value={reminderText} onChange={(e) => setReminderText(e.target.value)} />
            </CModalBody>
            <CModalFooter>
              <CButton color="secondary" onClick={() => setShowReminderModal(false)}>Cancel</CButton>
              <CButton color="primary" onClick={addReminder}>Add</CButton>
            </CModalFooter>
          </CModal>

        </CCardBody>
      </CCard>

      {/* Note modals for edit/delete */}
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
        refreshNotes={refreshNotes}
        showCAlert={showCAlert}
        durationHours={durationHours}
        durationMinutes={durationMinutes}
        durationSeconds={durationSeconds}
        setDurationHours={setDurationHours}
        setDurationMinutes={setDurationMinutes}
        setDurationSeconds={setDurationSeconds}
      />

    </CContainer>
  );
};

export default Notes;

