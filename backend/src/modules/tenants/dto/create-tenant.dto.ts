import { IsString, Length, Matches } from 'class-validator';

export class CreateTenantDto {
  @IsString()
  @Length(3, 100)
  name: string;

  @IsString()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Subdomain can only contain lowercase letters, numbers, and hyphens'
  })
  @Length(3, 50)
  subdomain: string;
}
