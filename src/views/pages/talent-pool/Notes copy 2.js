import React, { useState, useEffect } from "react";
import {
    CCard, CCardBody, CButton, CFormInput, CFormTextarea,
    CRow, CCol, CTable, CTableHead, CTableRow, CTableHeaderCell,
    CTableBody, CTableDataCell, CModal, CModalHeader,
    CModalTitle, CModalBody, CModalFooter,
    CContainer,
    CAlert
} from "@coreui/react";
import { getAll_Notes, addReminderApi } from "../../../api/api";
import CIcon from "@coreui/icons-react";
import { cilBook, cilPencil, cilTrash, cilX } from "@coreui/icons";
import {
    handleEdit as editHandler,
    handleSave as saveHandler,
    handleDelete as deleteHandler,
    handleConfirmDelete as confirmDeleteHandler,
    handleConfirmDeleteReminder as confirmDeleteHandlerReminder,
    handleDeleteRem as deleteHandlerRem
} from '../../../components/NoteHandler'
import NoteModals from "../../../components/NoteModals";

const Notes = ({ notes, refreshNotes }) => {
    const [data, setData] = useState(null);

    // UI state
    const [noteText, setNoteText] = useState("");
    const [reminders, setReminders] = useState([]);
    const [alerts, setAlerts] = useState([])
    const [showReminderModal, setShowReminderModal] = useState(false);
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [reminderDate, setReminderDate] = useState("");
    const [noteDate, setNoteDate] = useState("");
    const [reminderText, setReminderText] = useState("");
    // const [notes, setNotes] = useState([])
    const [editNote, setEditNote] = useState([])
    const [deletingNote, setDeletingNote] = useState(null)
    const [deletingRem, setDeletingRem] = useState(null)
    const [selectedNoteForReminder, setSelectedNoteForReminder] = useState(null);
    const [reminderTime, setReminderTime] = useState("");
    const [userId, setUserId] = useState('')
    const [currentUser, setCurrentUser] = useState(null);


    // 🔹 Alerts
    const showCAlert = (message, color = 'success', duration = 5000) => {
        const id = new Date().getTime()
        setAlerts(prev => [...prev, { id, message, color }])
        setTimeout(() => setAlerts(prev => prev.filter(alert => alert.id !== id)), duration)
    }

    // Load Data



    // Save Note
    const saveNote = async () => {
        const payload = {
            notes: noteText,
            reminders: reminders,
        };
        console.log("note id,", notes.id)
        const res = await update_Note(notes.id, payload)

        if (res.ok) {
            alert("Saved!");
        }
    };

    // Add Reminder
    const addReminder = () => {
        if (!reminderDate || !reminderText) {
            showCAlert("Enter date & text", "danger");
            return;
        }

        try {

            const userObj = localStorage.getItem('user');
            setCurrentUser(JSON.parse(userObj));
            const user = JSON.parse(userObj);

            const userId = user.user_id;
            setUserId(userId)
            console.log("user id for getting searches for now logged in user", userId)


            // Automatically set time to 00:00 (12 AM)
            const combinedDate = new Date(`${reminderDate}T00:00:00`).toISOString();

            //   const combinedDate = new Date(`${reminderDate}T${reminderTime}:00.000Z`).toISOString();
            // Combine date & time as local time (PKT)
            // const localDate = new Date(`${reminderDate}T${reminderTime}:00`);
            // Convert to UTC string before sending to API
            //const combinedDateUTC = new Date(localDate.getTime() - (localDate.getTimezoneOffset() * 60000)).toISOString();
            //is storing at the same time as UTC and then displaying after converting in local so 1:00 is stored and 6:00 is displayed using this approach

            console.log("sending new reminder data", selectedNoteForReminder.note_id,
                reminderTime,
                //  remindAtUTC,
                combinedDate,
                reminderText,
                userId)
            addReminderApi(
                {
                    note_id: selectedNoteForReminder.note_id,
                    message: reminderText || null,
                    remind_at: combinedDate || null,
                    userId,
                })
            setShowReminderModal(false);
            setReminderDate("");
            setReminderText("");
            showCAlert('Reminder added', 'success');
            refreshNotes()

        } catch (error) {
            console.error('Adding reminder failed:', error);
            showCAlert('Failed to add reminder', 'danger');
        }

    };


    const handleEdit = (note) => editHandler(note, setEditNote)

    const handleSave = async () => {
        try {
            await saveHandler({
                editNote,
                //  refreshCandidates,
                showCAlert,
                setEditNote,
            });

            setEditNote(null);
            showCAlert("Note updated successfully", "success");
        } catch (err) {
            console.error(err);
            showCAlert("Failed to save changes", "danger");
        }
    };

    const handleDelete = (note) => deleteHandler(note, setDeletingNote)
    const handleDeleteRem = (reminder) => deleteHandlerRem(reminder, setDeletingRem)
    const handleConfirmDelete = () => {
        confirmDeleteHandler({
            deletingNote,
            setDeletingNote,
            showCAlert,
            refreshNotes
        })
    }

    const handleConfirmDeleteReminder = () => {
        confirmDeleteHandlerReminder({
            deletingRem,
            setDeletingRem,
            showCAlert,
            refreshNotes
        })
    }




    // Delete Reminder
    const deleteReminder = (index) => {
        const updated = reminders.filter((_, i) => i !== index);
        setReminders(updated);
    };

    //  if (!data) return <p>Loading...</p>;

    return (
        <CContainer
            style={{
                fontFamily: 'Inter, sans-serif',
                marginTop: '2rem',
                maxWidth: '95vw',
            }}
        >

            {/* Alerts */}
            <div style={{ position: 'fixed', top: '10px', right: '10px', zIndex: 9999 }}>
                {alerts.map(alert => <CAlert key={alert.id} color={alert.color} dismissible>{alert.message}</CAlert>)}
            </div>


            <h3
                style={{
                    fontWeight: 550,
                    marginBottom: '1.5rem',
                    textAlign: 'center', // ✅ centers the heading
                }}
            >
                Notes
            </h3>
            <CCard className="mt-3">
                <CCardBody>

                    {/* Notes Table */}
                    <CTable
                        responsive
                        className="align-middle"
                        style={{
                            width: '100%',
                            borderCollapse: 'separate',
                            borderSpacing: '0 0.5rem',
                            fontSize: '1rem',
                            tableLayout: 'auto',
                        }}
                    >
                        <CTableHead>
                            <CTableRow style={{ fontWeight: 600, border: 'none', fontSize: '1rem' }}>
                                Call Notes
                            </CTableRow>
                        </CTableHead>







                        <CTableBody >
                            {notes && notes.length > 0 ? notes.map(n => (
                                //<React.Fragment key={n.note_id} >
                                <CCol key={note.note_id} xs={12} md={6} lg={4}>
                                    <div
                                        style={{
                                            padding: "1rem",
                                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                                            borderRadius: "8px",
                                            marginBottom: "1.2rem",
                                            background: "#fff",
                                            transition: "transform 0.2s ease, box-shadow 0.2s ease",
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = "translateY(-3px)";
                                            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.25)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = "translateY(0)";
                                            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
                                        }}
                                    >




                                        <CTableRow style={{ fontWeight: 600, border: 'none', fontSize: '1rem' }}>
                                            Call Note for  {n.Candidate?.name || "-"}
                                        </CTableRow>

                                        <CTableRow style={{
                                            backgroundColor: '#fff',
                                            //boxShadow: '0 2px 6px rgba(0,0,0,0.11)',
                                            borderRadius: '0.5rem',
                                            border: 'none'
                                        }}>
                                            <CTableDataCell style={{ border: 'none', padding: '1rem' }}>
                                                {n.note || ''}
                                            </CTableDataCell>
                                            <CTableDataCell style={{ border: 'none', padding: '0.8rem 1rem', whiteSpace: 'nowrap' }}>
                                                {new Date(n.created_at).toLocaleString()}
                                            </CTableDataCell>

                                            <CTableDataCell style={{ border: 'none', padding: '1rem' }}>
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                                                    <CIcon icon={cilPencil} style={{ color: '#3b82f6', cursor: 'pointer' }} onClick={() => handleEdit(n)} />
                                                    <CIcon icon={cilTrash} style={{ color: '#ef4444', cursor: 'pointer' }} onClick={() => handleDelete(n)} />
                                                </div>
                                            </CTableDataCell>
                                        </CTableRow>

                                        <CTableRow>
                                            <CTableDataCell style={{ border: 'none' }}>
                                                <strong>Candidate:</strong>
                                            </CTableDataCell>
                                            <CTableDataCell style={{ border: 'none' }}>
                                                {n.Candidate?.name || "-"}
                                            </CTableDataCell>
                                        </CTableRow>
                                        <CTableRow>

                                            <CTableDataCell style={{ border: 'none' }}>
                                                <strong> Candidate Email:
                                                </strong>
                                            </CTableDataCell>
                                            <CTableDataCell style={{ border: 'none' }}>
                                                {n.Candidate?.email || "-"}
                                            </CTableDataCell>
                                        </CTableRow>

                                        <CTableRow style={{ fontWeight: 600, border: 'none', fontSize: '1rem', alignItems: 'center' }}>
                                            <CTableDataCell colSpan={5} style={{ textAlign: 'center', fontStyle: 'italic' }}>
                                                Follow Up Reminders
                                            </CTableDataCell>
                                        </CTableRow>

                                        {n.reminders && n.reminders.length > 0 && n.reminders.map(reminder => (
                                            <CTableRow
                                                key={reminder.reminder_id} style={{ backgroundColor: '#f9f9f9' }}>


                                                <CTableDataCell >
                                                    Created by: {reminder.User?.full_name || 'Unknown'}
                                                </CTableDataCell>

                                                <CTableDataCell style={{ padding: '0.5rem 1rem' }}>
                                                    <strong>{reminder.message}</strong> —
                                                    {/*    <small> currentUser
                                                    ? new Date(reminder.remind_at).toLocaleString("en-US", { timeZone: currentUser.timezone })
                                                    : new Date(reminder.remind_at).toLocaleString() // fallback
                                                
                                                </small>*/}
                                                    {new Date(reminder.remind_at).toLocaleDateString()}


                                                </CTableDataCell>

                                                <CTableDataCell style={{ border: 'none', padding: '1rem' }}>
                                                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', alignItems: 'center' }}>
                                                        <CIcon icon={cilX} style={{ color: '#ef4444', cursor: 'pointer' }} onClick={() => handleDeleteRem(reminder)} />
                                                    </div>
                                                </CTableDataCell>

                                            </CTableRow>
                                        ))}
                                        <CTableRow>

                                            <CTableDataCell style={{ fontWeight: 600, border: 'none', fontSize: '1rem', alignItems: 'center' }}>
                                                <CButton
                                                    color="primary"
                                                    className="mb-3"
                                                    onClick={() => {
                                                        setSelectedNoteForReminder(n);  // <-- store the note
                                                        setShowReminderModal(true);
                                                    }}

                                                >
                                                    + Add Reminder
                                                </CButton>
                                            </CTableDataCell>

                                        </CTableRow>
                                    </div>
                                </CCol>
                                //</React.Fragment>
                            )) : (
                                <CTableRow>
                                    <CTableDataCell colSpan="10" className="text-center text-muted" style={{ border: 'none', padding: '1rem' }}>
                                        No notes found.
                                    </CTableDataCell>
                                </CTableRow>
                            )}
                        </CTableBody>







                        <CRow>
                            {notes && notes.length > 0 ? notes.map(n => (
                                <CCol key={n.note_id} xs={12} md={6} lg={4}>
                                    <div
                                        style={{
                                            padding: "1rem",
                                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                                            borderRadius: "8px",
                                            marginBottom: "1.2rem",
                                            background: "#fff",
                                            transition: "transform 0.2s ease, box-shadow 0.2s ease",
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = "translateY(-3px)";
                                            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.25)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = "translateY(0)";
                                            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
                                        }}
                                    >

                                        {/* Title */}
                                        <h5 style={{ fontWeight: 600 }}>
                                            Call Note for {n.Candidate?.name || "-"}
                                        </h5>

                                        {/* Note Text */}
                                        <p style={{ marginTop: "0.6rem" }}>{n.note || ""}</p>

                                        {/* Created At */}
                                        <p style={{ fontSize: "0.85rem", color: "#555" }}>
                                            {new Date(n.created_at).toLocaleString()}
                                        </p>

                                        {/* Edit / Delete icons */}
                                        <div style={{ display: "flex", gap: "10px", marginBottom: "1rem" }}>
                                            <CIcon icon={cilPencil} style={{ color: "#3b82f6", cursor: "pointer" }} onClick={() => handleEdit(n)} />
                                            <CIcon icon={cilTrash} style={{ color: "#ef4444", cursor: "pointer" }} onClick={() => handleDelete(n)} />
                                        </div>

                                        {/* Candidate details */}
                                        <p><strong>Candidate:</strong> {n.Candidate?.name || "-"}</p>
                                        <p><strong>Email:</strong> {n.Candidate?.email || "-"}</p>

                                        {/* Reminder header */}
                                        <h6 style={{ textAlign: "center", marginTop: "1rem", opacity: 0.7 }}>Follow Up Reminders</h6>

                                        {/* Reminders */}
                                        {n.reminders?.length > 0 && n.reminders.map(reminder => (
                                            <div
                                                key={reminder.reminder_id}
                                                style={{
                                                    background: "#f9f9f9",
                                                    padding: "0.8rem",
                                                    borderRadius: "6px",
                                                    marginTop: "0.5rem"
                                                }}
                                            >
                                                <p style={{ margin: 0 }}>
                                                    <strong>Created by:</strong> {reminder.User?.full_name || "Unknown"}
                                                </p>

                                                <p style={{ margin: "4px 0" }}>
                                                    <strong>{reminder.message}</strong> — {new Date(reminder.remind_at).toLocaleDateString()}
                                                </p>

                                                <CIcon
                                                    icon={cilX}
                                                    style={{ color: "#ef4444", cursor: "pointer" }}
                                                    onClick={() => handleDeleteRem(reminder)}
                                                />
                                            </div>
                                        ))}

                                        {/* Add Reminder Button */}
                                        <CButton
                                            color="primary"
                                            className="mt-3"
                                            onClick={() => {
                                                setSelectedNoteForReminder(n);
                                                setShowReminderModal(true);
                                            }}
                                        >
                                            + Add Reminder
                                        </CButton>

                                    </div>
                                </CCol>
                            )) : (
                                <p className="text-center text-muted">No notes found.</p>
                            )}
                        </CRow>






                        <CRow>
                            {notes.map((note) => (
                                <CCol key={note.note_id} xs={12} md={6} lg={4}>
                                    <div
                                        style={{
                                            padding: "1rem",
                                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                                            borderRadius: "10px",
                                            marginBottom: "1.2rem",
                                            background: "#fff",
                                            transition: "transform 0.2s ease, box-shadow 0.2s ease",
                                        }}

                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = "translateY(-3px)";
                                            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.25)";
                                        }}

                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = "translateY(0)";
                                            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
                                        }}
                                    >
                                        {/* Note Title */}
                                        <h5 style={{ marginBottom: "0.5rem" }}>{note.title}</h5>

                                        {/* Note Description */}
                                        <p style={{ marginBottom: "1rem", color: "#555" }}>
                                            {note.description}
                                        </p>

                                        {/* Reminder Section */}
                                        {note.reminders?.length > 0 && (
                                            <div
                                                style={{
                                                    background: "#f8fafc",
                                                    padding: "0.75rem",
                                                    borderRadius: "8px",
                                                    marginBottom: "0.8rem",
                                                    border: "1px solid #e5e7eb",
                                                }}
                                            >
                                                <strong>Reminders:</strong>

                                                {note.reminders.map((reminder) => (
                                                    <div
                                                        key={reminder.reminder_id}
                                                        style={{
                                                            display: "flex",
                                                            justifyContent: "space-between",
                                                            alignItems: "center",
                                                            marginTop: "0.5rem",
                                                            padding: "0.4rem 0.6rem",
                                                            borderRadius: "6px",
                                                            background: "#fff",
                                                            border: "1px solid #ececec",
                                                            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                                                        }}
                                                    >
                                                        <div>
                                                            <div style={{ fontSize: "0.9rem" }}>{reminder.message}</div>
                                                            <small style={{ color: "#666" }}>
                                                                {new Date(reminder.remind_at).toLocaleDateString()}
                                                            </small>

                                                            <div style={{ fontSize: "0.75rem", color: "#888" }}>
                                                                Created by: {reminder.User?.full_name || "Unknown"}
                                                            </div>
                                                        </div>

                                                        {/* Delete Icon (X) */}
                                                        <CIcon
                                                            icon={cilX}
                                                            style={{
                                                                color: "#ef4444",
                                                                cursor: "pointer",
                                                                fontSize: "1.2rem",
                                                            }}
                                                            onClick={() => handleDeleteRem(reminder)}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Actions (Edit, Delete, Add Reminder) */}
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "flex-end",
                                                gap: "10px",
                                            }}
                                        >
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={() => handleEdit(note)}
                                            >
                                                Edit
                                            </button>

                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleDelete(note)}
                                            >
                                                Delete
                                            </button>

                                            <button
                                                className="btn btn-warning btn-sm"
                                                onClick={() => handleAddReminder(note)}
                                            >
                                                Add Reminder
                                            </button>
                                        </div>
                                    </div>
                                </CCol>
                            ))}
                        </CRow>

                    </CTable >



                    {/* Add Reminder Modal */}
                    < CModal visible={showReminderModal} onClose={() => setShowReminderModal(false)}>
                        <CModalHeader>
                            <CModalTitle>Add Reminder</CModalTitle>
                        </CModalHeader>
                        <CModalBody>
                            <CFormInput
                                type="date"
                                className="mb-3"
                                label="Reminder Date"
                                value={reminderDate}
                                onChange={(e) => setReminderDate(e.target.value)}
                            />
                            {/* Time 
                            <CFormInput
                                type="time"
                                className="mb-3"
                                label="Reminder Time"
                                value={reminderTime}
                                onChange={(e) => setReminderTime(e.target.value)}
                            />*/}
                            <CFormInput
                                type="text"
                                label="Reminder Text"
                                value={reminderText}
                                onChange={(e) => setReminderText(e.target.value)}
                            />
                        </CModalBody>
                        <CModalFooter>
                            <CButton color="secondary" onClick={() => setShowReminderModal(false)}>
                                Cancel
                            </CButton>
                            <CButton color="primary" onClick={addReminder}>
                                Add
                            </CButton>
                        </CModalFooter>
                    </CModal >


                    {/* Add Update Notes Modal */}
                    < CModal visible={showNoteModal} onClose={() => setShowNoteModal(false)}>
                        <CModalHeader>
                            <CModalTitle>Update Note</CModalTitle>
                        </CModalHeader>
                        <CModalBody>
                            <CFormInput
                                type="date"
                                className="mb-3"
                                label="Reminder Date"
                                value={noteDate}
                                onChange={(e) => setNoteDate(e.target.value)}
                            />

                            <CFormInput
                                type="text"
                                label="Reminder Text"
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                            />
                        </CModalBody>
                        <CModalFooter>
                            <CButton color="secondary" onClick={() => setShowNoteModal(false)}>
                                Cancel
                            </CButton>
                            <CButton color="primary" onClick={addReminder}>
                                Add
                            </CButton>
                        </CModalFooter>
                    </CModal >
                </CCardBody >
            </CCard >
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
                noteText={noteText}
                setNoteText={setNoteText}
                showCAlert={showCAlert}

            />

        </CContainer >
    );

};

export default Notes;
