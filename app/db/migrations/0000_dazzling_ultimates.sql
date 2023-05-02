CREATE TABLE `credentials` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` integer,
	`name` text,
	`external_id` text,
	`public_key` blob,
	`sign_count` integer DEFAULT 0,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY NOT NULL,
	`email` text,
	`username` text,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_external_id` ON `credentials` (`external_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_public_key` ON `credentials` (`public_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_user` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_username` ON `users` (`username`);