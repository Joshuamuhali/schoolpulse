import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreatePupilDto } from './dto/create-pupil.dto';
import { UpdatePupilDto } from './dto/update-pupil.dto';
import { Pupil } from '@prisma/client';

@Injectable()
export class PupilsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Pupil[]> {
    const tenantId = this.getCurrentTenantId();
    return this.prisma.pupil.findMany({
      where: { tenantId },
      include: {
        class: true,
        attendance: true,
        examResults: true,
      },
    });
  }

  async findOne(id: string): Promise<Pupil> {
    const tenantId = this.getCurrentTenantId();
    const pupil = await this.prisma.pupil.findFirst({
      where: { id, tenantId },
      include: {
        class: true,
        attendance: true,
        examResults: true,
      },
    });

    if (!pupil) {
      throw new NotFoundException(`Pupil with ID ${id} not found`);
    }

    return pupil;
  }

  async create(createPupilDto: CreatePupilDto): Promise<Pupil> {
    const tenantId = this.getCurrentTenantId();

    // Verify class belongs to tenant
    const classExists = await this.prisma.class.findFirst({
      where: { id: createPupilDto.classId, tenantId },
    });

    if (!classExists) {
      throw new BadRequestException('Class does not belong to current tenant');
    }

    return this.prisma.pupil.create({
      data: createPupilDto,
      include: {
        class: true,
      },
    });
  }

  async update(id: string, updatePupilDto: UpdatePupilDto): Promise<Pupil> {
    const tenantId = this.getCurrentTenantId();

    // Verify pupil belongs to tenant
    const existingPupil = await this.prisma.pupil.findFirst({
      where: { id, tenantId },
    });

    if (!existingPupil) {
      throw new NotFoundException(`Pupil with ID ${id} not found`);
    }

    // If updating class, verify new class belongs to tenant
    if (updatePupilDto.classId) {
      const classExists = await this.prisma.class.findFirst({
        where: { id: updatePupilDto.classId, tenantId },
      });

      if (!classExists) {
        throw new BadRequestException('Class does not belong to current tenant');
      }
    }

    return this.prisma.pupil.update({
      where: { id },
      data: updatePupilDto,
      include: {
        class: true,
      },
    });
  }

  async remove(id: string): Promise<void> {
    const tenantId = this.getCurrentTenantId();

    // Verify pupil belongs to tenant
    const existingPupil = await this.prisma.pupil.findFirst({
      where: { id, tenantId },
    });

    if (!existingPupil) {
      throw new NotFoundException(`Pupil with ID ${id} not found`);
    }

    await this.prisma.pupil.delete({
      where: { id },
    });
  }

  private getCurrentTenantId(): string {
    // This should be extracted from JWT token in request context
    // Implementation depends on your auth strategy
    throw new Error('Tenant context extraction not implemented');
  }
}
