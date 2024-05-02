/*
  Warnings:

  - You are about to drop the column `uuid` on the `tbl_audits` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "tbl_audits_uuid_key";

-- AlterTable
ALTER TABLE "tbl_audits" DROP COLUMN "uuid";
