/*
  Warnings:

  - You are about to alter the column `durasi` on the `movie` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `tahun` on the `movie` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `movie` MODIFY `durasi` INTEGER NOT NULL,
    MODIFY `tahun` INTEGER NOT NULL;
