import axios from "axios";

const API_BASE_URL = "https://localhost:7076/api";
const ATTENDANCE_BASE_URL = "https://localhost:7076/api";


const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});


const attendanceApi = axios.create({
  baseURL: ATTENDANCE_BASE_URL,
  headers: { "Content-Type": "application/json" },
});


const attachToken = (config) => {
  const token = sessionStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
};

api.interceptors.request.use(attachToken);
attendanceApi.interceptors.request.use(attachToken);


const decodeToken = (token) => {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    return {
      id: decoded.id,
      username: decoded.sub,
      role: decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"],
    };
  } catch {
    return null;
  }
};

export const loginUser = async (username, password) => {
  const response = await api.post("/auth/login", { Username: username, Password: password });
  const token = response.data.token;
  const user = decodeToken(token);
  return { token, user };
};


export const clockIn = async () => {
  const response = await attendanceApi.post("/timerecord/time-in");
  return response.data;
};


export const clockOut = async (timeRecordId) => {
  const response = await attendanceApi.post("/timerecord/time-out", { timeRecordId });
  return response.data;
};

export default api;