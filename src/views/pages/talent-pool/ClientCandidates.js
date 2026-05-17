import React, { useEffect, useState } from "react";
import {
    CContainer,
    CCard,
    CCardBody,
    CTable,
    CTableHead,
    CTableRow,
    CTableHeaderCell,
    CTableBody,
    CTableDataCell,
    CButton,
    CAlert,
} from "@coreui/react";
import { getClientCandidates } from "../../../api/api";
import { useAuth } from "../../../context/AuthContext";
import { openCandidateResume } from "../../../components/candidateUtils";
import { useAppAlert } from '../../../context/AppAlertContext';

const ClientCandidates = () => {
    const { isAuthenticated, token } = useAuth();
    const { showAlert: showCAlert } = useAppAlert();
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated || !token) {
            setLoading(false);
            return;
        }
        const fetchData = async () => {
            try {
                const res = await getClientCandidates();
                const list = res?.data;
                setCandidates(Array.isArray(list) ? list : []);
            } catch (err) {
                console.error(err);
                showCAlert("Failed to load candidates", "danger");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [isAuthenticated, token]);

    const handleDownload = async (candidate) => {
        try {
            let type = null;

            if (candidate.resume_url_redacted) {
                type = "redacted";
            } else if (candidate.resume_url) {
                type = "original";
            }

            if (!type) {
                showCAlert("No resume available for this candidate", "warning");
                return;
            }

            await openCandidateResume(candidate.candidate_id, type);
        } catch (err) {
            console.error(err);
            showCAlert("Failed to open resume", "danger");
        }
    };


    return (
        <CContainer style={{ maxWidth: "90vw", marginTop: "1rem" }}>
            <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>
                My Assigned Candidates
            </h3>

            <CCard>
                <CCardBody>
                    {loading ? (
                        <p>Loading candidates…</p>
                    ) : (
                        <CTable striped hover responsive>
                            <CTableHead>
                                <CTableRow>
                                    <CTableHeaderCell>Name</CTableHeaderCell>
                                    <CTableHeaderCell>Position</CTableHeaderCell>
                                    <CTableHeaderCell>Experience</CTableHeaderCell>
                                    <CTableHeaderCell>Status</CTableHeaderCell>
                                    <CTableHeaderCell>Resume</CTableHeaderCell>
                                </CTableRow>
                            </CTableHead>

                            <CTableBody>
                                {candidates.length > 0 ? (
                                    candidates.map(c => (
                                        <CTableRow key={c.candidate_id}>
                                            <CTableDataCell>{c.name}</CTableDataCell>
                                            <CTableDataCell>{c.position_applied || "-"}</CTableDataCell>
                                            <CTableDataCell>
                                                {c.experience_years ?? "-"} yrs
                                            </CTableDataCell>
                                            <CTableDataCell>{c.candidate_status}</CTableDataCell>
                                            <CTableDataCell>
                                                {c.resume_url_redacted || c.resume_url ? (
                                                    <CButton
                                                        size="sm"
                                                        color={c.resume_url_redacted ? "success" : "secondary"}
                                                        onClick={() => handleDownload(c)}
                                                    >
                                                        {c.resume_url_redacted
                                                            ? "Download Redacted"
                                                            : "Download Resume"}
                                                    </CButton>
                                                ) : (
                                                    "No Resume"
                                                )}
                                            </CTableDataCell>

                                        </CTableRow>
                                    ))
                                ) : (
                                    <CTableRow>
                                        <CTableDataCell colSpan="5" className="text-center">
                                            No candidates assigned to you.
                                        </CTableDataCell>
                                    </CTableRow>
                                )}
                            </CTableBody>
                        </CTable>
                    )}
                </CCardBody>
            </CCard>
        </CContainer>
    );
};

export default ClientCandidates;
