import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExamsService } from './exams.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { CreateExamResultDto } from './dto/create-exam-result.dto';
import { Exam } from '@prisma/client';

@ApiTags('exams')
@Controller('exams')
@UseGuards(JwtAuthGuard)
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all exams for current tenant' })
  @ApiResponse({ status: 200, description: 'Return all exams.', type: [Exam] })
  findAll() {
    return this.examsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific exam' })
  @ApiResponse({ status: 200, description: 'Return a specific exam.', type: Exam })
  findOne(@Param('id') id: string) {
    return this.examsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new exam' })
  @ApiResponse({ status: 201, description: 'The exam has been successfully created.', type: Exam })
  create(@Body() createExamDto: CreateExamDto) {
    return this.examsService.create(createExamDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an exam' })
  @ApiResponse({ status: 200, description: 'The exam has been successfully updated.', type: Exam })
  update(@Param('id') id: string, @Body() updateData: any) {
    return this.examsService.update(id, updateData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an exam' })
  @ApiResponse({ status: 200, description: 'The exam has been successfully deleted.' })
  remove(@Param('id') id: string) {
    return this.examsService.remove(id);
  }

  @Post(':id/results')
  @ApiOperation({ summary: 'Add exam results' })
  @ApiResponse({ status: 201, description: 'Exam results added successfully.' })
  addResults(@Param('id') id: string, @Body() createExamResultDto: CreateExamResultDto) {
    return this.examsService.addResults(id, createExamResultDto);
  }

  @Get(':id/results')
  @ApiOperation({ summary: 'Get exam results' })
  @ApiResponse({ status: 200, description: 'Return exam results.' })
  getResults(@Param('id') id: string) {
    return this.examsService.getResults(id);
  }
}
