import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PupilsService } from './pupils.service';
import { CreatePupilDto } from './dto/create-pupil.dto';
import { UpdatePupilDto } from './dto/update-pupil.dto';
import { Pupil } from '@prisma/client';

@ApiTags('pupils')
@Controller('pupils')
@UseGuards(JwtAuthGuard)
export class PupilsController {
  constructor(private readonly pupilsService: PupilsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all pupils for current tenant' })
  @ApiResponse({ status: 200, description: 'Return all pupils.', type: [Pupil] })
  findAll() {
    return this.pupilsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific pupil' })
  @ApiResponse({ status: 200, description: 'Return a specific pupil.', type: Pupil })
  findOne(@Param('id') id: string) {
    return this.pupilsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new pupil' })
  @ApiResponse({ status: 201, description: 'The pupil has been successfully created.', type: Pupil })
  create(@Body() createPupilDto: CreatePupilDto) {
    return this.pupilsService.create(createPupilDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a pupil' })
  @ApiResponse({ status: 200, description: 'The pupil has been successfully updated.', type: Pupil })
  update(@Param('id') id: string, @Body() updatePupilDto: UpdatePupilDto) {
    return this.pupilsService.update(id, updatePupilDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a pupil' })
  @ApiResponse({ status: 200, description: 'The pupil has been successfully deleted.' })
  remove(@Param('id') id: string) {
    return this.pupilsService.remove(id);
  }
}
