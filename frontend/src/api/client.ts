// ==========================================
// API Client - Backend Agnostic Layer
// ==========================================
// This is base HTTP client for backend API
// Pure REST client - no Supabase dependencies

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

export async function apiRequest<T>(
  path: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('token');

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'API error' }));
      return {
        success: false,
        data: null,
        error: error.message || `HTTP ${res.status}`,
      };
    }

    const data = await res.json();
    return {
      success: true,
      data,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

// HTTP method helpers
export const apiClient = {
  get: <T>(path: string) => apiRequest<T>(path, { method: 'GET' }),
  post: <T>(path: string, body: unknown) => apiRequest<T>(path, { 
    method: 'POST', 
    body: JSON.stringify(body) 
  }),
  put: <T>(path: string, body: unknown) => apiRequest<T>(path, { 
    method: 'PUT', 
    body: JSON.stringify(body) 
  }),
  patch: <T>(path: string, body: unknown) => apiRequest<T>(path, { 
    method: 'PATCH', 
    body: JSON.stringify(body) 
  }),
  delete: <T>(path: string) => apiRequest<T>(path, { method: 'DELETE' }),
};
