/*
  Warnings:

  - Changed the type of `updatedBy` on the `tbl_audits` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "tbl_audits" DROP COLUMN "updatedBy",
ADD COLUMN     "updatedBy" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "tbl_audits" ADD CONSTRAINT "tbl_audits_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "tbl_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
