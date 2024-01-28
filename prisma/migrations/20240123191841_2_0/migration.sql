/*
  Warnings:

  - You are about to drop the column `expiry` on the `tbl_auth_roles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tbl_auth" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "tbl_auth_roles" DROP COLUMN "expiry";
