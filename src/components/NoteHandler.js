
import { update_Note, getAll_Notes, delete_Note, delete_reminder } from '../api/api'





/**
 * 🔹 Edit candidate (open edit modal)
 */
export const handleEdit = (note, setEditNote) => {
    setEditNote({ ...note })
}

/**
 * 🔹 Save candidate after editing
 */

export const handleSave = async ({
    editNote,
    //duration,
    totalDuration,
    refreshNotes,
    showCAlert,
    setEditNote,
}) => {
    if (!editNote) return
    try {
        await update_Note(editNote.note_id, {
            note: editNote.note || null,
            duration: totalDuration,
        })

        console.log("note data to be updated", editNote.note_id,
            editNote.note || null,
            editNote.duration || null,
        )
        showCAlert('note updated successfully', 'success')
        refreshNotes()
    } catch (err) {
        console.error('note update failed:', err)
        showCAlert('Failed to update note', 'danger')
    } finally {
        setEditNote(null)
    }
}

/**
 * 🔹 Delete candidate
 */
export const handleDelete = (note, setDeletingNote) => {
    setDeletingNote(note)
}

export const handleDeleteRem = (note, setDeletingRem) => {
    setDeletingRem(note)
}



export const handleConfirmDelete = async ({
    deletingNote,
    setDeletingNote,
    showCAlert,
    refreshNotes, // ✨ ADD THIS ARGUMENT
}) => {
    if (!deletingNote) return
    try {
        await delete_Note(deletingNote.note_id)
        showCAlert('note deleted successfully', 'success')
        refreshNotes()
    } catch (err) {
        console.error(err)
        showCAlert('Failed to delete candidate', 'danger')
    } finally {
        setDeletingNote(null)
    }
}


export const handleConfirmDeleteReminder = async ({
    deletingRem,
    setDeletingRem,
    showCAlert,
    refreshNotes
}) => {
    if (!deletingRem) return
    try {
        await delete_reminder(deletingRem.reminder_id)
        showCAlert('reminder deleted successfully', 'success')
        refreshNotes()
    } catch (err) {
        console.error(err)
        showCAlert('Failed to delete reminder', 'danger')
    } finally {
        setDeletingRem(null)
    }
}
