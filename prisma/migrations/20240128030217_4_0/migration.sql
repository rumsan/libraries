/*
  Warnings:

  - Changed the type of `dataType` on the `tbl_settings` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "SettingDataType" AS ENUM ('STRING', 'NUMBER', 'BOOLEAN', 'OBJECT');

-- AlterTable
ALTER TABLE "tbl_settings" DROP COLUMN "dataType",
ADD COLUMN     "dataType" "SettingDataType" NOT NULL;
