import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { Attendance } from '@prisma/client';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Attendance[]> {
    const tenantId = this.getCurrentTenantId();
    return this.prisma.attendance.findMany({
      where: { tenantId },
      include: {
        pupil: true,
        class: true,
        marker: true,
      },
    });
  }

  async findOne(id: string): Promise<Attendance> {
    const tenantId = this.getCurrentTenantId();
    const attendance = await this.prisma.attendance.findFirst({
      where: { id, tenantId },
      include: {
        pupil: true,
        class: true,
        marker: true,
      },
    });

    if (!attendance) {
      throw new NotFoundException(`Attendance record with ID ${id} not found`);
    }

    return attendance;
  }

  async findByClass(classId: string): Promise<Attendance[]> {
    const tenantId = this.getCurrentTenantId();
    
    // Verify class belongs to tenant
    const classExists = await this.prisma.class.findFirst({
      where: { id: classId, tenantId },
    });

    if (!classExists) {
      throw new BadRequestException('Class does not belong to current tenant');
    }

    return this.prisma.attendance.findMany({
      where: { classId, tenantId },
      include: {
        pupil: true,
        marker: true,
      },
      orderBy: { date: 'desc' },
    });
  }

  async findByPupil(pupilId: string): Promise<Attendance[]> {
    const tenantId = this.getCurrentTenantId();
    
    // Verify pupil belongs to tenant
    const pupilExists = await this.prisma.pupil.findFirst({
      where: { id: pupilId, tenantId },
    });

    if (!pupilExists) {
      throw new BadRequestException('Pupil does not belong to current tenant');
    }

    return this.prisma.attendance.findMany({
      where: { pupilId, tenantId },
      include: {
        class: true,
        marker: true,
      },
      orderBy: { date: 'desc' },
    });
  }

  async markAttendance(markAttendanceDto: MarkAttendanceDto): Promise<Attendance[]> {
    const tenantId = this.getCurrentTenantId();
    const attendanceRecords = [];

    for (const record of markAttendanceDto.records) {
      // Verify pupil belongs to tenant
      const pupilExists = await this.prisma.pupil.findFirst({
        where: { id: record.pupilId, tenantId },
      });

      if (!pupilExists) {
        throw new BadRequestException(`Pupil with ID ${record.pupilId} does not belong to current tenant`);
      }

      // Verify class belongs to tenant
      const classExists = await this.prisma.class.findFirst({
        where: { id: record.classId, tenantId },
      });

      if (!classExists) {
        throw new BadRequestException(`Class with ID ${record.classId} does not belong to current tenant`);
      }

      const attendanceRecord = await this.prisma.attendance.create({
        data: {
          pupilId: record.pupilId,
          classId: record.classId,
          date: record.date,
          status: record.status,
          markedBy: markAttendanceDto.markedById,
          tenantId,
        },
        include: {
          pupil: true,
          class: true,
          marker: true,
        },
      });

      attendanceRecords.push(attendanceRecord);
    }

    return attendanceRecords;
  }

  async update(id: string, updateData: any): Promise<Attendance> {
    const tenantId = this.getCurrentTenantId();

    // Verify attendance record belongs to tenant
    const existingAttendance = await this.prisma.attendance.findFirst({
      where: { id, tenantId },
    });

    if (!existingAttendance) {
      throw new NotFoundException(`Attendance record with ID ${id} not found`);
    }

    return this.prisma.attendance.update({
      where: { id },
      data: updateData,
      include: {
        pupil: true,
        class: true,
        marker: true,
      },
    });
  }

  async remove(id: string): Promise<void> {
    const tenantId = this.getCurrentTenantId();

    // Verify attendance record belongs to tenant
    const existingAttendance = await this.prisma.attendance.findFirst({
      where: { id, tenantId },
    });

    if (!existingAttendance) {
      throw new NotFoundException(`Attendance record with ID ${id} not found`);
    }

    await this.prisma.attendance.delete({
      where: { id },
    });
  }

  private getCurrentTenantId(): string {
    // This should be extracted from JWT token in request context
    // Implementation depends on your auth strategy
    throw new Error('Tenant context extraction not implemented');
  }
}
