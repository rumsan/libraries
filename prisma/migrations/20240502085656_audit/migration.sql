-- CreateEnum
CREATE TYPE "Operation" AS ENUM ('CREATE', 'CREATE_MANY', 'UPDATE', 'UPDATE_MANY', 'DELETE', 'DELETE_MANY', 'UPSERT');

-- CreateTable
CREATE TABLE "tbl_audits" (
    "uuid" TEXT NOT NULL,
    "tableName" TEXT NOT NULL,
    "operation" "Operation" NOT NULL,
    "fieldName" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "version" INTEGER NOT NULL,

    CONSTRAINT "tbl_audits_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "tbl_audits_uuid_key" ON "tbl_audits"("uuid");
