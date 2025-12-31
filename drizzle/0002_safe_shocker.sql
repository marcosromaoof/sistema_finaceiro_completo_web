CREATE TABLE `supportTickets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`subject` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`category` enum('technical','billing','feature','other') NOT NULL,
	`priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
	`status` enum('open','in_progress','resolved','closed') NOT NULL DEFAULT 'open',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `supportTickets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `supportTickets_userId_idx` ON `supportTickets` (`userId`);--> statement-breakpoint
CREATE INDEX `supportTickets_status_idx` ON `supportTickets` (`status`);