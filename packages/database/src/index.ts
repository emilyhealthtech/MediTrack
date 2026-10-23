import { PrismaClient } from '@prisma/client';

export const db: any = new PrismaClient();
export * from '@prisma/client';
