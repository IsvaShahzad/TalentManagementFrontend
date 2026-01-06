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
import { getCandidateSignedUrl, downloadFile } from "../../../components/candidateUtils";

const ClientCandidates = () => {
    const [candidates, setCandidates] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    const showCAlert = (message, color = "success") => {
        const id = Date.now();
        setAlerts(prev => [...prev, { id, message, color }]);
        setTimeout(() => {
            setAlerts(prev => prev.filter(a => a.id !== id));
        }, 4000);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const user_id = localStorage.getItem("user_id")
                console.log("user id of client", user_id)
                const cands = await getClientCandidates(user_id);
                console.log("fetched clients candidates data", cands.data)
                setCandidates(cands.data);
            } catch (err) {
                console.error(err);
                showCAlert("Failed to load candidates", "danger");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

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

            const signedUrl = await getCandidateSignedUrl(candidate.candidate_id, type);
            downloadFile(signedUrl, `${candidate.name}_${type}.pdf`);
        } catch (err) {
            console.error(err);
            showCAlert("Failed to download CV", "danger");
        }
    };


    return (
        <CContainer style={{ maxWidth: "90vw", marginTop: "1rem" }}>
            <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>
                My Assigned Candidates
            </h3>

            <div style={{ position: "fixed", top: 10, right: 10, zIndex: 9999 }}>
                {alerts.map(a => (
                    <CAlert key={a.id} color={a.color}>
                        {a.message}
                    </CAlert>
                ))}
            </div>

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
