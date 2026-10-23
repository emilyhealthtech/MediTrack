import crypto from 'crypto';
import argon2 from 'argon2';
import { generateSecret, generateURI, verify } from 'otplib';

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16, // 64 MB
      timeCost: 3,
      parallelism: 4,
    });
  }

  static async verifyPassword(hash: string, plain: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, plain);
    } catch {
      return false;
    }
  }

  static generateRandomToken(bytes: number = 32): string {
    return crypto.randomBytes(bytes).toString('hex');
  }

  static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  static generateMfaSecret(): string {
    return generateSecret();
  }

  static generateMfaOtpAuthUrl(email: string, secret: string): string {
    return generateURI({
      secret,
      label: email,
      issuer: 'MediTrack Healthcare',
    });
  }

  static verifyMfaToken(token: string, secret: string): boolean {
    try {
      const result = verify({ token, secret });
      return Boolean(result && (result as any).valid !== false);
    } catch {
      return false;
    }
  }

  static generateRecoveryCodes(count: number = 8): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
    }
    return codes;
  }
}
