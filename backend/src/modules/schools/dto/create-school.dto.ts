import { IsString, IsOptional, IsEmail } from 'class-validator';

export class CreateSchoolDto {
  @IsString()
  name: string;

  @IsString()
  subdomain: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  primaryColor?: string;

  @IsOptional()
  @IsString()
  secondaryColor?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  settings?: any;

  @IsOptional()
  @IsString()
  status?: string;
}
