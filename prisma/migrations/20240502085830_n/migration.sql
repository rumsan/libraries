/*
  Warnings:

  - The primary key for the `tbl_audits` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "tbl_audits" DROP CONSTRAINT "tbl_audits_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "tbl_audits_pkey" PRIMARY KEY ("id");
