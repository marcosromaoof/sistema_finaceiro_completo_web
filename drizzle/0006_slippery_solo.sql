CREATE TABLE `bans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`bannedBy` int NOT NULL,
	`reason` text NOT NULL,
	`type` enum('temporary','permanent') NOT NULL,
	`expiresAt` timestamp,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `bans_userId_idx` ON `bans` (`userId`);--> statement-breakpoint
CREATE INDEX `bans_bannedBy_idx` ON `bans` (`bannedBy`);