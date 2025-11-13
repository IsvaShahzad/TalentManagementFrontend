import { saveSearchApi, updateCandidateByEmailApi, deleteCandidateApi } from '../api/api'

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

      setSuccess(response)
      showCAlert('Search saved successfully', 'success', 5000)
      setError('')
      setTimeout(() => {
        setSuccess(false)
        setShowFrequencyModal(false)
      }, 1000)
    } catch (error) {
      console.error(error)
      setError('Failed to save search. Please try again.')
      showCAlert('Saving failed. Try Again.', 'danger', 6000)
    } finally {
      setSavingSearch(false)
    }
  }

/**
 * 🔹 Edit candidate (open edit modal)
 */
export const handleEdit = (candidate, setEditingCandidate) => {
  setEditingCandidate({ ...candidate })
}

/**
 * 🔹 Save candidate after editing
 */



export const handleSave = async ({
  editingCandidate,
  refreshCandidates,
  showCAlert,
  setEditingCandidate,
}) => {
  if (!editingCandidate) return

  try {
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
    refreshCandidates()
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
}) => {
  if (!deletingCandidate) return
  
  try {
    await deleteCandidateApi(deletingCandidate.candidate_id)
    showCAlert('Candidate deleted successfully', 'success')
    
    // 1. Trigger parent to refetch data from the backend
    if (refreshCandidates) {
        refreshCandidates() // ✨ CALL THIS
    }

    // 2. Remove deleted candidate locally (for immediate UX)
    setFilteredCandidates(prev =>
      prev.filter(c => c.candidate_id !== deletingCandidate.candidate_id)
    )
  } catch (err) {
    console.error(err)
    showCAlert('Failed to delete candidate', 'danger')
  } finally {
    setDeletingCandidate(null)
  }
}
