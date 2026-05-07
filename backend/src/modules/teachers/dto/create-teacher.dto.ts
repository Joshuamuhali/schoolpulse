import { IsString, IsOptional, IsEmail } from 'class-validator';

export class CreateTeacherDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  middleName?: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  phone?: string;

  @IsString()
  employeeId: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  qualification?: string;

  @IsOptional()
  @IsString()
  specialization?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  profileImage?: string;

  @IsString()
  hireDate: string;

  @IsOptional()
  @IsString()
  status?: string;
}
