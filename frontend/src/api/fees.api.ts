// ==========================================
// Fees API - Finance & Fee Management
// ==========================================
// NOTE: This module is PLACEHOLDER - Finance feature not implemented
// When backend is ready, implement actual fee operations

import type { ApiResponse } from './client';

export interface FeeStructure {
  id: string;
  school_id: string;
  name: string;
  amount: number;
  frequency: 'monthly' | 'term' | 'annual' | 'one-time';
  applicable_classes: string[];
  due_date?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface Invoice {
  id: string;
  school_id: string;
  student_id: string;
  fee_structure_id: string;
  amount: number;
  paid_amount: number;
  balance: number;
  status: 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled';
  due_date: string;
  paid_date?: string;
  notes?: string;
  created_at: string;
}

export interface Payment {
  id: string;
  school_id: string;
  invoice_id: string;
  student_id: string;
  amount: number;
  payment_method: 'cash' | 'bank_transfer' | 'mobile_money' | 'cheque';
  reference_number?: string;
  payment_date: string;
  notes?: string;
  recorded_by?: string;
  created_at: string;
}

// PLACEHOLDER FUNCTIONS - Feature not implemented

export async function getFeeStructures(): Promise<ApiResponse<FeeStructure[]>> {
  // TODO: Implement when Finance feature is built
  return {
    success: false,
    data: null,
    error: 'Finance module not implemented',
  };
}

export async function createFeeStructure(): Promise<ApiResponse<FeeStructure>> {
  return {
    success: false,
    data: null,
    error: 'Finance module not implemented',
  };
}

export async function getInvoices(): Promise<ApiResponse<Invoice[]>> {
  return {
    success: false,
    data: null,
    error: 'Finance module not implemented',
  };
}

export async function createInvoice(): Promise<ApiResponse<Invoice>> {
  return {
    success: false,
    data: null,
    error: 'Finance module not implemented',
  };
}

export async function getPayments(): Promise<ApiResponse<Payment[]>> {
  return {
    success: false,
    data: null,
    error: 'Finance module not implemented',
  };
}

export async function recordPayment(_data?: Partial<Payment>): Promise<ApiResponse<Payment>> {
  return {
    success: false,
    data: null,
    error: 'Finance module not implemented',
  };
}
