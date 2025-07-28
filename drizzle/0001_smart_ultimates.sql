CREATE TABLE `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`color` text NOT NULL,
	`icon` text
);
--> statement-breakpoint
CREATE TABLE `event_categories` (
	`event_id` integer NOT NULL,
	`category_id` integer NOT NULL,
	PRIMARY KEY(`event_id`, `category_id`),
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
