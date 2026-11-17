-- AlterTable
ALTER TABLE "File" ADD COLUMN     "public" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Folder" ADD COLUMN     "public" BOOLEAN NOT NULL DEFAULT false;
