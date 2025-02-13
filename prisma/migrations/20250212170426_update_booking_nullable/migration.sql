-- AlterTable
ALTER TABLE `booking` ADD COLUMN `expired` INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN `method_payment` VARCHAR(191) NULL,
    ADD COLUMN `qr_code` VARCHAR(191) NULL;
