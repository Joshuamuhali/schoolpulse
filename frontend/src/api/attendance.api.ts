// ==========================================
// Attendance API - Backend Only (NO SUPABASE)
// ==========================================
// Pure backend API calls - REST endpoints

import { apiRequest, getCurrentTenantId } from './adapters/backend';
import type { ApiResponse } from './client';

export interface AttendanceRecord {
  id: string;
  tenantId: string;
  pupilId: string;
  classId: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  markedBy: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MarkAttendanceData {
  pupilId: string;
  classId: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  notes?: string;
}

export interface AttendanceFilters {
  classId?: string;
  date?: string;
  status?: string;
  pupilId?: string;
}

// GET ATTENDANCE RECORDS
export async function getAttendance(filters?: AttendanceFilters): Promise<ApiResponse<AttendanceRecord[]>> {
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
  if (filters?.date) params.append('date', filters.date);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.pupilId) params.append('pupilId', filters.pupilId);

  return apiRequest<AttendanceRecord[]>(`/attendance?${params.toString()}`);
}

// MARK ATTENDANCE
export async function markAttendance(data: MarkAttendanceData): Promise<ApiResponse<AttendanceRecord>> {
  const tenantId = getCurrentTenantId();
  if (!tenantId) {
    return {
      success: false,
      data: null,
      error: 'No tenant context',
    };
  }

  return apiRequest<AttendanceRecord>('/attendance', {
    method: 'POST',
    body: JSON.stringify({ ...data, tenantId }),
  });
}

// BATCH MARK ATTENDANCE
export async function markBatchAttendance(records: MarkAttendanceData[]): Promise<ApiResponse<AttendanceRecord[]>> {
  const tenantId = getCurrentTenantId();
  if (!tenantId) {
    return {
      success: false,
      data: null,
      error: 'No tenant context',
    };
  }

  const recordsWithTenantId = records.map(r => ({ ...r, tenantId }));

  return apiRequest<AttendanceRecord[]>('/attendance/batch', {
    method: 'POST',
    body: JSON.stringify(recordsWithTenantId),
  });
}

// UPDATE ATTENDANCE
export async function updateAttendance(id: string, data: Partial<MarkAttendanceData>): Promise<ApiResponse<AttendanceRecord>> {
  const tenantId = getCurrentTenantId();
  if (!tenantId) {
    return {
      success: false,
      data: null,
      error: 'No tenant context',
    };
  }

  return apiRequest<AttendanceRecord>(`/attendance/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// DELETE ATTENDANCE RECORD
export async function deleteAttendance(id: string): Promise<ApiResponse<void>> {
  const tenantId = getCurrentTenantId();
  if (!tenantId) {
    return {
      success: false,
      data: null,
      error: 'No tenant context',
    };
  }

  return apiRequest<void>(`/attendance/${id}`, {
    method: 'DELETE',
  });
}

// GET ATTENDANCE STATS
export async function getAttendanceStats(filters?: {
  classId?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<ApiResponse<any>> {
  const params = new URLSearchParams();
  if (filters?.classId) params.append('classId', filters.classId);
  if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
  if (filters?.dateTo) params.append('dateTo', filters.dateTo);

  return apiRequest<any>(`/attendance/stats?${params.toString()}`);
}

// GET PUPIL ATTENDANCE HISTORY
export async function getPupilAttendanceHistory(pupilId: string, filters?: {
  dateFrom?: string;
  dateTo?: string;
}): Promise<ApiResponse<AttendanceRecord[]>> {
  const params = new URLSearchParams();
  if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
  if (filters?.dateTo) params.append('dateTo', filters.dateTo);

  return apiRequest<AttendanceRecord[]>(`/pupils/${pupilId}/attendance?${params.toString()}`);
}
