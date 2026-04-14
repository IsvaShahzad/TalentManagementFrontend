import axios from "axios";

//const API_URL = "https://tms1.vps.webdock.cloud/api";

const isLocal =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

const API_URL = isLocal
  ? import.meta.env.VITE_API_BASE_URL_LOCAL
  : import.meta.env.VITE_API_BASE_URL;


export const api = axios.create({
  baseURL: API_URL,
});

// 🔒 Add JWT token to all requests automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 🔒 Handle 401/403 responses (token expired or invalid)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token expired or invalid - could redirect to login
      console.warn("Authentication error:", error.response?.data?.message);
      // Optionally: clear token and redirect
      // localStorage.removeItem('authToken');
      // window.location.href = '/#/login';
    }
    return Promise.reject(error);
  },
);

// Fetch user by email
export const fetchUserByEmail = async (email) => {
  try {
    const response = await api.post(`/user/fetchUser`, { email });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) return null;
    throw error;
  }
};

// Validate password for a given email
export const validatePassword = async (email, password) => {
  try {
    const response = await api.post(`/user/fetchPasswd`, { email, password });
    return response.data; // e.g., { valid: true } or user object
  } catch (error) {
    if (error.response && error.response.status === 401) return false;
    throw error;
  }
};

// ✅ Forgot password
export const sendForgotPassword = async (email) => {
  try {
    const response = await api.post(`/user/forgot-password`, { email });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const resetUserPassword = async (email, password) => {
  try {
    const response = await api.post(`/user/reset-password`, {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create new user
export const createUserApi = async (userData) => {
  try {
    //   console.log("user data", userData)
    const response = await api.post("/user/register", userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Server error" };
  }
};

// Fetch all users
// Corrected function
export const getAllUsersApi = async () => {
  try {
    // 1. Removed the 'userData' variable from the .get() call
    const response = await api.get("/user/getAll");
    console.log("getting all users");
    // 2. Return 'response.data' instead of 'res.data'
    // console.log("response", response.data);
    return response.data; // This should be { message, count, users }
  } catch (err) {
    console.error("Error fetching users:", err);
    throw err;
  }
};

//Get recruiters
export const getUsersByRoleApi = async (role) => {
  const res = await api.post("/user/getUsersByRole", { role });
  return res.data;
};

// Update user: `currentEmail` = user being edited (lookup key). Body may include new `email` and optional `password` / `password_hash`.
export const updateUserApi = async (currentEmail, userData) => {
  try {
    const payload = {
      ...userData,
      currentEmail: String(currentEmail ?? "").trim(),
    };
    if (payload.email != null) {
      payload.email = String(payload.email).trim();
    }
    const pw =
      payload.password != null && String(payload.password).trim() !== ""
        ? String(payload.password).trim()
        : payload.password_hash != null && String(payload.password_hash).trim() !== ""
          ? String(payload.password_hash).trim()
          : null;
    delete payload.password;
    delete payload.password_hash;
    if (pw) {
      payload.password = pw;
    }
    const response = await api.put(`/user/userUpdateByEmail`, payload);
    return response.data;
  } catch (error) {
    console.error("Error updating user:", error.response?.data || error);
    throw error;
  }
};

// /** Bulk candidate Excel template (auth: Admin/Recruiter). Streams from R2 if CANDIDATE_EXCEL_TEMPLATE_KEY is set on server. */
// export const downloadCandidateExcelTemplateApi = async () => {
//   const response = await api.get("/candidate/excel-template", {
//     responseType: "blob",
//   });
//   const blob = new Blob([response.data], {
//     type:
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//   });
//   const url = URL.createObjectURL(blob);
//   const a = document.createElement("a");
//   a.href = url;
//   a.download = "candidate-bulk-upload-template.xlsx";
//   document.body.appendChild(a);
//   a.click();
//   a.remove();
//   URL.revokeObjectURL(url);
// };

// export const downloadCandidateExcelTemplateApi = async () => {
//   // const response = await api.get('/candidate/excel-template')

//   // const url = response.data.url

//   // // 🔥 Trigger direct download
//   // const link = document.createElement('a')
//   // link.href = url
//   // link.setAttribute('download', 'candidate-template.xlsx')
//   // document.body.appendChild(link)
//   // link.click()
//   // link.remove()

//   const res = await api.get('/candidate/excel-template')

//   console.log("API RESPONSE:", res.data)

//   window.open(res.data.url, '_blank')

// }

export const downloadCandidateExcelTemplateApi = async () => {
  try {
    console.log("Calling API...");

    const response = await api.get("/candidate/excel-template");

    console.log("API RESPONSE:", response);
    console.log("DATA:", response.data);

    const url = response.data.url;

    if (!url) {
      throw new Error("No URL returned from backend");
    }

    console.log("Opening signed URL:", url);

    // simplest and most reliable
    window.open(url, '_blank');

  } catch (err) {
    console.error("FRONTEND ERROR:", err);
    console.error("RESPONSE:", err.response);
    console.error("DATA:", err.response?.data);
    console.error("STATUS:", err.response?.status);

    throw err;
  }
};

/*
export const downloadCandidateExcelTemplateApi = async () => {
  const response = await axios.get(
    'http://localhost:7000/api/candidate/excel-template',
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }
  )

  const url = response.data.url

  if (!url) throw new Error('No signed URL received')

  window.open(url, '_blank')
}*/

export const exportCandidatesCSVApi = async () => {
  const response = await api.get("/candidate/export-csv", {
    responseType: "blob",
  });

  console.log(" CSV response received");

  const url = window.URL.createObjectURL(new Blob([response.data]));

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "candidates.csv");

  document.body.appendChild(link);
  link.click();
  link.remove();
};


// Delete user by email
export const deleteUserByEmailApi = async (email) => {
  try {
    const response = await api.delete("/user/userDeleteByEmail", {
      data: { email },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting user:", error.response?.data || error);
    throw error;
  }
};

// Fetch all login activities
export const fetchLoginActivitiesApi = async () => {
  try {
    const response = await api.get("/user/login/all"); // GET login events
    return response.data; // array of login activities
  } catch (error) {
    console.error("Error fetching login activities:", error);
    return [];
  }
};

// Fetch comprehensive activity log
export const fetchActivityLogApi = async () => {
  try {
    const response = await api.get("/user/activity-log");
    return response.data;
  } catch (error) {
    console.error("Error fetching activity log:", error);
    return { success: false, activities: [] };
  }
};

// Dashboard stats (served from candidateController routes)
export const getUsersCountApi = async () => {
  const res = await api.get("/candidate/getUsersCount");
  return res.data;
};

export const getRecruitersCountApi = async () => {
  const res = await api.get("/candidate/getRecCount");
  return res.data;
};

export const fetchCandidateStatusHistoryApi = async () => {
  const res = await api.get("/candidate/candidateStatusHistory");
  return res.data;
};

export const getJobPipelineApi = async () => {
  const res = await api.get("/job/getJobPipeline");
  return res.data;
};

// Fetch all logout activities (optional)
export const fetchLogoutActivitiesApi = async () => {
  try {
    const response = await fetch(`${API_URL}/user/logout/all`);
    if (!response.ok) {
      console.error("Logout API error:", response.status, response.statusText);
      return [];
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Error fetching logout activities:", err);
    return [];
  }
};

// Login POST API (after user clicks login button)
export const loginPostApi = async (email, password) => {
  try {
    const response = await api.post("/user/loginPost", { email, password });
    return response.data; // { message, user }
  } catch (error) {
    // Return null if user not found or invalid password
    if (
      error.response &&
      (error.response.status === 404 || error.response.status === 401)
    )
      return null;
    throw error;
  }
};

// Create new candidate
export const createCandidate = async (candData) => {
  try {
    // Check if candData is FormData or plain object
    const isFormData = candData instanceof FormData;
    console.log("check if form data", isFormData);

    //true until here but not sending to backend???

    const response = await api.post("/candidate/createCandidate", candData, {
      headers: isFormData ? {} : { "Content-Type": "application/json" },
    });

    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Server error" };
  }
};

export const getAllCandidates = async () => {
  try {
    const response = await api.get("/candidate/getAllCandidates");
    console.log("API response:", response.data); // <--- add this
    return response.data;
  } catch (err) {
    console.error("Error fetching candidates:", err);
    throw err;
  }
};

//DELETE CANDIDATE

export const deleteCandidateApi = async (candidate_id) => {
  try {
    console.log("sending candidate data to be deleted", candidate_id);
    const response = await api.delete("/candidate/deleteCandidateByID", {
      data: { candidate_id },
    });

    return response.data;
  } catch (error) {
    console.error("Error deleting candidate:", error.response?.data || error);
    throw error;
  }
};

//DELETE CANDIDATE BY EMAIL

export const deleteCandidateByEmailApi = async (email) => {
  try {
    console.log("Sending email to delete:", email);
    const response = await api.delete("/candidate/deleteCandidateByEmail", {
      data: { email },
    });
    return response.data;
  } catch (err) {
    console.error("Failed to delete candidate:", err.response?.data || err);
    throw err;
  }
};

//UPDATE CANDIDATE

export const updateCandidateApi = async (candidate_id, data) => {
  try {
    console.log("sending candidate data to be upated", candidate_id, data);

    const payload = { ...data, candidate_id };
    console.log("sending payload to be upated", candidate_id, payload);
    const response = await api.put("/candidate/candidateUpdate", payload);
    return response.data;
  } catch (error) {
    console.error(
      "Error updating candidate FE:",
      error.response?.data || error,
    );
    throw error;
  }
};

export const bulkUpload = async (formData) => {
  try {
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }
    const response = await api.post("/candidate/bulk-upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("getting back response", response);
    return response.data;
  } catch (error) {
    console.error("Error uploading file FE:", error.response?.data || error);
    throw error;
  }
};

export const getCandidateStatusHistoryApi = async () => {
  try {
    console.log("getting candidate history from BE");
    const response = await api.get("/candidate/candidateStatusHistory");
    return response.data;
  } catch (error) {
    console.error("Error fetching candidate status history:", error);
    throw error;
  }
};

//UPDATE CANDIDATES BY EMAIL

export const updateCandidateByEmailApi = async (email, data) => {
  try {
    console.log("data", data);
    const payload = { ...data, email }; // include email to identify candidate

    console.log("payload", payload);
    const response = await api.put(
      "/candidate/candidateUpdateByEmail",
      payload,
    );
    console.log("response", response);
    return response.data;
  } catch (error) {
    console.error(
      "Error updating candidate by email FE:",
      error.response?.data || error,
    );
    throw error;
  }
};

// ==============================
// BULK UPLOAD CANDIDATE CVS
// ==============================
export const bulkUploadCandidateCVs = async (formData) => {
  return api.post("/candidate/bulk-upload-cvs", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const saveSearchApi = async (data) => {
  try {
    //console.log("data to be sent", data);
    const response = await api.post("/candidate/saved-search", data);
    //console.log("saving search");
    //console.log("data received", response);
    return response.data;
  } catch (err) {
    console.error("Error posting searches:", err);
    throw err;
  }
};

export const getUserID = async () => { };
export const getAllSearches = async (userId) => {
  try {
    //console.log("incoming user id for searches", userId);
    const response = await api.get(`/candidate/getAllSearches/${userId}`);
    // console.log("getting all searches for present user");
    //console.log(response.data);
    return response.data;
  } catch (err) {
    console.error("Error fetching searches API", err);
    throw err;
  }
};

export const deleteSearchApi = async (id) => {
  try {
    console.log("deleting search:", id);
    const response = await api.delete("/candidate/deleteSearch", {
      data: { savedsearch_id: id },
    });
    return response.data;
  } catch (err) {
    console.error("Failed to delete search:", err.response?.data || err);
    throw err;
  }
};

export const updateSearchApi = async (id, data) => {
  try {
    // console.log("sending search data to be updated", id, data)

    const payload = { ...data, id };
    //console.log("sending payload to be upated", id, payload)
    const response = await api.put("/candidate/searchUpdate", payload);
    return response.data;
  } catch (error) {
    console.error("Error updating search FE:", error.response?.data || error);
    throw error;
  }
};

export const fetchNotificationsCount = async (userId) => {
  try {
    //console.log("fetching notifications count for", userId)
    const res = await api.get(`/candidate/notifications-count/${userId}`);
    // console.log("getting notification count", res.data)
    return res.data.count;
  } catch (err) {
    console.error("Error fetching count:", err);
    throw err;
  }
};

export const markAllNotificationsAsRead = async (userId) => {
  try {
    //console.log("marking notifications for", userId)
    const res = await api.post(`/candidate/mark-read/${userId}`);
    //  console.log("after marking everything as read", res)
    return res.data;
  } catch (err) {
    console.error("Error fetching count:", err);
    throw err;
  }
};

export const getAllNotifications = async (userId) => {
  try {
    console.log("getting notifications for", userId);
    const response = await api.get(`/candidate/getAllNotifications/${userId}`);
    //   console.log("getting all notifications", response);
    // console.log("response", response.data);
    return response.data;
  } catch (err) {
    console.error("Error fetching notifications:", err);
    throw err;
  }
};

export const getAllNotificationsWithReadNull = async (userId) => {
  try {
    // console.log("getting unread notifications for", userId)
    const response = await api.get(
      `/candidate/getAllUnreadNotifications/${userId}`,
    );
    //console.log("getting all notifications", response);
    // console.log("response", response.data);
    return response.data;
  } catch (err) {
    console.error("Error fetching unread notifications:", err);
    throw err;
  }
};

export const deleteNotificationApi = async (id) => {
  try {
    console.log("deleting notification", id);
    const response = await api.delete(`/candidate/deleteNotification/${id}`);

    return response.data;
  } catch (err) {
    console.error("Error deleting notifications:", err);
    throw err;
  }
};

export const deleteAllNotifications = async () => {
  try {
    console.log("deleting all notification");
    const response = await api.delete(`/candidate/deleteAllNotifications`);

    return response.data;
  } catch (err) {
    console.error("Error deleting notifications:", err);
    throw err;
  }
};

//SIGNED CV API

export const getCandidateSignedUrl = async (candidateId, type) => {
  const res = await fetch(
    `${API_URL}/candidate/signed-url/${candidateId}/${type}`,
  );
  if (!res.ok) throw new Error("Failed to fetch signed URL");
  const data = await res.json();
  return data.signedUrl;
};

// uploadXlsCandidateCV

export const uploadXlsCandidateCV = async (candidate_id, file) => {
  try {
    const formData = new FormData();
    formData.append("candidate_id", candidate_id);
    formData.append("file", file);

    const response = await fetch(`${API_URL}/candidate/upload-xls-cv`, {
      method: "POST",
      body: formData,
    });

    return await response.json();
  } catch (err) {
    console.error("Error uploading XLS CV:", err);
    throw err;
  }
};

// 🔹 Create a new note
export const createNoteApi = async (data) => {
  try {
    console.log("Creating note:", data);
    const response = await api.post("/candidate/note", data);
    console.log("Note created:", response.data);
    return response.data;
  } catch (err) {
    console.error("Error creating note:", err);
    throw err;
  }
};

export const update_Note = async (id, data) => {
  try {
    //console.log("notes update data to be sent", id, data)
    const response = await api.put(`/candidate/update-note/${id}`, data);
    //console.log("notes response received after update", response)
    return response.data;
  } catch (err) {
    console.error("Error updating notes:", err);
    throw err;
  }
};

export const get_reminders = async (id) => {
  try {
    const response = await api.get(`/get-reminders/${id}`);
  } catch (error) { }
};

export const getNotesByPageApi = async (page = 1, pageSize = 6, userId) => {
  try {
    // Include userId in query if available
    const url = userId
      ? `${API_URL}/candidate/paginated?page=${page}&pageSize=${pageSize}&userId=${userId}`
      : `${API_URL}/candidate/paginated?page=${page}&pageSize=${pageSize}`;

    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching paginated notes:", error);
    throw error;
  }
};

export const getAll_Notes = async () => {
  try {
    console.log("getting notes from backend in api");
    const response = await api.get("/candidate/getAllNotes");
    console.log("notes response in api", response.data);
    return response.data;
  } catch (err) {
    console.error("Error fetching notes:", err);
    throw err;
  }
};
export const getAll_Rems = async () => {
  try {
    console.log("getting reminders from backend in api");
    const response = await api.get("/candidate/getAllRems");
    console.log("reminders response in api", response.data);
    return response.data;
  } catch (err) {
    console.error("Error fetching notes:", err);
    throw err;
  }
};

export const delete_Note = async (id) => {
  try {
    console.log("deleting node with id", id);
    const response = await api.delete(`/candidate/delete-note/${id}`);

    return response.data;
  } catch (err) {
    console.error("Error deleting note:", err);
    throw err;
  }
};

export const delete_reminder = async (id) => {
  try {
    console.log("deleting reminder with id", id);
    const response = await api.delete(`/candidate/delete-reminder/${id}`);
    return response.data;
  } catch (err) {
    console.error("Error deleting reminder:", err);
    throw err;
  }
};

export const markReminderAsDone = async (id) => {
  try {
    console.log("marking reminder as done with id", id);
    const response = await api.patch(`/candidate/mark-reminder-done/${id}`);
    return response.data;
  } catch (err) {
    console.error("Error marking reminder as done:", err);
    throw err;
  }
};

export const addReminderApi = async (data) => {
  try {
    console.log("Creating reminder:", data);
    const response = await api.post("/candidate/addReminder", data);
    console.log("reminder created:", response.data);
    return response.data;
  } catch (err) {
    console.error("Error creating reminder:", err);
    throw err;
  }
};

export const total_Users = async () => {
  try {
    console.log("getting total users");
    const response = await api.get("/candidate/getUsersCount");
    console.log("total users response in api", response.data);
    return response.data.count;
  } catch (err) {
    console.error("Error fetching users:", err);
    throw err;
  }
};

export const total_Recruiters = async () => {
  try {
    console.log("getting total recruiters");
    const response = await api.get("/candidate/getRecCount");
    console.log("total recruiters response in api", response.data);
    return response.data.count;
  } catch (err) {
    console.error("Error fetching recruiters:", err);
    throw err;
  }
};
export const total_Candidates = async () => {
  try {
    console.log("getting total candidates");
    const response = await api.get("/candidate/getCandCount");
    console.log("total candidates response in api", response.data);
    return response.data.count;
  } catch (err) {
    console.error("Error fetching cands:", err);
    throw err;
  }
};
export const total_Jobs = async () => {
  try {
    console.log("getting total jobs");
    const response = await api.get("/job/getJobCount");
    console.log("total jobs response in api", response.data);
    return response.data.count;
  } catch (err) {
    console.error("Error fetching jobs:", err);
    throw err;
  }
};

export const CreateJobApi = async (jobData) => {
  try {
    // jobData is FormData (multipart/form-data)
    // Log FormData contents for debugging
    console.log("job details in api file:");
    for (let [key, value] of jobData.entries()) {
      console.log(`${key}:`, value);
    }
    const response = await api.post("/job/createJob", jobData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Server error" };
  }
};

export const getAllJobs = async () => {
  try {
    console.log("getting jobs from backend in api");
    const response = await api.get("/job/getAllJobs");
    console.log("jobs response in api", response.data);
    return response.data;
  } catch (err) {
    console.error("Error fetching jobs:", err);
    throw err;
  }
};
export const getAllJobsMetrics = async () => {
  try {
    console.log("Fetching jobs from backend...");
    const response = await api.get("/job/getAllJobsWithMetrics"); // new endpoint
    console.log("Jobs response:", response.data);
    return response.data; // { jobs: [...], metrics: { assigned, open, closed, totalJobs } }
  } catch (err) {
    console.error("Error fetching jobs:", err);
    throw err;
  }
};

export const updateJob = async (jobData) => {
  try {
    console.log("updated job details in api file:");
    // for (let [key, value] of jobData.entries()) {
    //   console.log(`${key}:`, value);
    // }
    // const response = await axios.put(`http://localhost:7000/api/job/jobUpdate`, jobData, {
    //   headers: {
    //     'Content-Type': 'multipart/form-data',
    //   },
    // });

    console.log("Updated job details in API file:", jobData);

    const response = await api.put("/job/jobUpdate", jobData, {
      headers: { "Content-Type": "multipart/form-data" }, // only if jobData has files
    });
    console.log("response for job update", response);
    return response.data;
  } catch (error) {
    console.error("Error updating user:", error.response?.data || error);
    throw error;
  }
};

export const deleteJob = async (id) => {
  try {
    console.log("deleting job with id", id);
    const response = await api.delete(`/job/delete-job/${id}`);
    return response.data;
  } catch (err) {
    console.error("Error deleting reminder:", err);
    throw err;
  }
};

export const getJDSignedUrl = async (id) => {
  try {
    const response = await api.get(`/job/signed-url/${id}`);
    return response.data;
  } catch (err) {
    console.error("Error getting signed url:", err);
    throw err;
  }
};

export const getRecruiters = async () => {
  try {
    const res = await api.get("/user/getRecruiters");
    console.log("recruiters:", res.data);
    return res.data;
  } catch (err) {
    console.error("Failed to fetch recruiters", err);
  }
};

// Fetch all jobs assigned to a recruiter
export const getAssignedJobs = async () => {
  try {
    const res = await api.get("/job/assigned");
    return res.data;
  } catch (err) {
    console.error("Failed to fetch assigned jobs:", err);
    return [];
  }
};

// Get linked candidates for a job
export const getLinkedCandidates = (jobId) =>
  api.get(`/job/${jobId}/candidates`);

// Link a candidate to a job
export const linkCandidateToJob = (jobId, candidateId) =>
  api.post(`/job/${jobId}/candidates`, { candidate_id: candidateId });

// Unlink a candidate from a job
export const unlinkCandidateFromJob = (jobId, candidateId) =>
  api.delete(`/job/${jobId}/candidates/${candidateId}`);

export const getAllJobsWithCandidates = async () => {
  return api.get("/job/candidates/with-jobs"); // <--- add 'job' prefix
};

export const updateJobStatus = async (jobId, data) => {
  try {
    console.log("incoming data:", jobId, data);
    const response = await api.patch(`/job/${jobId}/status`, data);
    console.log("response from backend:", response);
    return response.data;
  } catch (error) {
    console.error("Failed to update jobs status:", error);
    // Re-throw the error so the caller can handle it
    throw error;
  }
};

export const updateCandidateStatus = async (candId, data) => {
  try {
    console.log("incoming cand status data:", candId, data);
    const response = await api.patch(`/candidate/${candId}/status`, data);
    console.log("response from backend:", response);
    return response.data;
  } catch (error) {
    console.error("Failed to update cand status:", error);
  }
};

// export const generateRedactedResume = async (candidateId) => {
//   try {
//     console.log("receiving data for redacted resume :candidate id", candidateId)
//     const response = await api.post(`/candidate/${candidateId}/redact`);
//     return response.data; // { redactedUrl: '...' }
//   } catch (err) {
//     console.error('Failed to generate redacted resume', err);
//     throw err;
//   }
// };
// In your api.js file
export const generateRedactedResume = async (candidateId) => {
  try {
    console.log(
      "🚀 Starting generateRedactedResume for candidate:",
      candidateId,
    );

    // Using axios (api instance)
    const response = await api.post(`/candidate/${candidateId}/redact`);

    console.log("✅ Response received:", response.data);

    // Axios automatically parses JSON, so we access response.data
    return {
      redactedUrl: response.data.redactedUrl,
      permanentRedactedUrl: response.data.permanentUrl,
      candidate: response.data.candidate,
    };
  } catch (error) {
    console.error("❌ Error in generateRedactedResume:", error);

    // Handle axios error response
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error("❌ Server responded with error:", error.response.status);
      console.error("❌ Error data:", error.response.data);
      throw new Error(
        error.response.data.message || "Failed to generate redacted resume",
      );
    } else if (error.request) {
      // The request was made but no response was received
      console.error("❌ No response received:", error.request);
      throw new Error("No response from server");
    } else {
      // Something happened in setting up the request
      console.error("❌ Request setup error:", error.message);
      throw error;
    }
  }
};

// Get signed URL for original resume (you might already have this)
export const getOriginalResumeUrl = async (candidateId) => {
  try {
    const response = await api.get(
      `/candidate/signed-url/${candidateId}/original`,
    );
    // API should return { signedUrl: '...', originalName: 'MyResume.pdf' }
    return response.data;
  } catch (err) {
    console.error("Failed to get original resume URL", err);
    throw err;
  }
};

export const getRedactedResumeSignedUrl = async (candidateId) => {
  const res = await api.get(`/candidate/${candidateId}/redacted-signed-url`);
  return res.data; // { signedUrl }
};

export const getAllClients = () => api.get("/candidate/clients");

// Candidates
export const assignClientToCandidate = (candidateId, clientId) =>
  api.patch(`/candidate/${candidateId}/assign-client`, { clientId });

/** Client-only: candidates linked to this user's jobs (JWT). */
export const getClientCandidates = () =>
  api.get("/candidate/client/my-candidates");

// ===========================
// Job-related client assignment
// ===========================
// api.js
export const assignClientToJob = ({ jobId, clientId }) => {
  return axios.put(`${API_URL}/job/assign-client`, {
    jobId,
    clientId,
  });
};

// api/api.js

// Change this:
export const getClientJobs = async () => {
  const response = await api.get("/job/client-jobs");
  return response.data;
};

export const addJobNoteApi = async (payload) => {
  const response = await api.post("/job/createJobNote", payload);
  const data = response.data;
  if (data && data.success === false) {
    const err = new Error(data.message || "Failed to add job note");
    err.response = { data };
    throw err;
  }
  return data;
};

export const getJobNotesApi = (jobId, page, limit) =>
  api.get(`/job/getJobNotes/${jobId}?page=${page}&limit=${limit}`);

export const getAllJNotes = async () => {
  try {
    const response = await api.get("/job/getAllJNotes");
    return response.data;
  } catch (err) {
    console.error("Failed to get job notes in api", err);
    throw err;
  }
};

export const deleteJobNoteApi = async (job_note_id) => {
  try {
    const res = await api.delete(`/job/deleteJobNote/${job_note_id}`);
    return res.data;
  } catch (err) {
    console.error("Failed to delete job note", err);
    throw err;
  }
};

export const getJobPipeline = async () => { };

// ===========================
// Get Candidates added by Recruiter
// ===========================
export const getRecruiterCandidatesApi = async () => {
  try {
    const response = await api.get("/candidate/recruiter");
    return response.data;
  } catch (err) {
    console.error("Failed to get recruiter candidates", err);
    throw err;
  }
};
