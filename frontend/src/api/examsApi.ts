import { apiClient } from "./client";

export const examsApi = {
  getAll: () => apiClient.get("/exams"),
  getById: (id: string) => apiClient.get(`/exams/${id}`),
  create: (data: any) => apiClient.post("/exams", data),
  update: (id: string, data: any) => apiClient.patch(`/exams/${id}`, data),
  delete: (id: string) => apiClient.delete(`/exams/${id}`),
};
