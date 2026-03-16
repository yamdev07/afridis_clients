import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Déconnexion globale en cas de token expiré / non autorisé
// Ne pas déconnecter sur 401 pour certaines actions secondaires (ex: marquer notifications lues)
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url ?? "";

    if (status === 401) {
      const isSecondaryAction =
        /\/notifications\/mark-all-read/.test(url) ||
        /\/notifications\/[^/]+\/read/.test(url);

      if (!isSecondaryAction) {
        try {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        } catch {
          // ignore
        }
        if (typeof window !== "undefined") {
          const currentPath = window.location.pathname;
          if (currentPath !== "/") {
            window.location.href = "/";
          }
        }
      }
    }

    return Promise.reject(error);
  }
);

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

  updateProfile: (payload) =>
    instance.put("/auth/me", payload).then((r) => r.data),

  forgotPassword: (email, newPassword) =>
    instance
      .post("/auth/forgot-password", { email, newPassword })
      .then((r) => r.data),

  // Dashboard & données métier
  getDashboardSummary: () => instance.get("/dashboard").then((r) => r.data),
  getReportsData: () => instance.get("/dashboard/reports").then((r) => r.data),

  listClients: (params) =>
    instance.get("/clients", { params }).then((r) => r.data),

  createClient: (payload) =>
    instance.post("/clients", payload).then((r) => r.data),

  updateClient: (id, payload) =>
    instance.put(`/clients/${id}`, payload).then((r) => r.data),

  createSubscription: (payload) =>
    instance.post("/subscriptions", payload).then((r) => r.data),

  listServices: (params) =>
    instance.get("/services", { params }).then((r) => r.data),

  createService: (payload) =>
    instance.post("/services", payload).then((r) => r.data),

  getServiceClients: (serviceId) =>
    instance.get(`/services/${serviceId}/clients`).then((r) => r.data),

  getClientByLineNumber: (line_number) =>
    instance.get(`/clients/line/${line_number}`).then((r) => r.data),

  deleteClient: (id) => instance.delete(`/clients/${id}`).then((r) => r.data),

  deleteService: (id) => instance.delete(`/services/${id}`).then((r) => r.data),

  // Subscriptions / ventes pour l’export
  listSubscriptions: (params) =>
    instance.get("/subscriptions", { params }).then((r) => r.data),

  listStatuses: () =>
    instance.get("/subscriptions/statuses").then((r) => r.data),

  bulkImportSubscriptions: (rows) =>
    instance.post("/subscriptions/bulk-import", { rows }).then((r) => r.data),

  // Gestion des utilisateurs (admin suprême)
  listUsers: () => instance.get("/users").then((r) => r.data),
  createUser: (payload) => instance.post("/users", payload).then((r) => r.data),
  updateUser: (id, payload) =>
    instance.put(`/users/${id}`, payload).then((r) => r.data),
  deleteUser: (id) => instance.delete(`/users/${id}`).then((r) => r.data),
  changeUserPassword: (id, newPassword) =>
    instance
      .patch(`/users/${id}/password`, { newPassword })
      .then((r) => r.data),

  changeOwnPassword: (currentPassword, newPassword) =>
    instance
      .patch("/auth/me/password", { currentPassword, newPassword })
      .then((r) => r.data),

  // Notifications
  listNotifications: (params) =>
    instance.get("/notifications", { params }).then((r) => r.data),
  markNotificationRead: (id) =>
    instance.patch(`/notifications/${id}/read`).then((r) => r.data),
  deleteNotification: (id) =>
    instance.delete(`/notifications/${id}`).then((r) => r.data),
  markAllNotificationsRead: () =>
    instance.patch("/notifications/mark-all-read").then((r) => r.data),
};
