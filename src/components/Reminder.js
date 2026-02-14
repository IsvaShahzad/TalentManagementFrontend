import React, { useState, useEffect } from "react";
import {
    CCard, CCardBody, CButton, CFormInput, CFormTextarea,
    CRow, CCol, CTable, CTableHead, CTableRow, CTableHeaderCell,
    CTableBody, CTableDataCell, CModal, CModalHeader,
    CModalTitle, CModalBody, CModalFooter,
    CContainer,
    CAlert
} from "@coreui/react";
import { getAll_Notes } from "../../../api/api";

const Reminder = ({ searchId, candidates, refreshCandidates }) => {
    const [data, setData] = useState(null);

    // UI state
    const [noteText, setNoteText] = useState("");
    const [reminders, setReminders] = useState([]);
    const [alerts, setAlerts] = useState([])
    const [showReminderModal, setShowReminderModal] = useState(false);
    const [reminderDate, setReminderDate] = useState("");
    const [reminderText, setReminderText] = useState("");

    // 🔹 Alerts
    const showCAlert = (message, color = 'success', duration = 5000) => {
        const id = new Date().getTime()
        setAlerts(prev => [...prev, { id, message, color }])
        setTimeout(() => setAlerts(prev => prev.filter(alert => alert.id !== id)), duration)
    }

    const fetchNotes = async () => {
        try {
            const res = await getAll_Notes();
            setNotes(res.notes);
        } catch (err) {
            console.error(err);
        }
    };

    // Load Data
    useEffect(() => {
        fetchNotes();
    }, []);


    // Save Note
    const saveNote = async () => {
        const payload = {
            notes: noteText,
            reminders: reminders,
        };

        const res = await fetch(`/api/search/${searchId}/update-note`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (res.ok) {
            alert("Saved!");
        }
        //  fetchNotes()
    };

    //  const handleEdit = (note) => editHandler(candidate, setEditingCandidate)


    // Add Reminder
    const addReminder = () => {
        if (!reminderDate || !reminderText) {
            alert("Enter date & text");
            return;
        }

        setReminders([
            ...reminders,
            { date: reminderDate, text: reminderText },
        ]);

        setShowReminderModal(false);
        setReminderDate("");
        setReminderText("");
        fetchNotes()
    };

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


                    {/* NOTES INPUT */}
                    <CFormTextarea
                        label="Notes"
                        rows={5}
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                    />


                    {/* REMINDERS TABLE */}
                    <div className="mt-4">
                        <h5>Reminders</h5>
                        <CButton
                            //color="primary"
                            className="mb-3"
                            style={{ backgroundColor: '#1f3c88' }}
                            onClick={() => setShowReminderModal(true)}
                        >
                            + Add Reminder
                        </CButton>

                        <CTable striped>
                            <CTableHead>
                                <CTableRow>
                                    <CTableHeaderCell>Date</CTableHeaderCell>
                                    <CTableHeaderCell>Reminder</CTableHeaderCell>
                                    <CTableHeaderCell>Actions</CTableHeaderCell>
                                </CTableRow>
                            </CTableHead>

                            <CTableBody>
                                {reminders.map((r, index) => (
                                    <CTableRow key={index}>
                                        <CTableDataCell>{r.date}</CTableDataCell>
                                        <CTableDataCell>{r.text}</CTableDataCell>
                                        <CTableDataCell>
                                            <CButton color="danger" size="sm" onClick={() => deleteReminder(index)}>
                                                Delete
                                            </CButton>
                                        </CTableDataCell>
                                    </CTableRow>
                                ))}
                            </CTableBody>
                        </CTable>
                    </div>

                    <CButton color="success" className="mt-3" onClick={saveNote}>
                        Save Changes
                    </CButton>

                    {/* Add Reminder Modal */}
                    <CModal visible={showReminderModal} onClose={() => setShowReminderModal(false)}>
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
                    </CModal>
                </CCardBody>
            </CCard>


        </CContainer>
    );

};

export default Reminder;
