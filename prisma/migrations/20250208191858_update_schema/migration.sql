/*
  Warnings:

  - You are about to drop the column `cinema_id` on the `room` table. All the data in the column will be lost.
  - You are about to drop the `cinema` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `time` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE `room` DROP COLUMN `cinema_id`;

-- DropTable
DROP TABLE `cinema`;

-- DropTable
DROP TABLE `time`;

-- CreateTable
CREATE TABLE `waktu` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `time` DATETIME(3) NOT NULL,
    `movie_id` INTEGER NOT NULL,
    `room_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
