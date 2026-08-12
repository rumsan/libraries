/*
  Warnings:

  - A unique constraint covering the columns `[userId,roleId,xrefId]` on the table `tbl_users_roles` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "tbl_users_roles" ADD COLUMN     "xrefId" TEXT;

-- DropIndex
DROP INDEX "tbl_users_roles_userId_roleId_key";

-- CreateIndex
CREATE UNIQUE INDEX "tbl_users_roles_userId_roleId_xrefId_key" ON "tbl_users_roles"("userId", "roleId", "xrefId");
