import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Param, 
  Body, 
  HttpCode, 
  HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { UpdateBrandingDto } from './dto/update-branding.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { OnboardTenantDto } from './dto/onboard-tenant.dto';
import { TenantStatus } from './types/tenant-status.enum';

@ApiTags('Tenants')
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post('onboard')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Onboard tenant with master account' })
  @ApiResponse({ status: 201, description: 'Tenant onboarded successfully' })
  @ApiResponse({ status: 409, description: 'Subdomain already taken or email exists' })
  async onboard(@Body() dto: OnboardTenantDto) {
    const result = await this.tenantsService.onboard(dto);
    return {
      success: true,
      data: result,
      error: null,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new tenant' })
  @ApiResponse({ status: 201, description: 'Tenant created successfully' })
  @ApiResponse({ status: 409, description: 'Subdomain already taken' })
  async create(@Body() dto: CreateTenantDto) {
    const tenant = await this.tenantsService.create(dto);
    return {
      success: true,
      data: tenant,
      error: null,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tenant by ID' })
  @ApiParam({ name: 'id', description: 'Tenant ID' })
  @ApiResponse({ status: 200, description: 'Tenant retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async get(@Param('id') id: string) {
    const tenant = await this.tenantsService.findById(id);
    return {
      success: true,
      data: tenant,
      error: null,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update tenant' })
  @ApiParam({ name: 'id', description: 'Tenant ID' })
  @ApiResponse({ status: 200, description: 'Tenant updated successfully' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async update(@Param('id') id: string, @Body() dto: UpdateTenantDto) {
    const tenant = await this.tenantsService.update(id, dto);
    return {
      success: true,
      data: tenant,
      error: null,
    };
  }

  @Patch(':id/branding')
  @ApiOperation({ summary: 'Update tenant branding' })
  @ApiParam({ name: 'id', description: 'Tenant ID' })
  @ApiResponse({ status: 200, description: 'Branding updated successfully' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async updateBranding(@Param('id') id: string, @Body() dto: UpdateBrandingDto) {
    const tenant = await this.tenantsService.updateBranding(id, dto);
    return {
      success: true,
      data: tenant,
      error: null,
    };
  }

  @Patch(':id/settings')
  @ApiOperation({ summary: 'Update tenant settings' })
  @ApiParam({ name: 'id', description: 'Tenant ID' })
  @ApiResponse({ status: 200, description: 'Settings updated successfully' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async updateSettings(@Param('id') id: string, @Body() dto: UpdateSettingsDto) {
    const tenant = await this.tenantsService.updateSettings(id, dto);
    return {
      success: true,
      data: tenant,
      error: null,
    };
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update tenant status' })
  @ApiParam({ name: 'id', description: 'Tenant ID' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async updateStatus(@Param('id') id: string, @Body('status') status: TenantStatus) {
    const tenant = await this.tenantsService.updateStatus(id, status);
    return {
      success: true,
      data: tenant,
      error: null,
    };
  }

  @Get('resolve/:subdomain')
  @ApiOperation({ summary: 'Resolve tenant by subdomain' })
  @ApiParam({ name: 'subdomain', description: 'Subdomain' })
  @ApiResponse({ status: 200, description: 'Tenant resolved successfully' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async resolve(@Param('subdomain') subdomain: string) {
    const tenant = await this.tenantsService.resolve(subdomain);
    return {
      success: true,
      data: tenant,
      error: null,
    };
  }
}
