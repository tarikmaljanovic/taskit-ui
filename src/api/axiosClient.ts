// src/api/axiosClient.ts
import axios from 'axios';

const axiosClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // Adjust if your Spring Boot backend is deployed elsewhere
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosClient;
