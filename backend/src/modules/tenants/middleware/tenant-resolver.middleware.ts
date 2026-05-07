import { Injectable, NestMiddleware, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class TenantResolverMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    let resolvedTenantId: string | null = null;
    let tenant: any = null;

    // Extract subdomain from host
    const host = req.headers.host;
    if (host) {
      const subdomain = host.split('.')[0];
      
      if (subdomain && subdomain !== 'api' && subdomain !== 'www') {
        try {
          tenant = await this.prisma.tenant.findUnique({
            where: { 
              subdomain: subdomain.toLowerCase(),
            },
            select: {
              id: true,
              name: true,
              subdomain: true,
              status: true,
              settings: true,
            },
          });

          if (tenant) {
            resolvedTenantId = tenant.id;
          }
        } catch (error) {
          // Log error but continue
        }
      }
    }

    // JWT fallback
    if (req.user && (req.user as any).tenantId) {
      if (resolvedTenantId && (req.user as any).tenantId !== resolvedTenantId) {
        throw new ForbiddenException('Access denied: User tenant mismatch');
      }
      resolvedTenantId = (req.user as any).tenantId;
    }

    if (!resolvedTenantId) {
      throw new ForbiddenException('Tenant not resolved');
    }

    // Attach to request
    req.tenantId = resolvedTenantId;
    req.tenant = tenant;

    next();
  }

  /**
   * Extract subdomain from host
   * Examples:
   * - school1.pulseschools.com -> school1
   * - api.school1.pulseschools.com -> school1
   * - localhost:3000 -> null
   */
  private extractSubdomain(host: string): string | null {
    // Remove port if present
    host = host.split(':')[0];
    
    // Split by dots
    const parts = host.split('.');
    
    // If we have at least 3 parts, extract subdomain
    if (parts.length >= 3) {
      const subdomain = parts[0];
      
      // Skip common subdomains
      const skipSubdomains = ['api', 'www', 'admin', 'app', 'staging'];
      
      if (!skipSubdomains.includes(subdomain.toLowerCase())) {
        return subdomain.toLowerCase();
      }
    }
    
    return null;
  }
}
