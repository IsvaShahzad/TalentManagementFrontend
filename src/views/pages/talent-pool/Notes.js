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
import './Notes.css'

const Notes = ({ notes, refreshNotes }) => {
    const [data, setData] = useState(null);

    // UI state
    const [noteText, setNoteText] = useState("");
    const [noteDuration, setNoteDuration] = useState(0)
    const [reminders, setReminders] = useState([]);
    const [alerts, setAlerts] = useState([])
    const [showReminderModal, setShowReminderModal] = useState(false);
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [reminderDate, setReminderDate] = useState("");
    const [noteDate, setNoteDate] = useState("");
    const [reminderText, setReminderText] = useState("");
    const [editNote, setEditNote] = useState(false)
    const [deletingNote, setDeletingNote] = useState(null)
    const [deletingRem, setDeletingRem] = useState(null)
    const [selectedNoteForReminder, setSelectedNoteForReminder] = useState(null);
    const [userId, setUserId] = useState('')
    const [currentUser, setCurrentUser] = useState(null);
    const [durationHours, setDurationHours] = useState(0);
    const [durationMinutes, setDurationMinutes] = useState(0);
    const [durationSeconds, setDurationSeconds] = useState(0);


    // 🔹 Alerts
    const showCAlert = (message, color = 'success', duration = 5000) => {
        const id = new Date().getTime()
        setAlerts(prev => [...prev, { id, message, color }])
        setTimeout(() => setAlerts(prev => prev.filter(alert => alert.id !== id)), duration)
    }

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


    const getTotalDurationInSeconds = (hours, minutes, seconds) => {
        const h = parseInt(hours) || 0;
        const m = parseInt(minutes) || 0;
        const s = parseInt(seconds) || 0;
        return h * 3600 + m * 60 + s;
    };


    const handleSave = async () => {
        try {

            // const hours = parseInt(editNote.durationHours) || 0;
            //const minutes = parseInt(editNote.durationMinutes) || 0;
            //const seconds = parseInt(editNote.durationSeconds) || 0;

            //const duration = hours * 3600 + minutes * 60 + seconds;
            const totalDuration = getTotalDurationInSeconds(
                durationHours,
                durationMinutes,
                durationSeconds
            );
            await saveHandler({
                editNote,
                totalDuration,
                refreshNotes,
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
    //  if (!data) return <p>Loading...</p>;
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
        <CContainer
            style={{
                fontFamily: 'Inter, sans-serif',
                marginTop: '2rem',
                maxWidth: '95vw',
            }}
        >
            {/* Alerts */}
            <div

                style={{ position: 'fixed', top: '10px', right: '10px', zIndex: 9999 }}>
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
                    <CRow>
                        {notes && notes.length > 0 ? notes.map(n => (
                            <CCol key={n.note_id} xs={12} md={6} lg={4}>
                                <div
                                    className="notes-column"

                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = "translateY(-3px)";
                                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.25)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = "translateY(0)";
                                        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
                                    }}
                                >
                                    <div
                                        className="note-header"

                                    >
                                        {/* Title */}
                                        <h5 style={{ fontWeight: 600, margin: 0 }}>
                                            Call Note for {n.Candidate?.name || "-"}
                                        </h5>

                                        {/* Icons on the right */}
                                        <div style={{ display: "flex", gap: "12px" }}>
                                            <CIcon
                                                icon={cilPencil}
                                                style={{ color: "#3b82f6", cursor: "pointer" }}
                                                onClick={() => handleEdit(n)}
                                            />
                                            <CIcon
                                                icon={cilTrash}
                                                style={{ color: "#ef4444", cursor: "pointer" }}
                                                onClick={() => handleDelete(n)}
                                            />
                                        </div>
                                    </div>
                                    <p style={{ marginTop: "0.6rem" }}>{n.note || ""}</p>
                                    <p style={{ fontSize: "0.85rem", color: "#555" }}>
                                        {new Date(n.created_at).toLocaleString()}
                                    </p>

                                    {/* Candidate details */}
                                    <p><strong>Candidate:</strong> {n.Candidate?.name || "-"}</p>
                                    <p><strong>Email:</strong> {n.Candidate?.email || "-"}</p>
                                    <p><strong>Duration: </strong>{formatDuration(n.duration)}</p>

                                    <h6 style={{ textAlign: "center", marginTop: "1.5rem", opacity: 0.7 }}>Follow Up Reminders</h6>

                                    {n.reminders?.length > 0 && n.reminders.map(reminder => (
                                        <div
                                            key={reminder.reminder_id}
                                            className="reminder-id"
                                        >

                                            <div
                                                className="rem-delete"
                                            >
                                                <CIcon
                                                    icon={cilX}
                                                    style={{ color: "#ef4444", cursor: "pointer" }}
                                                    onClick={() => handleDeleteRem(reminder)}
                                                />
                                            </div>

                                            <p style={{ margin: 0 }}>
                                                <strong>Created by:</strong> {reminder.User?.full_name || "Unknown"}
                                            </p>

                                            <p style={{ margin: "4px 0" }}>
                                                <strong>{reminder.message}</strong>

                                            </p>
                                            <p>
                                                Follow up At:  {new Date(reminder.remind_at).toLocaleDateString()}
                                            </p>
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
                durationHours={durationHours}
                durationMinutes={durationMinutes}
                durationSeconds={durationSeconds}
                setDurationHours={setDurationHours}
                setDurationMinutes={setDurationMinutes}
                setDurationSeconds={setDurationSeconds}

            />

        </CContainer >
    );

};

export default Notes;
