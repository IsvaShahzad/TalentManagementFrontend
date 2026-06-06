import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilSearch,
  cilSpreadsheet,
  cilCloudUpload,
  cilFile,
  cilCloudDownload,
  cilFilter
} from '@coreui/icons'
import {
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CDropdownDivider,
} from "@coreui/react";
import { downloadCandidateExcelTemplateApi, exportCandidatesCSVApi } from '../api/api'

const downloadExcelTemplate = async (showAlert) => {
  try {
    await downloadCandidateExcelTemplateApi()
  } catch (err) {
    console.error("FULL ERROR:", err)
    console.error("RESPONSE:", err.response)
    console.error("DATA:", err.response?.data)
    console.error("STATUS:", err.response?.status)

    showAlert?.(
      err.response?.data?.message ||
      err.message ||
      'Download failed',
      'danger',
    )
  }
}

const SearchBarWithIcons = ({
  searchQuery,
  setSearchQuery,
  starred,
  setStarred,
  setShowFrequencyModal,
  setShowXlsModal,
  setShowCvModal,
  uploadingExcel,
  uploadingCV,
  uploadProgress,
  showAlert,
  /** When set, CSV export uses this (e.g. filtered rows). Otherwise server exports all. */
  onExportCsv,
  setShowFilters,
}) => {
  const handleExportCsv = async () => {
    if (typeof onExportCsv === 'function') {
      try {
        await onExportCsv()
      } catch (err) {
        console.error("CSV export error:", err)
        showAlert?.(
          err.response?.data?.message ||
          err.message ||
          "CSV export failed",
          "danger"
        )
      }
      return
    }
    try {
      await exportCandidatesCSVApi()
    } catch (err) {
      console.error("CSV download error:", err)

      showAlert?.(
        err.response?.data?.message ||
        err.message ||
        "CSV export failed",
        "danger"
      )
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        marginBottom: '10px',
      }}
    >

      {/* LEFT (empty for spacing / future use) */}
      <div style={{ flex: 1 }} />

      {/* CENTER (SEARCH + UPLOAD) */}
      <div
        style={{
          flex: 2,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <CIcon
          icon={cilFilter}
          title="Filters"
          onClick={() => setShowFilters?.((prev) => !prev)}
          style={{
            cursor: "pointer",
            color: "#326396",
            fontSize: "18px",
          }}
        />
        {/* SEARCH BOX */}
        {/* <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '0.5rem',
            padding: '0.3rem 0.6rem',
            width: '400px',
            gap: '0.3rem',
            fontSize: '0.75rem',
          }}
        >
          <CIcon icon={cilSearch} style={{ color: '#326396', fontSize: '16px' }} />

          <input
            type="text"
            placeholder="Search by name, email, position, or experience..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              flex: 1,
              fontSize: '0.75rem',
            }}
          />

          <span
            onClick={() => {
              setStarred(!starred)
              setShowFrequencyModal(true)
            }}
            style={{
              cursor: 'pointer',
              color: starred ? '#fbbf24' : '#9ca3af',
              fontSize: '16px',
              userSelect: 'none',
            }}
          >
            {starred ? '★' : '☆'}
          </span>
        </div> */}

        {/* Template + XLS + CV (template first) */}
        {/* <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <CIcon
            icon={cilFile}
            style={{ cursor: 'pointer', color: '#217346', fontSize: '20px' }}
            onClick={() => downloadExcelTemplate(showAlert)}
            title="Download Excel template"
          />
          <CIcon
            icon={cilSpreadsheet}
            style={{ cursor: 'pointer', color: '#326396', fontSize: '20px' }}
            onClick={() => setShowXlsModal(true)}
            title="Upload Excel"
          />

          <CIcon
            icon={cilCloudUpload}
            style={{ cursor: 'pointer', color: '#326396', fontSize: '20px' }}
            onClick={() => setShowCvModal(true)}
            title="Upload CVs"
          />
        </div> */}
        <div
          style={{
            flex: 2,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          {/* SEARCH BOX */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "0.5rem",
              padding: "0.3rem 0.6rem",
              width: "400px",
              gap: "0.3rem",
              fontSize: "0.75rem",
            }}
          >
            <CIcon icon={cilSearch} style={{ color: "#326396", fontSize: "16px" }} />

            <input
              type="text"
              placeholder="Search by name, email, position, or experience..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                flex: 1,
                fontSize: "0.75rem",
              }}
            />

            <span
              onClick={() => {
                setStarred(!starred);
                setShowFrequencyModal(true);
              }}
              style={{
                cursor: "pointer",
                color: starred ? "#fbbf24" : "#9ca3af",
                fontSize: "16px",
                userSelect: "none",
              }}
            >
              {starred ? "★" : "☆"}
            </span>
          </div>

          {/* + ACTION DROPDOWN */}
          <CDropdown alignment="end">
            <CDropdownToggle
              color="primary"
              caret={false}
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "6px",

                paddingLeft: 100,
                paddingRight: 100,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.3rem",
                fontWeight: 600,
              }}
            >
              +
            </CDropdownToggle>

            <CDropdownMenu>
              <CDropdownItem onClick={() => downloadExcelTemplate(showAlert)}>
                Download Template
              </CDropdownItem>

              <CDropdownDivider />

              <CDropdownItem onClick={() => setShowXlsModal(true)}>
                Upload CSV/XLSX
              </CDropdownItem>

              <CDropdownItem onClick={() => setShowCvModal(true)}>
                Upload CVs
              </CDropdownItem>
            </CDropdownMenu>
          </CDropdown>
        </div>
      </div>

      {/* RIGHT — CSV export when not using parent export handler */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        {typeof onExportCsv !== 'function' && (
          <CIcon
            icon={cilCloudDownload}
            style={{ cursor: 'pointer', color: '#2b6cb0', fontSize: '20px' }}
            onClick={handleExportCsv}
            title="Export CSV"
          />
        )}
      </div>

    </div>
  )
}

export default SearchBarWithIcons
