import React from "react";
import { useNavigate } from "react-router-dom";
import { CContainer } from "@coreui/react";
import SavedSearch from "./SavedSearch";
import NotesCard from "../active-jobs/NotesCard";
import { useAuth } from "../../../context/AuthContext";

export default function SavedSearchesAndNotes() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const { role: authRole } = useAuth();
  const showRecruiterFeedback =
    (authRole && String(authRole).toLowerCase() === "recruiter") ||
    (currentUser?.role &&
      String(currentUser.role).toLowerCase() === "recruiter");

  return (
    <CContainer style={{ maxWidth: "95vw", marginTop: "1rem" }}>
      <SavedSearch
        onApplySavedSearch={(s) => {
          navigate("/talent-pool", {
            state: { savedSearchPayload: s },
          });
        }}
      />
      {showRecruiterFeedback && (
        <div style={{ marginTop: "2rem", marginBottom: "2rem" }}>
          <h4
            style={{
              color: "#1f3c88",
              fontWeight: 600,
              marginBottom: "0.35rem",
            }}
          >
            Job feedback
          </h4>
          <p className="text-muted small mb-2">
            Feedback on jobs assigned to you (same as Position Tracker).
          </p>
          <NotesCard refreshKey={0} />
        </div>
      )}
    </CContainer>
  );
}
