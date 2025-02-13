/*
  Warnings:

  - Added the required column `actor_u` to the `Movie` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sinopsis` to the `Movie` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tahun` to the `Movie` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `movie` ADD COLUMN `actor_u` VARCHAR(191) NOT NULL,
    ADD COLUMN `gambar` VARCHAR(191) NULL,
    ADD COLUMN `sinopsis` VARCHAR(191) NOT NULL,
    ADD COLUMN `tahun` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `waktu` ADD COLUMN `status` INTEGER NOT NULL DEFAULT 0;
