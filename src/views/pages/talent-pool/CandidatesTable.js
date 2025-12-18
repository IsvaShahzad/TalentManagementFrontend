// CandidatesTable.js
import React from 'react';
import { CTableBody, CTableRow, CTableDataCell } from '@coreui/react';

const CandidatesTable = ({ candidates, renderFieldOrTag }) => {
  if (!candidates || candidates.length === 0) {
    return (
      <CTableBody>
        <CTableRow>
          <CTableDataCell colSpan="6" className="text-center text-muted">
            No candidates found.
          </CTableDataCell>
        </CTableRow>
      </CTableBody>
    )
  }

  return (
    <CTableBody>
      {candidates.map(c => (
        <CTableRow key={c.email}>
          <CTableDataCell>{c.name || '-'}</CTableDataCell>
          <CTableDataCell>{c.email}</CTableDataCell>
          <CTableDataCell>{c.phone || '-'}</CTableDataCell>
          <CTableDataCell>{c.location || '-'}</CTableDataCell>
          <CTableDataCell>{renderFieldOrTag(c, 'experience_years', 'Add Exp', 'number')}</CTableDataCell>
          <CTableDataCell>{renderFieldOrTag(c, 'position_applied', 'Add Position', 'string')}</CTableDataCell>
        </CTableRow>
      ))}
    </CTableBody>
  );
};

export default CandidatesTable;
