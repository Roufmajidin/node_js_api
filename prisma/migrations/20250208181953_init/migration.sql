-- DropForeignKey
ALTER TABLE `room` DROP FOREIGN KEY `Room_cinema_id_fkey`;

-- DropForeignKey
ALTER TABLE `seat` DROP FOREIGN KEY `Seat_room_id_fkey`;

-- DropIndex
DROP INDEX `Room_cinema_id_fkey` ON `room`;
