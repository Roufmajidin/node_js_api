/*
  Warnings:

  - You are about to drop the column `time_id` on the `movie` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `movie` DROP FOREIGN KEY `Movie_time_id_fkey`;

-- DropIndex
DROP INDEX `Movie_time_id_fkey` ON `movie`;

-- AlterTable
ALTER TABLE `movie` DROP COLUMN `time_id`;

-- AddForeignKey
ALTER TABLE `Waktu` ADD CONSTRAINT `Waktu_movie_id_fkey` FOREIGN KEY (`movie_id`) REFERENCES `Movie`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Waktu` ADD CONSTRAINT `Waktu_room_id_fkey` FOREIGN KEY (`room_id`) REFERENCES `Room`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
