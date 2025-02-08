/*
  Warnings:

  - You are about to drop the column `time_id` on the `booking` table. All the data in the column will be lost.
  - Added the required column `waktu_id` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `booking` DROP COLUMN `time_id`,
    ADD COLUMN `waktu_id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_seat_id_fkey` FOREIGN KEY (`seat_id`) REFERENCES `Seat`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_waktu_id_fkey` FOREIGN KEY (`waktu_id`) REFERENCES `Waktu`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
