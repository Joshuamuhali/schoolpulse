// ==========================================
// Auth API - Backend Only (NO SUPABASE)
// ==========================================
// Pure backend API calls - JWT based authentication

import { apiRequest } from './adapters/backend';
import type { ApiResponse } from './client';

export interface User {
  id: string;
  email: string;
  role: string;
  tenantId?: string;
  firstName?: string;
  lastName?: string;
}

export interface Session {
  access_token: string;
  refresh_token: string;
}

export interface AuthData {
  user: User;
  session: Session;
}

export interface LoginCredentials {
  email: string;
  password: string;
  subdomain: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// LOGIN - Backend JWT
export async function login(credentials: LoginCredentials): Promise<ApiResponse<AuthData>> {
  return apiRequest<AuthData>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

// REGISTER - Backend JWT
export async function register(credentials: RegisterCredentials): Promise<ApiResponse<AuthData>> {
  return apiRequest<AuthData>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

// LOGOUT - Backend JWT
export async function logout(): Promise<ApiResponse<void>> {
  return apiRequest<void>('/auth/logout', {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

// GET CURRENT USER - Backend JWT
export async function getCurrentUser(): Promise<ApiResponse<User>> {
  return apiRequest<User>('/auth/me');
}

// REFRESH TOKEN - Backend JWT
export async function refreshToken(): Promise<ApiResponse<Session>> {
  return apiRequest<Session>('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

// CHECK TENANT MEMBERSHIP - Backend
export async function checkTenantMembership(): Promise<ApiResponse<any>> {
  return apiRequest<any>('/auth/membership');
}
