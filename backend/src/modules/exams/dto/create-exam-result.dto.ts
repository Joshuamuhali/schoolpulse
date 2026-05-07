import { IsString, IsOptional, IsNumber } from 'class-validator';

export class ExamResultDto {
  @IsString()
  pupilId: string;

  @IsOptional()
  @IsNumber()
  score?: number;

  @IsOptional()
  @IsString()
  grade?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}

export class CreateExamResultDto {
  results: ExamResultDto[];
}
