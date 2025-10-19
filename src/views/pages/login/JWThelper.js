// src/views/login/JWThelper.js
import jwt from 'jsonwebtoken';

const SECRET_KEY = 'your_secret_key_here'; // replace with secure key later

export const generateJWT = (payload) => {
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });
  console.log("JWT generated:", token); // prints in browser console
  return token;
};
