import { apiClient } from "./client";

export const teachersApi = {
  getAll: () => apiClient.get("/teachers"),
  getById: (id: string) => apiClient.get(`/teachers/${id}`),
  create: (data: any) => apiClient.post("/teachers", data),
  update: (id: string, data: any) => apiClient.patch(`/teachers/${id}`, data),
  delete: (id: string) => apiClient.delete(`/teachers/${id}`),
};
