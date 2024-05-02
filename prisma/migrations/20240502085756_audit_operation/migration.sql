/*
  Warnings:

  - Changed the type of `operation` on the `tbl_audits` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "AuditOperation" AS ENUM ('CREATE', 'CREATE_MANY', 'UPDATE', 'UPDATE_MANY', 'DELETE', 'DELETE_MANY', 'UPSERT');

-- AlterTable
ALTER TABLE "tbl_audits" DROP COLUMN "operation",
ADD COLUMN     "operation" "AuditOperation" NOT NULL;

-- DropEnum
DROP TYPE "Operation";
