import axios from "axios";

const instance = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const api = {

  getDashboardSummary: () => instance.get("/dashboard").then(r => r.data),

  listClients: (params) =>
    instance.get("/clients", { params }).then(r => r.data),

  getClientByLineNumber: (line_number) =>
    instance.get(`/clients/line/${line_number}`).then(r => r.data),

  deleteClient: (id) =>
    instance.delete(`/clients/${id}`),

};
