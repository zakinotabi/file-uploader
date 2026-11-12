/*
  Warnings:

  - You are about to drop the column `file` on the `Files` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[storageKey]` on the table `Files` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `mimeType` to the `Files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `Files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storageKey` to the `Files` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Files" DROP COLUMN "file",
ADD COLUMN     "mimeType" TEXT NOT NULL,
ADD COLUMN     "size" INTEGER NOT NULL,
ADD COLUMN     "storageKey" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Files_storageKey_key" ON "Files"("storageKey");
