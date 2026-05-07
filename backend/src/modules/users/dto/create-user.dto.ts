import { IsString, IsEmail, IsEnum, IsOptional, MinLength, Matches } from 'class-validator';

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  SCHOOL_ADMIN = 'school_admin',
  PRINCIPAL = 'principal',
  BURSAR = 'bursar',
  TEACHER = 'teacher',
  PARENT = 'parent',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  firstName: string;

  @IsString()
  @MinLength(2)
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsOptional()
  @IsString()
  @MinLength(10)
  phone?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  department?: string;

  @IsOptional()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Employee ID can only contain lowercase letters, numbers, and hyphens'
  })
  employeeId?: string;

  @IsOptional()
  @IsString()
  qualifications?: string[];

  @IsOptional()
  @IsString()
  joinDate?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus = UserStatus.ACTIVE;

  @IsOptional()
  @IsString()
  tenantId?: string;
}
