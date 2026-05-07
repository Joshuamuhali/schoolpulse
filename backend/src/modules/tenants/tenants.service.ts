import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { UpdateBrandingDto } from './dto/update-branding.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { OnboardTenantDto } from './dto/onboard-tenant.dto';
import { TenantStatus } from './types/tenant-status.enum';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TenantsService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

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

  async onboard(dto: OnboardTenantDto) {
    const existingTenant = await this.prisma.tenant.findUnique({
      where: { subdomain: dto.subdomain }
    });

    if (existingTenant) {
      throw new ConflictException('Subdomain already taken');
    }

    const existingUser = await this.prisma.user.findFirst({
      where: { email: dto.adminEmail }
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.adminPassword, 10);

    const result = await this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: dto.schoolName,
          subdomain: dto.subdomain,
          status: 'ACTIVE',
          settings: {}
        }
      });

      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          email: dto.adminEmail,
          passwordHash: hashedPassword,
          firstName: dto.adminName,
          lastName: 'School Administrator',
          role: 'SCHOOL_ADMIN'
        }
      });

      await tx.tenant.update({
        where: { id: tenant.id },
        data: { ownerUserId: user.id }
      });

      const tokens = await this.generateTokens(user);

      return {
        tenant: {
          id: tenant.id,
          subdomain: tenant.subdomain
        },
        user: {
          id: user.id,
          role: user.role
        },
        tokens
      };
    });

    return result;
  }

  private async generateTokens(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return { accessToken, refreshToken };
  }
}
