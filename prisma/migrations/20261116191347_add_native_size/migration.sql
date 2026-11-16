/*
  Warnings:

  - Added the required column `authorId` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nativeSize` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "File" ADD COLUMN     "authorId" INTEGER NOT NULL,
ADD COLUMN     "nativeSize" INTEGER NOT NULL,
ALTER COLUMN "size" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
