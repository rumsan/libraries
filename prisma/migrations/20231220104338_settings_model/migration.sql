/*
  Warnings:

  - The values [Email,Phone,Wallet] on the enum `AuthType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AuthType_new" AS ENUM ('EMAIL', 'PHONE', 'WALLET');
ALTER TABLE "users" ALTER COLUMN "authType" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "authType" TYPE "AuthType_new" USING ("authType"::text::"AuthType_new");
ALTER TYPE "AuthType" RENAME TO "AuthType_old";
ALTER TYPE "AuthType_new" RENAME TO "AuthType";
DROP TYPE "AuthType_old";
ALTER TABLE "users" ALTER COLUMN "authType" SET DEFAULT 'EMAIL';
COMMIT;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "authType" SET DEFAULT 'EMAIL';

-- CreateTable
CREATE TABLE "Settings" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "requiredFields" TEXT[],
    "isReadOnly" BOOLEAN NOT NULL DEFAULT false,
    "isPrivate" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Settings_name_key" ON "Settings"("name");
