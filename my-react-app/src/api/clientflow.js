import axios from "axios";

const instance = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // Auth
  login: async (email, password) => {
    const response = await instance.post("/auth/login", { email, password });
    const { token, user } = response.data || {};
    if (token) {
      localStorage.setItem("token", token);
    }
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
    return response.data;
  },

  logout: async () => {
    try {
      await instance.post("/auth/logout");
    } catch {
      // on ignore les erreurs réseau ici
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },

  me: () => instance.get("/auth/me").then((r) => r.data),

  // Dashboard & données métier
  getDashboardSummary: () => instance.get("/dashboard").then((r) => r.data),

  listClients: (params) =>
    instance.get("/clients", { params }).then((r) => r.data),

  listServices: (params) =>
    instance.get("/services", { params }).then((r) => r.data),

  getServiceClients: (serviceId) =>
    instance.get(`/services/${serviceId}/clients`).then((r) => r.data),

  getClientByLineNumber: (line_number) =>
    instance.get(`/clients/line/${line_number}`).then((r) => r.data),

  deleteClient: (id) => instance.delete(`/clients/${id}`),

  // Subscriptions / ventes pour l’export
  listSubscriptions: (params) =>
    instance.get("/subscriptions", { params }).then((r) => r.data),

  bulkImportSubscriptions: (rows) =>
    instance.post("/subscriptions/bulk-import", { rows }).then((r) => r.data),

  // Gestion des utilisateurs (admin suprême)
  listUsers: () => instance.get("/users").then((r) => r.data),
  createUser: (payload) => instance.post("/users", payload).then((r) => r.data),

  // Notifications
  listNotifications: (params) =>
    instance.get("/notifications", { params }).then((r) => r.data),
  markNotificationRead: (id) =>
    instance.patch(`/notifications/${id}/read`).then((r) => r.data),
  markAllNotificationsRead: () =>
    instance.patch("/notifications/mark-all-read").then((r) => r.data),
};
