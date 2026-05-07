import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AttendanceService } from './attendance.service';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { Attendance } from '@prisma/client';

@ApiTags('attendance')
@Controller('attendance')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get()
  @ApiOperation({ summary: 'Get all attendance records for current tenant' })
  @ApiResponse({ status: 200, description: 'Return all attendance records.', type: [Attendance] })
  findAll() {
    return this.attendanceService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific attendance record' })
  @ApiResponse({ status: 200, description: 'Return a specific attendance record.', type: Attendance })
  findOne(@Param('id') id: string) {
    return this.attendanceService.findOne(id);
  }

  @Get('class/:classId')
  @ApiOperation({ summary: 'Get attendance records for a specific class' })
  @ApiResponse({ status: 200, description: 'Return attendance records for class.', type: [Attendance] })
  findByClass(@Param('classId') classId: string) {
    return this.attendanceService.findByClass(classId);
  }

  @Get('pupil/:pupilId')
  @ApiOperation({ summary: 'Get attendance records for a specific pupil' })
  @ApiResponse({ status: 200, description: 'Return attendance records for pupil.', type: [Attendance] })
  findByPupil(@Param('pupilId') pupilId: string) {
    return this.attendanceService.findByPupil(pupilId);
  }

  @Post()
  @ApiOperation({ summary: 'Mark attendance for pupils' })
  @ApiResponse({ status: 201, description: 'Attendance marked successfully.', type: [Attendance] })
  markAttendance(@Body() markAttendanceDto: MarkAttendanceDto) {
    return this.attendanceService.markAttendance(markAttendanceDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an attendance record' })
  @ApiResponse({ status: 200, description: 'The attendance record has been successfully updated.', type: Attendance })
  update(@Param('id') id: string, @Body() updateData: any) {
    return this.attendanceService.update(id, updateData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an attendance record' })
  @ApiResponse({ status: 200, description: 'The attendance record has been successfully deleted.' })
  remove(@Param('id') id: string) {
    return this.attendanceService.remove(id);
  }
}
