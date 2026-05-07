import { IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateExamDto {
  @IsString()
  title: string;

  @IsString()
  description?: string;

  @IsString()
  examDate: string;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsOptional()
  @IsString()
  classId?: string;

  @IsOptional()
  @IsString()
  subjectId?: string;

  @IsEnum(['quiz', 'midterm', 'final', 'practical'])
  type: 'quiz' | 'midterm' | 'final' | 'practical';

  @IsOptional()
  @IsString()
  totalMarks?: number;

  @IsOptional()
  @IsString()
  passingMarks?: number;

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
