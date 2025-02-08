/*
  Warnings:

  - You are about to drop the column `jenis_cinema` on the `cinema` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Seat_room_id_key` ON `seat`;

-- AlterTable
ALTER TABLE `cinema` DROP COLUMN `jenis_cinema`;

-- CreateTable
CREATE TABLE `Movie` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `genre` VARCHAR(191) NOT NULL,
    `judul` VARCHAR(191) NOT NULL,
    `time_id` INTEGER NOT NULL,
    `durasi` VARCHAR(191) NOT NULL,
    `showTime` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Time` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `time` DATETIME(3) NOT NULL,
    `movie_id` INTEGER NOT NULL,
    `room_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
