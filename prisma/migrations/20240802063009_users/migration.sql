-- AlterTable
ALTER TABLE "tbl_users" ADD COLUMN     "deletedBy" TEXT,
ALTER COLUMN "createdBy" SET DATA TYPE TEXT,
ALTER COLUMN "updatedBy" SET DATA TYPE TEXT;
