import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ats_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle auth errors globally
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const requestUrl = error.config?.url || "";
    const isLoginOrRegisterRequest =
      requestUrl.includes("/auth/login") || requestUrl.includes("/auth/register");

    if (error.response?.status === 401 && !isLoginOrRegisterRequest) {
      localStorage.removeItem("ats_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),
  register: (data: any) => api.post("/auth/register", data),
  me: () => api.get("/auth/me"),
};

// ─── Vendors ──────────────────────────────────────────────────────────────────
export const vendorApi = {
  list: (params?: any) => api.get("/vendors", { params }),
  get: (id: string) => api.get(`/vendors/${id}`),
  create: (data: any) => api.post("/vendors", data),
  update: (id: string, data: any) => api.patch(`/vendors/${id}`, data),
  performance: (id: string) => api.get(`/vendors/${id}/performance`),
};

// ─── Requisitions ─────────────────────────────────────────────────────────────
export const requisitionApi = {
  list: (params?: any) => api.get("/requisitions", { params }),
  get: (id: string) => api.get(`/requisitions/${id}`),
  create: (data: any) => api.post("/requisitions", data),
  update: (id: string, data: any) => api.patch(`/requisitions/${id}`, data),
  approve: (id: string) => api.post(`/requisitions/${id}/approve`),
  assignVendors: (id: string, vendorIds: string[]) =>
    api.post(`/requisitions/${id}/vendors`, { vendorIds }),
};

// ─── Candidates / Submissions ─────────────────────────────────────────────────
export const submissionApi = {
  submit: (data: any) => api.post("/submissions", data),
  list: (params?: any) => api.get("/submissions", { params }),
  updateStatus: (id: string, data: any) =>
    api.patch(`/submissions/${id}/status`, data),
  getCandidate: (id: string) => api.get(`/candidates/${id}`),
};

// ─── Analytics ────────────────────────────────────────────────────────────────
export const analyticsApi = {
  dashboard: () => api.get("/analytics/dashboard"),
  vendorReport: () => api.get("/analytics/vendor-report"),
  hiringFunnel: (params?: any) =>
    api.get("/analytics/hiring-funnel", { params }),
};
