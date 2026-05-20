import { API_URL } from "../config/api";

export const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}${url}`, {
    ...options,

    headers: {
      ...(options.headers || {}),

      Authorization: `Bearer ${token}`,
    },
  });

  // 🔥 biarkan halaman yang handle session expired
  return response;
};
