import { IsString, IsOptional } from 'class-validator';

export class CreateClassDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  grade: string;

  @IsOptional()
  @IsString()
  section?: string;

  @IsOptional()
  @IsString()
  room?: string;

  @IsOptional()
  @IsString()
  teacherId?: string;

  @IsOptional()
  @IsString()
  academicYear: string;

  @IsOptional()
  @IsString()
  term?: string;

  @IsOptional()
  @IsString()
  schedule?: string;

  @IsOptional()
  @IsString()
  subjects?: string;

  @IsOptional()
  @IsString()
  capacity?: number;

  @IsOptional()
  @IsString()
  status?: string;
}
