import { ApiProperty } from '@nestjs/swagger';

export class TenantEntity {
  @ApiProperty({ description: 'Tenant unique identifier' })
  id: string;

  @ApiProperty({ description: 'School name' })
  name: string;

  @ApiProperty({ description: 'Subdomain for multi-tenancy' })
  subdomain: string;

  @ApiProperty({ description: 'Tenant status' })
  status: 'active' | 'suspended';

  @ApiProperty({ description: 'School phone number', required: false })
  phone?: string;

  @ApiProperty({ description: 'School email address', required: false })
  email?: string;

  @ApiProperty({ description: 'School physical address', required: false })
  address?: string;

  @ApiProperty({ description: 'School logo URL', required: false })
  logoUrl?: string;

  @ApiProperty({ description: 'School configuration settings' })
  settings: Record<string, any>;

  @ApiProperty({ description: 'Tenant creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export class TenantWithFeatures extends TenantEntity {
  @ApiProperty({ description: 'Enabled features for this tenant' })
  tenantFeatures: Array<{
    id: string;
    enabled: boolean;
    subscribedAt: Date;
    feature: {
      code: string;
      name: string;
      description?: string;
      price: number;
      isBase: boolean;
    };
  }>;
}

export class TenantStats {
  @ApiProperty({ description: 'Tenant ID' })
  tenantId: string;

  @ApiProperty({ description: 'Number of users' })
  users: number;

  @ApiProperty({ description: 'Number of pupils' })
  pupils: number;

  @ApiProperty({ description: 'Number of teachers' })
  teachers: number;

  @ApiProperty({ description: 'Number of classes' })
  classes: number;

  @ApiProperty({ description: 'Number of active features' })
  activeFeatures: number;

  @ApiProperty({ description: 'Last updated timestamp' })
  lastUpdated: Date;
}

export class TenantListResponse {
  @ApiProperty({ description: 'Array of tenants' })
  items: TenantEntity[];

  @ApiProperty({ description: 'Pagination information' })
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export class TenantResolution {
  @ApiProperty({ description: 'Tenant ID' })
  id: string;

  @ApiProperty({ description: 'School name' })
  name: string;

  @ApiProperty({ description: 'Subdomain' })
  subdomain: string;

  @ApiProperty({ description: 'Tenant settings' })
  settings: Record<string, any>;

  @ApiProperty({ description: 'Tenant status' })
  status: 'active' | 'suspended';
}
