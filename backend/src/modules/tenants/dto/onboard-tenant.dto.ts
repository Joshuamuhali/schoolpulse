import { IsString, IsEmail, MinLength, Matches } from 'class-validator';

export class OnboardTenantDto {
  @IsString()
  @MinLength(3)
  schoolName: string;

  @IsString()
  @MinLength(3)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Subdomain can only contain lowercase letters, numbers, and hyphens'
  })
  subdomain: string;

  @IsString()
  @MinLength(2)
  adminName: string;

  @IsEmail()
  adminEmail: string;

  @IsString()
  @MinLength(8)
  adminPassword: string;
}
