-- CreateTable
CREATE TABLE "tbl_settings" (
    "name" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "requiredFields" TEXT[],
    "isReadOnly" BOOLEAN NOT NULL DEFAULT false,
    "isPrivate" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "tbl_settings_pkey" PRIMARY KEY ("name")
);

-- CreateIndex
CREATE UNIQUE INDEX "tbl_settings_name_key" ON "tbl_settings"("name");
