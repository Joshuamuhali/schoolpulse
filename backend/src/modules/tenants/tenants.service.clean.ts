import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { UpdateBrandingDto } from './dto/update-branding.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { TenantStatus } from './types/tenant-status.enum';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTenantDto) {
    const existing = await this.prisma.tenant.findUnique({
      where: { subdomain: dto.subdomain }
    });

    if (existing) {
      throw new ConflictException('Subdomain already taken');
    }

    return this.prisma.tenant.create({
      data: {
        name: dto.name,
        subdomain: dto.subdomain,
        status: 'PENDING'
      }
    });
  }

  async findById(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id }
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return tenant;
  }

  async update(id: string, dto: UpdateTenantDto) {
    const tenant = await this.findById(id);
    
    return this.prisma.tenant.update({
      where: { id },
      data: dto
    });
  }

  async updateBranding(id: string, dto: UpdateBrandingDto) {
    const tenant = await this.findById(id);
    
    return this.prisma.tenant.update({
      where: { id },
      data: {
        logoUrl: dto.logoUrl,
        primaryColor: dto.primaryColor,
        secondaryColor: dto.secondaryColor
      }
    });
  }

  async updateSettings(id: string, dto: UpdateSettingsDto) {
    const tenant = await this.findById(id);
    
    return this.prisma.tenant.update({
      where: { id },
      data: {
        settings: dto.settings
      }
    });
  }

  async updateStatus(id: string, status: TenantStatus) {
    const tenant = await this.findById(id);
    
    return this.prisma.tenant.update({
      where: { id },
      data: { status }
    });
  }

  async resolve(subdomain: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { subdomain: subdomain.toLowerCase() }
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return tenant;
  }
}
