import { apiClient } from "./client";

export const classesApi = {
  getAll: () => apiClient.get("/classes"),
  getById: (id: string) => apiClient.get(`/classes/${id}`),
  create: (data: any) => apiClient.post("/classes", data),
  update: (id: string, data: any) => apiClient.patch(`/classes/${id}`, data),
  delete: (id: string) => apiClient.delete(`/classes/${id}`),
};
