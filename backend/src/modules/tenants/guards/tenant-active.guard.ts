import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class TenantActiveGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    
    if (request.tenant?.status !== 'ACTIVE') {
      throw new ForbiddenException('Tenant not active');
    }
    
    return true;
  }
}
