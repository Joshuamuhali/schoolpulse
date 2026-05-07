// ==========================================
// Exams API - Backend Only (NO SUPABASE)
// ==========================================
// Pure backend API calls - REST endpoints

import { apiRequest, getCurrentTenantId } from './adapters/backend';
import type { ApiResponse } from './client';

export interface Exam {
  id: string;
  tenantId: string;
  title: string;
  description?: string;
  classId: string;
  subject: string;
  examDate: string;
  duration: number;
  totalMarks: number;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  instructions?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExamResult {
  id: string;
  tenantId: string;
  examId: string;
  pupilId: string;
  marks: number;
  grade?: string;
  remarks?: string;
  submittedAt: string;
  gradedBy?: string;
  gradedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExamData {
  title: string;
  description?: string;
  classId: string;
  subject: string;
  examDate: string;
  duration: number;
  totalMarks: number;
  instructions?: string;
}

export interface CreateExamResultData {
  examId: string;
  pupilId: string;
  marks: number;
  grade?: string;
  remarks?: string;
}

export interface ExamFilters {
  classId?: string;
  subject?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

// GET ALL EXAMS
export async function getExams(filters?: ExamFilters): Promise<ApiResponse<Exam[]>> {
  const tenantId = getCurrentTenantId();
  if (!tenantId) {
    return {
      success: false,
      data: null,
      error: 'No tenant context',
    };
  }

  const params = new URLSearchParams();
  if (filters?.classId) params.append('classId', filters.classId);
  if (filters?.subject) params.append('subject', filters.subject);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
  if (filters?.dateTo) params.append('dateTo', filters.dateTo);

  return apiRequest<Exam[]>(`/exams?${params.toString()}`);
}

// GET EXAM BY ID
export async function getExam(id: string): Promise<ApiResponse<Exam>> {
  const tenantId = getCurrentTenantId();
  if (!tenantId) {
    return {
      success: false,
      data: null,
      error: 'No tenant context',
    };
  }

  return apiRequest<Exam>(`/exams/${id}`);
}

// CREATE EXAM
export async function createExam(data: CreateExamData): Promise<ApiResponse<Exam>> {
  const tenantId = getCurrentTenantId();
  if (!tenantId) {
    return {
      success: false,
      data: null,
      error: 'No tenant context',
    };
  }

  return apiRequest<Exam>('/exams', {
    method: 'POST',
    body: JSON.stringify({ ...data, tenantId, status: 'SCHEDULED' }),
  });
}

// UPDATE EXAM
export async function updateExam(id: string, data: Partial<CreateExamData>): Promise<ApiResponse<Exam>> {
  const tenantId = getCurrentTenantId();
  if (!tenantId) {
    return {
      success: false,
      data: null,
      error: 'No tenant context',
    };
  }

  return apiRequest<Exam>(`/exams/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// DELETE EXAM
export async function deleteExam(id: string): Promise<ApiResponse<void>> {
  const tenantId = getCurrentTenantId();
  if (!tenantId) {
    return {
      success: false,
      data: null,
      error: 'No tenant context',
    };
  }

  return apiRequest<void>(`/exams/${id}`, {
    method: 'DELETE',
  });
}

// GET EXAM RESULTS
export async function getExamResults(examId: string): Promise<ApiResponse<ExamResult[]>> {
  return apiRequest<ExamResult[]>(`/exams/${examId}/results`);
}

// SUBMIT EXAM RESULT
export async function submitExamResult(data: CreateExamResultData): Promise<ApiResponse<ExamResult>> {
  const tenantId = getCurrentTenantId();
  if (!tenantId) {
    return {
      success: false,
      data: null,
      error: 'No tenant context',
    };
  }

  return apiRequest<ExamResult>('/exam-results', {
    method: 'POST',
    body: JSON.stringify({ ...data, tenantId }),
  });
}

// BATCH SUBMIT EXAM RESULTS
export async function submitBatchExamResults(results: CreateExamResultData[]): Promise<ApiResponse<ExamResult[]>> {
  const tenantId = getCurrentTenantId();
  if (!tenantId) {
    return {
      success: false,
      data: null,
      error: 'No tenant context',
    };
  }

  const resultsWithTenantId = results.map(r => ({ ...r, tenantId }));

  return apiRequest<ExamResult[]>('/exam-results/batch', {
    method: 'POST',
    body: JSON.stringify(resultsWithTenantId),
  });
}

// UPDATE EXAM RESULT
export async function updateExamResult(id: string, data: Partial<CreateExamResultData>): Promise<ApiResponse<ExamResult>> {
  const tenantId = getCurrentTenantId();
  if (!tenantId) {
    return {
      success: false,
      data: null,
      error: 'No tenant context',
    };
  }

  return apiRequest<ExamResult>(`/exam-results/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// DELETE EXAM RESULT
export async function deleteExamResult(id: string): Promise<ApiResponse<void>> {
  const tenantId = getCurrentTenantId();
  if (!tenantId) {
    return {
      success: false,
      data: null,
      error: 'No tenant context',
    };
  }

  return apiRequest<void>(`/exam-results/${id}`, {
    method: 'DELETE',
  });
}

// GET EXAM STATISTICS
export async function getExamStatistics(examId: string): Promise<ApiResponse<any>> {
  return apiRequest<any>(`/exams/${examId}/statistics`);
}

// GET PUPIL EXAM RESULTS
export async function getPupilExamResults(pupilId: string, filters?: {
  classId?: string;
  subject?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<ApiResponse<ExamResult[]>> {
  const params = new URLSearchParams();
  if (filters?.classId) params.append('classId', filters.classId);
  if (filters?.subject) params.append('subject', filters.subject);
  if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
  if (filters?.dateTo) params.append('dateTo', filters.dateTo);

  return apiRequest<ExamResult[]>(`/pupils/${pupilId}/exam-results?${params.toString()}`);
}
