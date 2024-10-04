import { PrismaClient } from '@prisma/client';
import { UserSeed } from './user.seed';

const prisma = new PrismaClient();

UserSeed(prisma)
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.log(error);
    await prisma.$disconnect();
  });
