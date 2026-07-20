CREATE TABLE `comments` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text NOT NULL,
	`parent_id` text,
	`nickname` text NOT NULL,
	`password_hash` text NOT NULL,
	`body` text NOT NULL,
	`created_at` text NOT NULL
);
