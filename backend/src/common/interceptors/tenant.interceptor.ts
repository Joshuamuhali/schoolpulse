import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    
    // Extract tenant from subdomain or JWT
    let tenantId: string | null = null;

    // Check if user has tenantId in JWT token
    if (request.user && (request.user as any).tenantId) {
      tenantId = (request.user as any).tenantId;
    }
    
    // Method 2: From subdomain (fallback)
    if (!tenantId && request.headers.host) {
      const subdomain = request.headers.host.split('.')[0];
      if (subdomain && subdomain !== 'api' && subdomain !== 'www') {
        // In a real implementation, you'd resolve subdomain to tenantId
        // For now, we'll store it for later resolution
        request.tenantSubdomain = subdomain;
      }
    }

    // Method 3: From x-tenant-id header
    if (!tenantId && request.headers['x-tenant-id']) {
      tenantId = request.headers['x-tenant-id'] as string;
    }

    // Store tenant context in request
    request.tenantId = tenantId;

    return next.handle().pipe(
      tap(() => {
        // Log activity if needed
        if (request.user && request.method !== 'GET') {
          console.log(`[${new Date().toISOString()}] ${request.method} ${request.url} - User: ${(request.user as any)?.id}, Tenant: ${tenantId}`);
        }
      }),
    );
  }
}
