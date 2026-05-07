import { apiClient } from "./client";

export const attendanceApi = {
  getAll: () => apiClient.get("/attendance"),
  getById: (id: string) => apiClient.get(`/attendance/${id}`),
  create: (data: any) => apiClient.post("/attendance", data),
  update: (id: string, data: any) => apiClient.patch(`/attendance/${id}`, data),
  delete: (id: string) => apiClient.delete(`/attendance/${id}`),
};
