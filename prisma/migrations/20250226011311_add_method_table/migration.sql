/*
  Warnings:

  - You are about to drop the column `method_payment` on the `booking` table. All the data in the column will be lost.
  - You are about to drop the column `seat_id` on the `booking` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `booking` table. All the data in the column will be lost.
  - You are about to drop the column `waktu_id` on the `booking` table. All the data in the column will be lost.
  - Added the required column `data` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mp_id` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `booking` DROP FOREIGN KEY `Booking_seat_id_fkey`;

-- DropForeignKey
ALTER TABLE `booking` DROP FOREIGN KEY `Booking_waktu_id_fkey`;

-- DropIndex
DROP INDEX `Booking_seat_id_fkey` ON `booking`;

-- DropIndex
DROP INDEX `Booking_waktu_id_fkey` ON `booking`;

-- AlterTable
ALTER TABLE `booking` DROP COLUMN `method_payment`,
    DROP COLUMN `seat_id`,
    DROP COLUMN `user_id`,
    DROP COLUMN `waktu_id`,
    ADD COLUMN `data` TEXT NOT NULL,
    ADD COLUMN `mp_id` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `Method` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Order` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `booking_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `total_price` INTEGER NOT NULL,
    `link_pay` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_mp_id_fkey` FOREIGN KEY (`mp_id`) REFERENCES `Method`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `Booking`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
