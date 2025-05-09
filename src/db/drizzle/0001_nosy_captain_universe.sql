PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`date` integer NOT NULL,
	`tags` text
);
--> statement-breakpoint
INSERT INTO `__new_events`("id", "name", "date", "tags") SELECT "id", "name", "date", "tags" FROM `events`;--> statement-breakpoint
DROP TABLE `events`;--> statement-breakpoint
ALTER TABLE `__new_events` RENAME TO `events`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `payments` ADD `date` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `payments` DROP COLUMN `created_at`;--> statement-breakpoint
ALTER TABLE `payments` DROP COLUMN `updated_at`;