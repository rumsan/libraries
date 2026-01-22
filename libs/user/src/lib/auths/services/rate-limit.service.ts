import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Service } from '@prisma/client';
import { PrismaService } from '@rumsan/prisma';

@Injectable()
export class RateLimitService {
  constructor(private prisma: PrismaService) {}

  /**
   * Check if IP has exceeded rate limit
   * Limit: 10 failed attempts per 5 minutes
   */
  async checkIpRateLimit(ip: string): Promise<void> {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const attemptCount = await (this.prisma as any).loginAttempt.count({
      where: {
        ip,
        success: false,
        createdAt: { gte: fiveMinutesAgo }
      }
    });
    
    if (attemptCount >= 10) {
      throw new HttpException(
        'Too many failed login attempts from your IP address. Please try again in 5 minutes.',
        HttpStatus.TOO_MANY_REQUESTS
      );
    }
  }

  /**
   * Check if identifier (username) has exceeded rate limit
   * Limit: 20 failed attempts per 15 minutes (across all IPs)
   */
  async checkIdentifierRateLimit(identifier: string, service: Service): Promise<void> {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    
    const attemptCount = await (this.prisma as any).loginAttempt.count({
      where: {
        identifier,
        service,
        success: false,
        createdAt: { gte: fifteenMinutesAgo }
      }
    });
    
    if (attemptCount >= 20) {
      throw new HttpException(
        'Too many failed login attempts for this account. Please try again in 15 minutes.',
        HttpStatus.TOO_MANY_REQUESTS
      );
    }
  }

  /**
   * Log a login attempt for rate limiting and audit
   */
  async logAttempt(data: {
    authId?: number;
    identifier: string;
    service: Service;
    ip: string;
    userAgent?: string;
    success: boolean;
    failReason?: string;
  }): Promise<void> {
    await (this.prisma as any).loginAttempt.create({ data });
    
    // Cleanup: Delete attempts older than 24 hours (background task)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await (this.prisma as any).loginAttempt.deleteMany({
      where: { createdAt: { lt: yesterday } }
    }).catch(() => {
      // Silent fail for cleanup - don't block login
    });
  }
}
