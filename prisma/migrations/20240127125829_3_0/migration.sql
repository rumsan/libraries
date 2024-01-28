/*
  Warnings:

  - Added the required column `dataType` to the `tbl_settings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tbl_settings" ADD COLUMN     "dataType" TEXT NOT NULL;
