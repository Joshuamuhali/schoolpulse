import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { Teacher } from '@prisma/client';

@Injectable()
export class TeachersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Teacher[]> {
    const tenantId = this.getCurrentTenantId();
    return this.prisma.teacher.findMany({
      where: { tenantId },
      include: {
        classes: true,
      },
    });
  }

  async findOne(id: string): Promise<Teacher> {
    const tenantId = this.getCurrentTenantId();
    const teacher = await this.prisma.teacher.findFirst({
      where: { id, tenantId },
      include: {
        classes: true,
      },
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    }

    return teacher;
  }

  async create(createTeacherDto: CreateTeacherDto): Promise<Teacher> {
    const tenantId = this.getCurrentTenantId();

    return this.prisma.teacher.create({
      data: {
        ...createTeacherDto,
        tenantId,
      },
      include: {
        classes: true,
      },
    });
  }

  async update(id: string, updateTeacherDto: UpdateTeacherDto): Promise<Teacher> {
    const tenantId = this.getCurrentTenantId();

    // Verify teacher belongs to tenant
    const existingTeacher = await this.prisma.teacher.findFirst({
      where: { id, tenantId },
    });

    if (!existingTeacher) {
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    }

    return this.prisma.teacher.update({
      where: { id },
      data: updateTeacherDto,
      include: {
        classes: true,
      },
    });
  }

  async remove(id: string): Promise<void> {
    const tenantId = this.getCurrentTenantId();

    // Verify teacher belongs to tenant
    const existingTeacher = await this.prisma.teacher.findFirst({
      where: { id, tenantId },
    });

    if (!existingTeacher) {
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    }

    await this.prisma.teacher.delete({
      where: { id },
    });
  }

  private getCurrentTenantId(): string {
    // This should be extracted from JWT token in request context
    // Implementation depends on your auth strategy
    throw new Error('Tenant context extraction not implemented');
  }
}
