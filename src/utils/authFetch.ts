import { API_URL } from "../config/api";

export const authFetch = async (
  url: string,
  options: RequestInit = {},
) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });

  // 🔥 TOKEN EXPIRED
  if (response.status === 401) {
    alert("Sesi login telah berakhir, silakan login kembali");

    localStorage.clear();

    window.location.href = "/login";
  }

  return response;
};