CREATE TABLE `friend_request` (
	`id` text PRIMARY KEY NOT NULL,
	`sender_id` text NOT NULL,
	`receiver_id` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)),
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)),
	FOREIGN KEY (`sender_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`receiver_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "friend_request_no_self" CHECK("friend_request"."sender_id" != "friend_request"."receiver_id")
);
--> statement-breakpoint
CREATE UNIQUE INDEX `friend_request_pair_idx` ON `friend_request` (`sender_id`,`receiver_id`);--> statement-breakpoint
CREATE INDEX `friend_request_receiverId_idx` ON `friend_request` (`receiver_id`);--> statement-breakpoint
CREATE INDEX `friend_request_status_idx` ON `friend_request` (`status`);--> statement-breakpoint
ALTER TABLE `conversation` ADD `user_a_last_read_at` integer;--> statement-breakpoint
ALTER TABLE `conversation` ADD `user_b_last_read_at` integer;--> statement-breakpoint
INSERT INTO `friend_request` (`id`, `sender_id`, `receiver_id`, `status`, `created_at`, `updated_at`)
SELECT lower(hex(randomblob(16))), f1.`follower_id`, f1.`followed_id`, 'accepted', f1.`created_at`, f1.`created_at`
FROM `follow` f1
WHERE f1.`follower_id` < f1.`followed_id`;--> statement-breakpoint
DROP TABLE IF EXISTS `follow`;
