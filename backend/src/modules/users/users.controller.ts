import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Delete, 
  Param, 
  Query, 
  Body, 
  HttpCode, 
  HttpStatus,
  UseGuards,
  Request
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UserRole, UserStatus } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('school_admin', 'super_admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser() user: any,
  ) {
    const newUser = await this.usersService.createUser(createUserDto, user?.tenantId);
    return {
      success: true,
      data: newUser,
      error: null,
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async getUser(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    const userRecord = await this.usersService.getUserById(id, user?.tenantId);
    return {
      success: true,
      data: userRecord,
      error: null,
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List users with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, description: 'Search query' })
  @ApiQuery({ name: 'role', required: false, description: 'Filter by role' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async listUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('search') search?: string,
    @Query('role') role?: UserRole,
    @Query('status') status?: UserStatus,
    @CurrentUser() user: any,
  ) {
    const result = await this.usersService.listUsers(
      page, 
      limit, 
      search, 
      role, 
      status, 
      user?.tenantId
    );
    return {
      success: true,
      data: result,
      error: null,
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('school_admin', 'super_admin')
  @ApiOperation({ summary: 'Update user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: any,
  ) {
    const updatedUser = await this.usersService.updateUser(
      id, 
      updateUserDto, 
      user?.tenantId
    );
    return {
      success: true,
      data: updatedUser,
      error: null,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('school_admin', 'super_admin')
  @ApiOperation({ summary: 'Delete user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 400, description: 'Cannot delete own account' })
  async deleteUser(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    const result = await this.usersService.deleteUser(id, user?.tenantId);
    return {
      success: true,
      data: result,
      error: null,
    };
  }

  @Patch(':id/role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('school_admin', 'super_admin')
  @ApiOperation({ summary: 'Assign role to user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Role assigned successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async assignRole(
    @Param('id') userId: string,
    @Body('role') role: UserRole,
    @CurrentUser() user: any,
  ) {
    const result = await this.usersService.assignRole(userId, role, user?.tenantId);
    return {
      success: true,
      data: result,
      error: null,
    };
  }

  @Get(':id/activity')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user activity log' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Activity retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async getUserActivity(
    @Param('id') userId: string,
    @CurrentUser() user: any,
  ) {
    const activity = await this.usersService.getUserActivity(userId, user?.tenantId);
    return {
      success: true,
      data: activity,
      error: null,
    };
  }

  @Patch(':id/password')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Change user password' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 400, description: 'Current password incorrect' })
  async changePassword(
    @Param('id') userId: string,
    @Body('currentPassword') currentPassword: string,
    @Body('newPassword') newPassword: string,
    @CurrentUser() user: any,
  ) {
    const result = await this.usersService.changePassword(
      userId, 
      currentPassword, 
      newPassword, 
      user?.tenantId
    );
    return {
      success: true,
      data: result,
      error: null,
    };
  }

  @Get('role/:role')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get users by role' })
  @ApiParam({ name: 'role', description: 'User role' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async getUsersByRole(
    @Param('role') role: UserRole,
    @CurrentUser() user: any,
  ) {
    const result = await this.usersService.getUsersByRole(role, user?.tenantId);
    return {
      success: true,
      data: result,
      error: null,
    };
  }

  @Get('search/:query')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Search users' })
  @ApiParam({ name: 'query', description: 'Search query' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async searchUsers(
    @Param('query') query: string,
    @CurrentUser() user: any,
  ) {
    const result = await this.usersService.searchUsers(query, user?.tenantId);
    return {
      success: true,
      data: result,
      error: null,
    };
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('school_admin', 'super_admin')
  @ApiOperation({ summary: 'Get user statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async getUserStats(@CurrentUser() user: any) {
    const stats = await this.usersService.getUserStats(user?.tenantId);
    return {
      success: true,
      data: stats,
      error: null,
    };
  }
}
