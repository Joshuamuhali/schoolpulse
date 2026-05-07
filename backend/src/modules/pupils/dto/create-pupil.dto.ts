import { IsString, IsOptional, IsEnum } from 'class-validator';

export class CreatePupilDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  middleName?: string;

  @IsString()
  dateOfBirth: string;

  @IsEnum(['M', 'F'])
  gender: 'M' | 'F';

  @IsString()
  classId: string;

  @IsOptional()
  @IsString()
  parentContact?: string;

  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @IsOptional()
  @IsString()
  medicalInfo?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsString()
  enrollmentDate: string;

  @IsOptional()
  @IsString()
  studentId?: string;

  @IsOptional()
  @IsString()
  profileImage?: string;
}
