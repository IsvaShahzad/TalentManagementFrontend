import { getAllCandidates } from '../../../api/api'

const fetchCandidates = async () => {
    try {
        const response = await getAllCandidates()
        if (response && response.length > 0) {
            return response.map(c => ({
                id: c.candidate_id,
                name: c.name,
                email: c.email,
                phone: c.phone,
                location: c.location,
                experience: c.experience_years,
                position: c.position_applied || '',
                current_last_salary: c.current_last_salary || null,
                expected_salary: c.expected_salary || null,
                client_name: c.client_name || null,
                sourced_by_name: c.sourced_by_name || '',
                candidate_status: c.candidate_status || '', 
                placement_status: c.placement_status || '',
                date: new Date(c.createdAt).toLocaleString(),
                resume_url: c.resume_url || null,
                resume_url_redacted: c.resume_url_redacted || null
            }))
        } else {
            return []
        }
    } catch (err) {
        console.error('Failed to fetch candidates:', err)
    }
}

export default fetchCandidates
