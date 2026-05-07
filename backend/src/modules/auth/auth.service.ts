import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/database/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { schoolName, subdomain, email, password, firstName, lastName, phone, address } = registerDto;

    // Check if subdomain is already taken
    const existingTenant = await this.prisma.tenant.findUnique({
      where: { subdomain },
    });

    if (existingTenant) {
      throw new ConflictException('Subdomain already taken');
    }

    // Check if email already exists
    const existingUser = await this.prisma.user.findFirst({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Create tenant
    const tenant = await this.prisma.tenant.create({
      data: {
        name: schoolName,
        subdomain,
        status: 'ACTIVE',
        phone,
        address,
        settings: {
          currency: 'ZMW',
          timezone: 'Africa/Lusaka',
          academicYear: new Date().getFullYear().toString(),
        },
      },
    });

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user (school admin)
    const user = await this.prisma.user.create({
      data: {
        tenantId: tenant.id,
        email,
        passwordHash,
        firstName,
        lastName,
        phone,
        role: 'school_admin',
        emailVerified: false,
      },
    });

    // Enable base features
    const baseFeatures = await this.prisma.feature.findMany({
      where: { isBase: true },
    });

    await this.prisma.tenantFeature.createMany({
      data: baseFeatures.map(feature => ({
        tenantId: tenant.id,
        featureId: feature.id,
        enabled: true,
      })),
    });

    // Generate tokens
    const tokens = await this.generateTokens(user, tenant.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      tenant: {
        id: tenant.id,
        name: tenant.name,
        subdomain: tenant.subdomain,
      },
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password, subdomain } = loginDto;

    // Resolve tenant from subdomain
    const tenant = await this.prisma.tenant.findUnique({
      where: { subdomain: subdomain.toLowerCase() }
    });

    if (!tenant) {
      throw new UnauthorizedException('Tenant not found');
    }

    // Find user within tenant
    const user = await this.prisma.user.findFirst({
      where: { 
        email,
        tenantId: tenant.id 
      },
      include: { tenant: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user, user.tenantId);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId: user.tenantId,
      },
      tenant: user.tenant,
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { tenant: true },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokens = await this.generateTokens(user, user.tenantId);

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          tenantId: user.tenantId,
        },
        tenant: user.tenant,
        ...tokens,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string) {
    // In a real implementation, you might want to invalidate the refresh token
    // For now, we'll just log the activity
    await this.prisma.activityLog.create({
      data: {
        userId,
        action: 'LOGOUT',
        resourceType: 'USER',
        resourceId: userId,
      },
    });
  }

  private async generateTokens(user: any, tenantId: string) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '15m'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
    });

    // Store refresh token in database
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
