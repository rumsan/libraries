/*
  Warnings:

  - Made the column `name` on table `tbl_users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
ALTER TYPE "Service" ADD VALUE 'API';

-- AlterTable
ALTER TABLE "tbl_users" ADD COLUMN     "notes" TEXT,
ALTER COLUMN "name" SET NOT NULL;
