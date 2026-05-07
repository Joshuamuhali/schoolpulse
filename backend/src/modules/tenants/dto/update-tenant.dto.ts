import { IsString, IsOptional, Length } from 'class-validator';

export class UpdateTenantDto {
  @IsOptional()
  @IsString()
  @Length(3, 100)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(3, 50)
  subdomain?: string;

  @IsOptional()
  settings?: Record<string, any>;
}
