import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { Class } from '@prisma/client';

@Injectable()
export class ClassesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Class[]> {
    const tenantId = this.getCurrentTenantId();
    return this.prisma.class.findMany({
      where: { tenantId },
      include: {
        classTeacher: true,
        pupils: true,
      },
    });
  }

  async findOne(id: string): Promise<Class> {
    const tenantId = this.getCurrentTenantId();
    const classRecord = await this.prisma.class.findFirst({
      where: { id, tenantId },
      include: {
        classTeacher: true,
        pupils: true,
      },
    });

    if (!classRecord) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }

    return classRecord;
  }

  async create(createClassDto: CreateClassDto): Promise<Class> {
    const tenantId = this.getCurrentTenantId();

    // Verify teacher belongs to tenant if teacherId provided
    if (createClassDto.teacherId) {
      const teacherExists = await this.prisma.teacher.findFirst({
        where: { id: createClassDto.teacherId, tenantId },
      });

      if (!teacherExists) {
        throw new BadRequestException('Teacher does not belong to current tenant');
      }
    }

    return this.prisma.class.create({
      data: {
        ...createClassDto,
        tenantId,
      },
      include: {
        classTeacher: true,
        pupils: true,
      },
    });
  }

  async update(id: string, updateClassDto: UpdateClassDto): Promise<Class> {
    const tenantId = this.getCurrentTenantId();

    // Verify class belongs to tenant
    const existingClass = await this.prisma.class.findFirst({
      where: { id, tenantId },
    });

    if (!existingClass) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }

    // If updating teacher, verify new teacher belongs to tenant
    if (updateClassDto.teacherId) {
      const teacherExists = await this.prisma.teacher.findFirst({
        where: { id: updateClassDto.teacherId, tenantId },
      });

      if (!teacherExists) {
        throw new BadRequestException('Teacher does not belong to current tenant');
      }
    }

    return this.prisma.class.update({
      where: { id },
      data: updateClassDto,
      include: {
        classTeacher: true,
        pupils: true,
      },
    });
  }

  async remove(id: string): Promise<void> {
    const tenantId = this.getCurrentTenantId();

    // Verify class belongs to tenant
    const existingClass = await this.prisma.class.findFirst({
      where: { id, tenantId },
    });

    if (!existingClass) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }

    await this.prisma.class.delete({
      where: { id },
    });
  }

  private getCurrentTenantId(): string {
    // This should be extracted from JWT token in request context
    // Implementation depends on your auth strategy
    throw new Error('Tenant context extraction not implemented');
  }
}
