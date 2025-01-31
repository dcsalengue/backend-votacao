/*
  Warnings:

  - You are about to drop the column `created_at` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `modified_at` on the `usuarios` table. All the data in the column will be lost.
  - Added the required column `createdAt` to the `usuarios` table without a default value. This is not possible if the table is not empty.
  - Added the required column `modifiedAt` to the `usuarios` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "usuarios" DROP COLUMN "created_at",
DROP COLUMN "modified_at",
ADD COLUMN     "createdAt" TIMESTAMP(6) NOT NULL,
ADD COLUMN     "modifiedAt" TIMESTAMP(6) NOT NULL;
