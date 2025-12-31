CREATE TABLE `achievementProgress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`achievementType` varchar(100) NOT NULL,
	`level` enum('bronze','silver','gold') NOT NULL,
	`currentProgress` int NOT NULL DEFAULT 0,
	`targetProgress` int NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `achievementProgress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `achievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`achievementType` varchar(100) NOT NULL,
	`level` enum('bronze','silver','gold') NOT NULL,
	`xpEarned` int NOT NULL,
	`unlockedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `achievements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userProgress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`totalXp` int NOT NULL DEFAULT 0,
	`currentLevel` int NOT NULL DEFAULT 1,
	`currentStreak` int NOT NULL DEFAULT 0,
	`longestStreak` int NOT NULL DEFAULT 0,
	`lastActivityDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userProgress_id` PRIMARY KEY(`id`),
	CONSTRAINT `userProgress_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE INDEX `achievementProgress_userId_idx` ON `achievementProgress` (`userId`);--> statement-breakpoint
CREATE INDEX `achievementProgress_userId_type_idx` ON `achievementProgress` (`userId`,`achievementType`);--> statement-breakpoint
CREATE INDEX `achievements_userId_idx` ON `achievements` (`userId`);--> statement-breakpoint
CREATE INDEX `achievements_type_idx` ON `achievements` (`achievementType`);--> statement-breakpoint
CREATE INDEX `achievements_userId_type_idx` ON `achievements` (`userId`,`achievementType`);--> statement-breakpoint
CREATE INDEX `userProgress_userId_idx` ON `userProgress` (`userId`);