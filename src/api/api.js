
import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:7000/api"
})

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
    const response = await api.post(`/user/reset-password`, { email, password });
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Create new user
export const createUserApi = async (userData) => {
  try {
    console.log("user data", userData)
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
    console.log("response", response.data);
    return response.data; // This should be { message, count, users }
  } catch (err) {
    console.error('Error fetching users:', err);
    throw err;
  }
};


//Get recruiters
export const getUsersByRoleApi = async (role) => {
  const res = await api.post('/user/getUsersByRole', { role })
  return res.data
}

// Update user by email
export const updateUserApi = async (currentEmail, userData) => {
  try {
    const payload = { ...userData, currentEmail }; // include currentEmail
    const response = await api.put(`/user/userUpdateByEmail`, payload);
    return response.data;
  } catch (error) {
    console.error("Error updating user:", error.response?.data || error);
    throw error;
  }
};



// Delete user by email
export const deleteUserByEmailApi = async (email) => {
  try {
    const response = await api.delete("/user/userDeleteByEmail", { data: { email } });
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

// Fetch all logout activities (optional)
export const fetchLogoutActivitiesApi = async () => {
  try {
    const response = await fetch("http://localhost:7000/api/user/logout/all");
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
    const response = await api.post('/user/loginPost', { email, password });
    return response.data; // { message, user }
  } catch (error) {
    // Return null if user not found or invalid password
    if (error.response && (error.response.status === 404 || error.response.status === 401)) return null;
    throw error;
  }
};


// Create new candidate
export const createCandidate = async (candData) => {
  try {


    for (let [key, value] of candData.entries()) {
      console.log("candidates form data", key, value);
    }
    // Check if candData is FormData or plain object
    const isFormData = candData instanceof FormData;
    console.log("check if form data", isFormData);

    //true until here but not sending to backend???

    const response = await api.post(
      "/candidate/createCandidate",
      candData,
      {
        headers: isFormData ? {} : { "Content-Type": "application/json" }
      }
    );

    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Server error" };
  }
};


// Fetch all candidates
export const getAllCandidates = async () => {
  try {
    const response = await api.get("/candidate/getAllCandidates");
    console.log("getting all candidates");
    console.log("response", response.data);
    return response.data;
  } catch (err) {
    console.error('Error fetching candidates:', err);
    throw err;
  }
};

//DELETE CANDIDATE  

export const deleteCandidateApi = async (candidate_id) => {
  try {
    console.log("sending candidate data to be deleted", candidate_id)
    const response = await api.delete("/candidate/deleteCandidateByID", { data: { candidate_id } });

    return response.data;
  } catch (error) {
    console.error("Error deleting candidate:", error.response?.data || error);
    throw error;
  }
};





//DELETE CANDIDATE BY EMAIL

export const deleteCandidateByEmailApi = async (email) => {
  try {
    console.log("Sending email to delete:", email)
    const response = await api.delete('/candidate/deleteCandidateByEmail', { data: { email } })
    return response.data
  } catch (err) {
    console.error("Failed to delete candidate:", err.response?.data || err)
    throw err
  }
}


//UPDATE CANDIDATE

export const updateCandidateApi = async (candidate_id, data) => {
  try {
    console.log("sending candidate data to be upated", candidate_id, data)

    const payload = { ...data, candidate_id };
    console.log("sending payload to be upated", candidate_id, payload)
    const response = await api.put("/candidate/candidateUpdate", payload)
    return response.data
  } catch (error) {
    console.error("Error updating candidate FE:", error.response?.data || error)
    throw error
  }
}

export const bulkUpload = async (formData) => {
  try {
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }
    const response = await api.post('/candidate/bulk-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data

  }
  catch (error) {
    console.error("Error uploading file FE:", error.response?.data || error)
    throw error
  }
}

export const getCandidateStatusHistoryApi = async () => {
  try {
    console.log("getting candidate history from BE")
    const response = await api.get("/candidate/candidateStatusHistory")
    return response.data
  } catch (error) {
    console.error('Error fetching candidate status history:', error)
    throw error
  }
}

//UPDATE CANDIDATES BY EMAIL

export const updateCandidateByEmailApi = async (email, data) => {
  try {

    console.log("data", data)
    const payload = { ...data, email }; // include email to identify candidate

    console.log("payload", payload)
    const response = await api.put("/candidate/candidateUpdateByEmail", payload);
    console.log("response", response)
    return response.data;
  } catch (error) {
    console.error("Error updating candidate by email FE:", error.response?.data || error);
    throw error;
  }
};

// ==============================
// BULK UPLOAD CANDIDATE CVS
// ==============================
export const bulkUploadCandidateCVs = async (formData) => {
  return API.post("/candidate/bulk-upload-cvs", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const saveSearchApi = async (data) => {
  try {

    console.log("data to be sent", data);
    const response = await api.post("/candidate/saved-search", data);
    console.log("saving search");
    console.log("data received", response);
    return response.data;
  } catch (err) {
    console.error('Error posting searches:', err);
    throw err;
  }
}

export const getUserID = async () => {

}
export const getAllSearches = async () => {
  try {
    const response = await api.get("/candidate/getAllSearches");
    console.log("getting all searches");
    console.log("response", response.data);
    return response.data;
  } catch (err) {
    console.error('Error fetching candidates:', err);
    throw err;
  }
}

export const deleteSearchApi = async (id) => {
  try {
    console.log("deleting search:", id)
    const response = await api.delete('/candidate/deleteSearch', { data: { savedsearch_id: id } })
    return response.data
  } catch (err) {
    console.error("Failed to delete search:", err.response?.data || err)
    throw err
  }
}

export const updateSearchApi = async (id, data) => {

  try {
    console.log("sending search data to be upated", id, data)

    const payload = { ...data, id };
    console.log("sending payload to be upated", id, payload)
    const response = await api.put("/candidate/searchUpdate", payload)
    return response.data
  } catch (error) {
    console.error("Error updating search FE:", error.response?.data || error)
    throw error
  }

}