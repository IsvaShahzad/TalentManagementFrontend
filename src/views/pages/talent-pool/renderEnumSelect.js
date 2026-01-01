const renderEnumSelect = (candidate, fieldKey, label) => {
    const backendFieldMap = {
        candidate_status: 'candidate_status',
        placement_status: 'placement_status',
    };

    const backendField = backendFieldMap[fieldKey];
    const value = candidate[backendField] || '';

    const options = STATUS_OPTIONS[fieldKey] || [];

    return (
        <select
            value={value}
            style={{
                fontSize: '0.7rem',
                padding: '2px 6px',
                borderRadius: '12px',
                border: '1px solid #d1d5db',
                background: '#e3efff',
                color: '#326396',
                cursor: 'pointer',
            }}
            onChange={async (e) => {
                const newValue = e.target.value;

                try {
                    if (candidate.email) {
                        await updateCandidateByEmailApi(candidate.email, {
                            [backendField]: newValue,
                        });
                    }

                    // ✅ instant UI update
                    setLocalCandidates(prev =>
                        prev.map(item =>
                            item.candidate_id === candidate.candidate_id
                                ? { ...item, [backendField]: newValue }
                                : item
                        )
                    );

                    setFilteredCandidates(prev =>
                        prev.map(item =>
                            item.candidate_id === candidate.candidate_id
                                ? { ...item, [backendField]: newValue }
                                : item
                        )
                    );

                    showCAlert(`${label} updated`, 'success');
                } catch (err) {
                    console.error(err);
                    showCAlert('Failed to update status', 'danger');
                }
            }}
        >
            <option value="">{label}</option>
            {options.map(opt => (
                <option key={opt} value={opt}>
                    {opt}
                </option>
            ))}
        </select>
    );
};
