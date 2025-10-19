// import axios from "axios";

// const API_BASE_URL = "http://localhost:7000";

// // Fetch user by email and password
// export const fetchUserByEmail = async (email, password) => {
//   try {
//     const response = await axios.post(`${API_BASE_URL}/api/user/fetchUser`, { email, password });
//     return response.data; // user object
//   } catch (error) {
//     // If backend returns 404 (user not found), treat as null
//     if (error.response && error.response.status === 404) return null;

//     // If backend returns 401 (invalid password)
//     if (error.response && error.response.status === 401) return null;

//     throw error; // other errors
//   }
// };

// // Validate password for a given email
// export const validatePassword = async (email, password) => {
//   try {
//     const response = await axios.post(`${API_BASE_URL}/api/user/fetchPasswd`, { email, password });
//     return response.data; // e.g., { valid: true } or user object
//   } catch (error) {
//     if (error.response && error.response.status === 401) return false;
//     throw error;
//   }
// };

import axios from "axios";

const API_BASE_URL = "http://localhost:7000/api/user";

// Fetch user by email
export const fetchUserByEmail = async (email) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/fetchUser`, { email });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) return null;
    throw error;
  }
};

// Validate password for a given email
export const validatePassword = async (email, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/fetchPasswd`, { email, password });
    return response.data; // e.g., { valid: true } or user object
  } catch (error) {
    if (error.response && error.response.status === 401) return false;
    throw error;
  }
};

// ✅ Forgot password
export const sendForgotPassword = async (email) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/forgot-password`, { email });
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const resetUserPassword = async (email, password) => {
  try {
    console.log("sending reset data to backend")
    const response = await axios.post(`${API_BASE_URL}/reset-password`, { email, password });
    return response.data;
  } catch (error) {
    console.log("error resetting")
    throw error;
  }
}

// Create new user
export const createUserApi = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/register`, userData);
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
    const response = await axios.get(`${API_BASE_URL}/getAll`);

    // 2. Return 'response.data' instead of 'res.data'
    return response.data; // This should be { message, count, users }
  } catch (err) {
    console.error('Error fetching users:', err);
    throw err;
  }
};


//Get recruiters
export const getUsersByRoleApi = async (role) => {
  const res = await axios.post(`${API_BASE_URL}/getUsersByRole`, { role })
  return res.data
}

