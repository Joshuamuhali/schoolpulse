import { Injectable, ConflictException, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { CreateUserDto, UserRole, UserStatus } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new user with tenant isolation
   */
  async createUser(createUserDto: CreateUserDto, adminTenantId?: string) {
    const { 
      tenantId, 
      email, 
      password, 
      firstName, 
      lastName, 
      role, 
      phone, 
      department, 
      employeeId, 
      qualifications, 
      joinDate, 
      address, 
      status 
    } = createUserDto;

    // Enforce tenant isolation - only school_admin and super_admin can create users
    if (adminTenantId && adminTenantId !== tenantId) {
      throw new ForbiddenException('Cannot create user for different tenant');
    }

    // Check if email already exists in tenant
    const existingUser = await this.prisma.user.findFirst({
      where: { 
        tenantId,
        email,
      },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists in this tenant');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        tenantId,
        email,
        passwordHash,
        firstName,
        lastName,
        role: role || UserRole.TEACHER,
        phone,
        department,
        employeeId,
        qualifications: qualifications || [],
        joinDate: joinDate ? new Date(joinDate) : new Date(),
        address,
        status: status || UserStatus.ACTIVE,
        emailVerified: false,
      },
    });

    // Remove sensitive data from response
    const { passwordHash: _, ...userResponse } = user;

    return userResponse;
  }

  /**
   * Get user by ID with tenant isolation
   */
  async getUserById(id: string, userTenantId?: string) {
    // Users can only access their own tenant data (except super_admin)
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            subdomain: true,
          },
        },
        _count: {
          select: {
            // Add related data counts if needed
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Enforce tenant isolation
    if (userTenantId && user.tenantId !== userTenantId) {
      const requestingUser = await this.prisma.user.findUnique({
        where: { id: userTenantId },
        select: { role: true },
      });

      // Super admin can access any user
      if (requestingUser?.role !== 'super_admin') {
        throw new ForbiddenException('Access denied: Cannot access user from different tenant');
      }
    }

    return user;
  }

  /**
   * List users with tenant isolation and pagination
   */
  async listUsers(
    page: number = 1,
    limit: number = 50,
    search?: string,
    role?: UserRole,
    status?: UserStatus,
    userTenantId?: string
  ) {
    const skip = (page - 1) * limit;

    // Build where clause with tenant isolation
    const where: any = {
      tenantId: userTenantId,
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (status) {
      where.status = status;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
              subdomain: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update user with tenant isolation
   */
  async updateUser(id: string, updateUserDto: UpdateUserDto, userTenantId?: string) {
    // Get existing user
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Enforce tenant isolation
    if (userTenantId && existingUser.tenantId !== userTenantId) {
      const requestingUser = await this.prisma.user.findUnique({
        where: { id: userTenantId },
        select: { role: true },
      });

      if (requestingUser?.role !== 'super_admin') {
        throw new ForbiddenException('Access denied: Cannot update user from different tenant');
      }
    }

    // If updating email, check uniqueness
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const emailExists = await this.prisma.user.findFirst({
        where: { 
          tenantId: existingUser.tenantId,
          email: updateUserDto.email,
        },
      });

      if (emailExists) {
        throw new ConflictException('Email already exists in this tenant');
      }
    }

    // Hash new password if provided
    let updateData: any = {
      ...updateUserDto,
      updatedAt: new Date(),
    };

    if (updateUserDto.password) {
      updateData.passwordHash = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            subdomain: true,
          },
        },
      },
    });

    // Remove sensitive data from response
    const { passwordHash: _, ...userResponse } = updatedUser;

    return userResponse;
  }

  /**
   * Delete user with tenant isolation
   */
  async deleteUser(id: string, userTenantId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Enforce tenant isolation
    if (userTenantId && user.tenantId !== userTenantId) {
      const requestingUser = await this.prisma.user.findUnique({
        where: { id: userTenantId },
        select: { role: true },
      });

      if (requestingUser?.role !== 'super_admin') {
        throw new ForbiddenException('Access denied: Cannot delete user from different tenant');
      }
    }

    // Prevent self-deletion
    if (userTenantId === id) {
      throw new BadRequestException('Cannot delete your own account');
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return {
      id,
      message: 'User deleted successfully',
    };
  }

  /**
   * Assign role to user
   */
  async assignRole(userId: string, role: UserRole, adminTenantId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Enforce tenant isolation
    if (adminTenantId && user.tenantId !== adminTenantId) {
      throw new ForbiddenException('Access denied: Cannot modify user from different tenant');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { 
        role,
        updatedAt: new Date(),
      },
    });

    return {
      id: userId,
      role,
      message: 'Role assigned successfully',
    };
  }

  /**
   * Get user activity log
   */
  async getUserActivity(userId: string, userTenantId?: string) {
    const user = await this.getUserById(userId, userTenantId);

    const activities = await this.prisma.activityLog.findMany({
      where: { 
        userId,
        tenantId: user.tenantId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });

    return {
      userId,
      activities,
    };
  }

  /**
   * Change user password
   */
  async changePassword(
    userId: string, 
    currentPassword: string, 
    newPassword: string,
    userTenantId?: string
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Enforce tenant isolation
    if (userTenantId && user.tenantId !== userTenantId) {
      throw new ForbiddenException('Access denied: Cannot modify user from different tenant');
    }

    // Users can only change their own password
    if (userTenantId !== userId) {
      throw new ForbiddenException('Access denied: Cannot change other user password');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
        updatedAt: new Date(),
      },
    });

    return {
      message: 'Password changed successfully',
    };
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role: UserRole, userTenantId: string) {
    return this.listUsers(1, 50, undefined, role, undefined, userTenantId);
  }

  /**
   * Search users across all fields
   */
  async searchUsers(query: string, userTenantId: string) {
    return this.listUsers(1, 50, query, undefined, undefined, userTenantId);
  }

  /**
   * Get user statistics
   */
  async getUserStats(userTenantId: string) {
    const [
      totalUsers,
      activeUsers,
      usersByRole,
    ] = await Promise.all([
      this.prisma.user.count({
        where: { tenantId: userTenantId },
      }),
      this.prisma.user.count({
        where: { 
          tenantId: userTenantId,
          status: UserStatus.ACTIVE,
        },
      }),
      this.prisma.user.groupBy({
        where: { tenantId: userTenantId },
        by: ['role'],
        _count: true,
      }),
    ]);

    return {
      tenantId: userTenantId,
      total: totalUsers,
      active: activeUsers,
      byRole: usersByRole,
      lastUpdated: new Date(),
    };
  }
}
