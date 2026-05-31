const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

async function request(method, path, body) {
  const options = {
    method,
    headers: { 
      "Content-Type": "application/json",
      "Cache-Control": "no-cache, no-store, must-revalidate"
    },
  };

  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(`${BASE_URL}${path}`, options);

  if (!res.ok) {
    const error = await res
      .json()
      .catch(() => ({ message: "Terjadi kesalahan" }));
    throw new Error(error.message || `HTTP error ${res.status}`);
  }

  return res.json();
}

export const api = {
  get: (path) => request("GET", path),
  post: (path, body) => request("POST", path, body),
  put: (path, body) => request("PUT", path, body),
  delete: (path) => request("DELETE", path),
};
