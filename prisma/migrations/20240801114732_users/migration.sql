/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `tbl_users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tbl_users" DROP COLUMN "deletedAt",
ALTER COLUMN "createdBy" SET DATA TYPE TEXT,
ALTER COLUMN "updatedBy" SET DATA TYPE TEXT;
