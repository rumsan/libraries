/*
  Warnings:

  - The primary key for the `tbl_audits` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[id]` on the table `tbl_audits` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "tbl_audits" DROP CONSTRAINT "tbl_audits_pkey";

-- CreateIndex
CREATE UNIQUE INDEX "tbl_audits_id_key" ON "tbl_audits"("id");
