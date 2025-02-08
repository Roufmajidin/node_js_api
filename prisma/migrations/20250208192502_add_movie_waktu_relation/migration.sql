-- AddForeignKey
ALTER TABLE `Movie` ADD CONSTRAINT `Movie_time_id_fkey` FOREIGN KEY (`time_id`) REFERENCES `Waktu`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
