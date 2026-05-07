import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { Tenant } from '@prisma/client';

@Injectable()
export class SchoolsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Tenant[]> {
    return this.prisma.tenant.findMany({
      include: {
        owner: true,
        pupils: true,
        teachers: true,
        classes: true,
      },
    });
  }

  async findOne(id: string): Promise<Tenant> {
    const tenant = await this.prisma.tenant.findFirst({
      where: { id },
      include: {
        owner: true,
        pupils: true,
        teachers: true,
        classes: true,
      },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }

    return tenant;
  }

  async create(createSchoolDto: CreateSchoolDto): Promise<Tenant> {
    return this.prisma.tenant.create({
      data: {
        ...createSchoolDto,
      },
      include: {
        owner: true,
        pupils: true,
        teachers: true,
        classes: true,
      },
    });
  }

  async update(id: string, updateSchoolDto: UpdateSchoolDto): Promise<Tenant> {
    // Verify tenant exists
    const existingTenant = await this.prisma.tenant.findFirst({
      where: { id },
    });

    if (!existingTenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }

    return this.prisma.tenant.update({
      where: { id },
      data: updateSchoolDto,
      include: {
        owner: true,
        pupils: true,
        teachers: true,
        classes: true,
      },
    });
  }

  async remove(id: string): Promise<void> {
    // Verify tenant exists
    const existingTenant = await this.prisma.tenant.findFirst({
      where: { id },
    });

    if (!existingTenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }

    await this.prisma.tenant.delete({
      where: { id },
    });
  }

  private getCurrentTenantId(): string {
    // This should be extracted from JWT token in request context
    // Implementation depends on your auth strategy
    throw new Error('Tenant context extraction not implemented');
  }
}
