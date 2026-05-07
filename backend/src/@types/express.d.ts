import { Request } from 'express';

// Define User interface for JWT payload
export interface User {
  id: string;
  email: string;
  role: string;
  tenantId: string;
  firstName: string;
  lastName: string;
}

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
      tenant?: any;
      tenantSubdomain?: string;
      user?: User;
    }
  }
}
