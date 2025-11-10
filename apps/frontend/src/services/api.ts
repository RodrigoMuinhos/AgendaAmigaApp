import axios from "axios";

let authToken: string | null = null;

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  withCredentials: false,
});

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export function getAuthToken() {
  return authToken;
}
