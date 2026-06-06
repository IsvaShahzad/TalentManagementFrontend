import { useState } from "react";
import {
  CButton,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
} from "@coreui/react";
import CVUpload from "../talent-pool/CVUpload";
import { linkCandidateToJob } from "../../../api/api";

const uploadCvsForRecruiter = (files, { role, recruiterId, onProgress }) =>
  new Promise((resolve, reject) => {
    const formData = new FormData();
    for (const file of files) formData.append("files", file);
    formData.append("role", role);
    if (recruiterId) formData.append("recruiterId", recruiterId);

    const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/candidate/bulk-upload-cvs`;
    const xhr = new XMLHttpRequest();
    xhr.open("POST", apiUrl, true);

    const token = localStorage.getItem("authToken");
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch {
          reject(new Error("Could not read upload response."));
        }
      } else {
        let message = "Failed to upload CVs.";
        try {
          const errData = JSON.parse(xhr.responseText || "{}");
          if (errData?.message) message = errData.message;
        } catch {
          /* keep default */
        }
        reject(new Error(message));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during CV upload."));
    xhr.send(formData);
  });

const LinkCandidatesCvModal = ({
  visible,
  onClose,
  jobId,
  jobTitle = "Position",
  linkedCandidateIds = new Set(),
  onLinked,
  showSuccess,
  showError,
}) => {
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleClose = () => {
    if (uploading) return;
    setSelectedFiles(null);
    setUploadProgress(0);
    onClose?.();
  };

  const closeAfterSuccess = () => {
    setSelectedFiles(null);
    setUploadProgress(0);
    onClose?.();
  };

  const handleUpload = async (files) => {
    if (!jobId || !files?.length) {
      showError?.("Please select at least one CV to upload.");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const recruiterId = user?.user_id;
    const role = user?.role || "Recruiter";

    setUploading(true);
    setUploadProgress(0);

    try {
      const data = await uploadCvsForRecruiter(files, {
        role,
        recruiterId,
        onProgress: setUploadProgress,
      });

      const results = Array.isArray(data?.results) ? data.results : [];
      const skipped = results.filter((r) => r.status === "skipped");
      const duplicates = results.filter((r) => r.status === "duplicate");

      const candidateIdsToLink = [];
      for (const r of results) {
        const cid = r.candidate?.candidate_id;
        if (!cid) continue;
        if (
          r.status === "created" ||
          r.status === "linked" ||
          r.status === "duplicate"
        ) {
          if (!linkedCandidateIds.has(String(cid))) {
            candidateIdsToLink.push(cid);
          }
        }
      }

      let linkedCount = 0;
      let alreadyLinkedCount = 0;
      let linkFailedCount = 0;

      for (const cid of candidateIdsToLink) {
        try {
          await linkCandidateToJob(jobId, cid);
          linkedCount++;
        } catch (err) {
          if (err?.response?.status === 409) alreadyLinkedCount++;
          else linkFailedCount++;
        }
      }

      if (linkedCount > 0) {
        showSuccess?.(
          linkedCount === 1
            ? "Candidate added and linked to this position."
            : `${linkedCount} candidates added and linked to this position.`,
        );
        window.dispatchEvent(new Event("refreshNotifications"));
        await onLinked?.();
        closeAfterSuccess();
        return;
      }

      if (alreadyLinkedCount > 0 && linkFailedCount === 0) {
        showSuccess?.("Candidate is already linked to this position.");
        await onLinked?.();
        closeAfterSuccess();
        return;
      }

      if (skipped.length > 0 && duplicates.length === 0) {
        showError?.(
          skipped[0]?.message ||
            "Could not process CV. Ensure the file is a valid PDF with an email address.",
        );
      } else if (duplicates.length > 0) {
        showError?.(
          duplicates[0]?.message ||
            "This candidate is already in your list and linked to this position.",
        );
      } else if (linkFailedCount > 0) {
        showError?.("CV uploaded but failed to link to this position.");
        await onLinked?.();
      } else {
        showError?.(data?.message || "No candidates were added.");
      }
    } catch (err) {
      showError?.(err?.message || "Failed to upload CVs.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <CModal
      visible={visible}
      onClose={handleClose}
      size="lg"
      alignment="center"
      backdrop={uploading ? "static" : true}
    >
      <CModalHeader closeButton={!uploading}>
        <h4 className="modal-title mb-0">
          Add CVs to link — {jobTitle}
        </h4>
      </CModalHeader>
      <CModalBody>
        <p className="text-muted mb-3" style={{ fontSize: "0.9rem" }}>
          Upload one or more CVs. Each candidate will be added to the talent
          pool and linked to this position automatically.
        </p>
        <CVUpload
          onUpload={handleUpload}
          uploading={uploading}
          uploadProgress={uploadProgress}
          selectedFiles={selectedFiles}
          setSelectedFiles={setSelectedFiles}
          compactButton
        />
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" disabled={uploading} onClick={handleClose}>
          Close
        </CButton>
      </CModalFooter>
    </CModal>
  );
};

export default LinkCandidatesCvModal;
