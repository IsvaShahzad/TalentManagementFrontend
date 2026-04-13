import { saveSearchApi, updateCandidateByEmailApi, deleteCandidateApi, createNoteApi } from '../api/api'




export const handleCreateNote = async ({
  candidateId,
  notesText,
  creatingNote,
  setCreatingNote,
  showCAlert,
  setNotesModalVisible,
  setSuccess,
  setError,
}) => {

  if (!notesText) {
    showCAlert('Enter text', 'danger')
    return
  }
  try {
    setCreatingNote(true)
    // Get current user ID for created_by
    const userObj = localStorage.getItem('user');
    const user = userObj ? JSON.parse(userObj) : null;
    const userId = user?.user_id || null;

    const response = await createNoteApi({
      candidate_id: candidateId,
      notesText,
      created_by: userId, // Add created_by to send socket notification
    })
    console.log("search response: ", response)
    setSuccess(response)
    showCAlert('Note created successfully', 'success', 1500)

    setError('')

    // Dispatch event to notify Notes component to refresh
    window.dispatchEvent(new Event('noteCreated'))

    setTimeout(() => {
      setSuccess(false)
      setNotesModalVisible(false)
    }, 1000)
    setCreatingNote(false)

  } catch (error) {
    console.error(error)
    setError('Failed to create note. Please try again.')
    showCAlert('creating failed. Try Again.', 'danger', 1500)
  } finally {
    setCreatingNote(false)
  }

}
/**
 * 🔹 Save a new search query
 */
export const handleSaveSearch = async ({
  userId,
  searchQuery,
  filters,
  selectedFrequency,
  setSavingSearch,
  setSuccess,
  setError,
  showCAlert,
  setStarred,
  setShowFrequencyModal,
}) => {
  if (!userId) {
    showCAlert('User not logged in', 'danger')
    return
  }

  if (!searchQuery.trim()) {
    showCAlert('Search query cannot be empty', 'warning')
    return
  }

  try {
    setSavingSearch(true)
    const response = await saveSearchApi({
      userId,
      query: searchQuery,
      filters: filters || [],
      notifyFrequency: selectedFrequency,
    })
    console.log("search response: ", response)

    if (response.success === false && response.existingSearch) {
      // Duplicate search
      showCAlert('This search already exists.', 'warning', 1500)
      setError('Search already exists')
      setSavingSearch(false)
      return
    }

    setSuccess(response)
    showCAlert('Search saved successfully', 'success', 1500)
    setError('')
    setStarred(false)
    setTimeout(() => {
      setSuccess(false)
      setShowFrequencyModal(false)
    }, 1000)
  } catch (error) {
    console.error(error)
    setError('Failed to save search. Please try again.')
  } finally {
    setSavingSearch(false)
  }
}






/**
//  * 🔹 Edit candidate (open edit modal)
//  */
// export const handleEdit = (candidate, setEditingCandidate) => {
//   setEditingCandidate({ ...candidate })
// }




export const handleEdit = (candidate, setEditingCandidate) => {
  setEditingCandidate({ ...candidate });
}



/**
 * 🔹 Save candidate after editing
 */



export const handleSave = async ({
  editingCandidate,
  refreshCandidates,
  showCAlert,
  setEditingCandidate,
  setFilteredCandidates, // <-- pass this from DisplayCandidates
  setLocalCandidates,
  // refreshPage

}) => {
  if (!editingCandidate) return

  try {
    // Update candidate on backend
    await updateCandidateByEmailApi(editingCandidate.email, {
      name: editingCandidate.name || null,
      phone: editingCandidate.phone || null,
      location: editingCandidate.location || null,
      experience_years: editingCandidate.experience_years || null,
      position_applied: editingCandidate.position_applied || null,
      current_last_salary: editingCandidate.current_last_salary || null,
      expected_salary: editingCandidate.expected_salary || null,
      client_name: editingCandidate.client_name || null,
      sourced_by_name: editingCandidate.sourced_by_name || null,
    })

    showCAlert('Candidate updated successfully', 'success')
    refreshCandidates(); // refresh from backend
    // ✅ Update local state instantly
    /*  if (setFilteredCandidates && setLocalCandidates) {
        setFilteredCandidates(prev =>
          prev.map(c =>
            c.candidate_id === editingCandidate.candidate_id
              ? { ...c, ...editingCandidate }
              : c
          )
        )
        setLocalCandidates(prev =>
          prev.map(c =>
            c.candidate_id === editingCandidate.candidate_id
              ? { ...c, ...editingCandidate }
              : c
          )
        )
      }*/
    // refreshPage();

  } catch (err) {
    console.error('Candidate update failed:', err)
    showCAlert('Failed to update candidate', 'danger')
  } finally {
    setEditingCandidate(null)
  }
}





/**
 * 🔹 Delete candidate
 */
export const handleDelete = (candidate, setDeletingCandidate) => {
  setDeletingCandidate(candidate)
}

/**
 * 🔹 Confirm delete candidate
 */
// candidateHandlers.js

export const handleConfirmDelete = async ({
  deletingCandidate,
  setDeletingCandidate,
  showCAlert,
  setFilteredCandidates,
  refreshCandidates, // ✨ ADD THIS ARGUMENT
  setLocalCandidates     // <-- pass this too
}) => {
  if (!deletingCandidate) return

  try {
    await deleteCandidateApi(deletingCandidate.candidate_id)
    showCAlert('Candidate deleted successfully', 'success')

    // 1. Trigger parent to refetch data from the backend
    // if (refreshCandidates) await refreshCandidates(); // refresh from backend

    // 2. Remove deleted candidate locally (for immediate UX)
    setFilteredCandidates(prev =>
      prev.filter(c => c.candidate_id !== deletingCandidate.candidate_id)
    )
    /*  setLocalCandidates(prev =>
       prev.filter(c => c.candidate_id !== deletingCandidate.candidate_id)
     )*/
    refreshCandidates();

  } catch (err) {
    console.error(err)
    showCAlert('Failed to delete candidate', 'danger')
  } finally {
    setDeletingCandidate(null)
  }
}