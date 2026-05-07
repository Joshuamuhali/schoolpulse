import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { CreateExamResultDto } from './dto/create-exam-result.dto';
import { Exam } from '@prisma/client';

@Injectable()
export class ExamsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Exam[]> {
    const tenantId = this.getCurrentTenantId();
    return this.prisma.exam.findMany({
      where: { tenantId },
      include: {
        class: true,
        examResults: true,
      },
    });
  }

  async findOne(id: string): Promise<Exam> {
    const tenantId = this.getCurrentTenantId();
    const exam = await this.prisma.exam.findFirst({
      where: { id, tenantId },
      include: {
        class: true,
        examResults: true,
      },
    });

    if (!exam) {
      throw new NotFoundException(`Exam with ID ${id} not found`);
    }

    return exam;
  }

  async create(createExamDto: CreateExamDto): Promise<Exam> {
    const tenantId = this.getCurrentTenantId();

    // Verify class belongs to tenant if classId provided
    if (createExamDto.classId) {
      const classExists = await this.prisma.class.findFirst({
        where: { id: createExamDto.classId, tenantId },
      });

      if (!classExists) {
        throw new BadRequestException('Class does not belong to current tenant');
      }
    }

    return this.prisma.exam.create({
      data: {
        ...createExamDto,
        tenantId,
      },
      include: {
        class: true,
        subject: true,
      },
    });
  }

  async update(id: string, updateData: any): Promise<Exam> {
    const tenantId = this.getCurrentTenantId();

    // Verify exam belongs to tenant
    const existingExam = await this.prisma.exam.findFirst({
      where: { id, tenantId },
    });

    if (!existingExam) {
      throw new NotFoundException(`Exam with ID ${id} not found`);
    }

    return this.prisma.exam.update({
      where: { id },
      data: updateData,
      include: {
        class: true,
        examResults: true,
      },
    });
  }

  async remove(id: string): Promise<void> {
    const tenantId = this.getCurrentTenantId();

    // Verify exam belongs to tenant
    const existingExam = await this.prisma.exam.findFirst({
      where: { id, tenantId },
    });

    if (!existingExam) {
      throw new NotFoundException(`Exam with ID ${id} not found`);
    }

    await this.prisma.exam.delete({
      where: { id },
    });
  }

  async addResults(examId: string, createExamResultDto: CreateExamResultDto): Promise<any> {
    const tenantId = this.getCurrentTenantId();
    const results = [];

    // Verify exam belongs to tenant
    const examExists = await this.prisma.exam.findFirst({
      where: { id: examId, tenantId },
    });

    if (!examExists) {
      throw new NotFoundException(`Exam with ID ${examId} not found`);
    }

    for (const result of createExamResultDto.results) {
      // Verify pupil belongs to tenant
      const pupilExists = await this.prisma.pupil.findFirst({
        where: { id: result.pupilId, tenantId },
      });

      if (!pupilExists) {
        throw new BadRequestException(`Pupil with ID ${result.pupilId} does not belong to current tenant`);
      }

      const examResult = await this.prisma.examResult.create({
        data: {
          examId,
          pupilId: result.pupilId,
          marks: result.score,
          grade: result.grade,
          remarks: result.remarks,
          tenantId,
        },
        include: {
          pupil: true,
          exam: true,
        },
      });

      results.push(examResult);
    }

    return results;
  }

  async getResults(examId: string): Promise<any[]> {
    const tenantId = this.getCurrentTenantId();

    // Verify exam belongs to tenant
    const examExists = await this.prisma.exam.findFirst({
      where: { id: examId, tenantId },
    });

    if (!examExists) {
      throw new NotFoundException(`Exam with ID ${examId} not found`);
    }

    return this.prisma.examResult.findMany({
      where: { examId, tenantId },
      include: {
        pupil: true,
        exam: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  private getCurrentTenantId(): string {
    // This should be extracted from JWT token in request context
    // Implementation depends on your auth strategy
    throw new Error('Tenant context extraction not implemented');
  }
}
