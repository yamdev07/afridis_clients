import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  withCredentials: true, // Pour les cookies httpOnly
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si erreur 401 et pas déjà en cours de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Essayer de rafraîchir le token
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { token } = response.data;
        localStorage.setItem("token", token);

        // Réessayer la requête originale
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return instance(originalRequest);
      } catch (refreshError) {
        // Si le refresh échoue, déconnecter l'utilisateur
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const api = {
  // Authentification
  register: async (name, email, password) => {
    const response = await instance.post("/auth/register", { name, email, password });
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  login: async (email, password) => {
    const response = await instance.post("/auth/login", { email, password });
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: async () => {
    try {
      await instance.post("/auth/logout");
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },

  getCurrentUser: async () => {
    const response = await instance.get("/auth/me");
    localStorage.setItem("user", JSON.stringify(response.data));
    return response.data;
  },

  // Dashboard
  getDashboardSummary: () => instance.get("/dashboard").then((r) => r.data),

  // Clients
  listClients: (params) =>
    instance.get("/clients", { params }).then((r) => r.data),

  getClientById: (id) =>
    instance.get(`/clients/${id}`).then((r) => r.data),

  getClientByLineNumber: (line_number) =>
    instance.get(`/clients/line/${line_number}`).then((r) => r.data),

  createClient: (data) =>
    instance.post("/clients", data).then((r) => r.data),

  updateClient: (id, data) =>
    instance.put(`/clients/${id}`, data).then((r) => r.data),

  deleteClient: (id) => instance.delete(`/clients/${id}`),

  // Services
  listServices: (params) =>
    instance.get("/services", { params }).then((r) => r.data),

  getServiceById: (id) =>
    instance.get(`/services/${id}`).then((r) => r.data),

  createService: (data) =>
    instance.post("/services", data).then((r) => r.data),

  updateService: (id, data) =>
    instance.put(`/services/${id}`, data).then((r) => r.data),

  deleteService: (id) => instance.delete(`/services/${id}`),

  // Subscriptions
  listSubscriptions: (params) =>
    instance.get("/subscriptions", { params }).then((r) => r.data),

  getSubscriptionById: (id) =>
    instance.get(`/subscriptions/${id}`).then((r) => r.data),

  createSubscription: (data) =>
    instance.post("/subscriptions", data).then((r) => r.data),

  updateSubscription: (id, data) =>
    instance.put(`/subscriptions/${id}`, data).then((r) => r.data),

  deleteSubscription: (id) => instance.delete(`/subscriptions/${id}`),
};
