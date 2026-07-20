CREATE TABLE `guestbook` (
	`id` text PRIMARY KEY NOT NULL,
	`parent_id` text,
	`nickname` text NOT NULL,
	`password_hash` text,
	`body` text NOT NULL,
	`is_owner` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL
);
