DROP INDEX IF EXISTS `idx_user`;--> statement-breakpoint
CREATE UNIQUE INDEX `idx_email` ON `users` (`email`);