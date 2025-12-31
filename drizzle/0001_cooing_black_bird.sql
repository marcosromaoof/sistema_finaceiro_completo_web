CREATE TABLE `accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` enum('checking','savings','credit_card','investment','loan','other') NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'BRL',
	`balance` decimal(15,2) NOT NULL DEFAULT '0.00',
	`creditLimit` decimal(15,2),
	`institution` varchar(255),
	`accountNumber` varchar(100),
	`color` varchar(7) DEFAULT '#3b82f6',
	`isActive` boolean NOT NULL DEFAULT true,
	`lastSyncedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `accounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('budget_warning','bill_due','goal_milestone','low_balance','unusual_spending','custom') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`severity` enum('info','warning','critical') NOT NULL DEFAULT 'info',
	`isRead` boolean NOT NULL DEFAULT false,
	`relatedEntityType` varchar(50),
	`relatedEntityId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `budgets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`categoryId` int NOT NULL,
	`amount` decimal(15,2) NOT NULL,
	`period` varchar(7) NOT NULL,
	`spent` decimal(15,2) NOT NULL DEFAULT '0.00',
	`rollover` boolean NOT NULL DEFAULT false,
	`alertThreshold` int NOT NULL DEFAULT 80,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `budgets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` enum('income','expense') NOT NULL,
	`color` varchar(7) DEFAULT '#6b7280',
	`icon` varchar(50),
	`parentId` int,
	`isSystem` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `categorizationRules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`categoryId` int NOT NULL,
	`pattern` varchar(255) NOT NULL,
	`matchType` enum('contains','starts_with','ends_with','exact') NOT NULL DEFAULT 'contains',
	`priority` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `categorizationRules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `debtPayments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`debtId` int NOT NULL,
	`amount` decimal(15,2) NOT NULL,
	`principalAmount` decimal(15,2) NOT NULL,
	`interestAmount` decimal(15,2) NOT NULL,
	`date` timestamp NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `debtPayments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `debts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`totalAmount` decimal(15,2) NOT NULL,
	`remainingAmount` decimal(15,2) NOT NULL,
	`interestRate` decimal(5,2) NOT NULL,
	`minimumPayment` decimal(15,2),
	`dueDay` int,
	`startDate` timestamp NOT NULL,
	`payoffStrategy` enum('snowball','avalanche','custom') DEFAULT 'avalanche',
	`creditor` varchar(255),
	`isPaidOff` boolean NOT NULL DEFAULT false,
	`paidOffAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `debts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `goalContributions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`goalId` int NOT NULL,
	`amount` decimal(15,2) NOT NULL,
	`date` timestamp NOT NULL DEFAULT (now()),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `goalContributions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `goals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`targetAmount` decimal(15,2) NOT NULL,
	`currentAmount` decimal(15,2) NOT NULL DEFAULT '0.00',
	`targetDate` timestamp,
	`category` enum('short_term','medium_term','long_term') NOT NULL,
	`description` text,
	`color` varchar(7) DEFAULT '#10b981',
	`icon` varchar(50),
	`isCompleted` boolean NOT NULL DEFAULT false,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `goals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `investmentReturns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`investmentId` int NOT NULL,
	`type` enum('dividend','interest','capital_gain') NOT NULL,
	`amount` decimal(15,2) NOT NULL,
	`date` timestamp NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `investmentReturns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `investments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`accountId` int,
	`name` varchar(255) NOT NULL,
	`type` enum('stocks','bonds','funds','real_estate','crypto','other') NOT NULL,
	`ticker` varchar(20),
	`quantity` decimal(15,4),
	`purchasePrice` decimal(15,2) NOT NULL,
	`currentPrice` decimal(15,2),
	`totalInvested` decimal(15,2) NOT NULL,
	`currentValue` decimal(15,2),
	`purchaseDate` timestamp NOT NULL,
	`lastUpdated` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `investments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `retirementPlans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`currentAge` int NOT NULL,
	`retirementAge` int NOT NULL,
	`currentSavings` decimal(15,2) NOT NULL DEFAULT '0.00',
	`monthlyContribution` decimal(15,2) NOT NULL,
	`expectedReturn` decimal(5,2) NOT NULL,
	`inflationRate` decimal(5,2) NOT NULL DEFAULT '3.50',
	`desiredMonthlyIncome` decimal(15,2),
	`projectedValue` decimal(15,2),
	`lastCalculated` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `retirementPlans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`accountId` int NOT NULL,
	`categoryId` int,
	`type` enum('income','expense','transfer') NOT NULL,
	`amount` decimal(15,2) NOT NULL,
	`description` text,
	`date` timestamp NOT NULL,
	`isPending` boolean NOT NULL DEFAULT false,
	`isRecurring` boolean NOT NULL DEFAULT false,
	`recurringFrequency` enum('daily','weekly','monthly','yearly'),
	`tags` text,
	`notes` text,
	`attachmentUrl` text,
	`transferAccountId` int,
	`aiCategorized` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `accounts_userId_idx` ON `accounts` (`userId`);--> statement-breakpoint
CREATE INDEX `alerts_userId_idx` ON `alerts` (`userId`);--> statement-breakpoint
CREATE INDEX `alerts_isRead_idx` ON `alerts` (`isRead`);--> statement-breakpoint
CREATE INDEX `budgets_userId_idx` ON `budgets` (`userId`);--> statement-breakpoint
CREATE INDEX `budgets_period_idx` ON `budgets` (`period`);--> statement-breakpoint
CREATE INDEX `categories_userId_idx` ON `categories` (`userId`);--> statement-breakpoint
CREATE INDEX `categorizationRules_userId_idx` ON `categorizationRules` (`userId`);--> statement-breakpoint
CREATE INDEX `debtPayments_debtId_idx` ON `debtPayments` (`debtId`);--> statement-breakpoint
CREATE INDEX `debts_userId_idx` ON `debts` (`userId`);--> statement-breakpoint
CREATE INDEX `goalContributions_goalId_idx` ON `goalContributions` (`goalId`);--> statement-breakpoint
CREATE INDEX `goals_userId_idx` ON `goals` (`userId`);--> statement-breakpoint
CREATE INDEX `investmentReturns_investmentId_idx` ON `investmentReturns` (`investmentId`);--> statement-breakpoint
CREATE INDEX `investments_userId_idx` ON `investments` (`userId`);--> statement-breakpoint
CREATE INDEX `retirementPlans_userId_idx` ON `retirementPlans` (`userId`);--> statement-breakpoint
CREATE INDEX `transactions_userId_idx` ON `transactions` (`userId`);--> statement-breakpoint
CREATE INDEX `transactions_accountId_idx` ON `transactions` (`accountId`);--> statement-breakpoint
CREATE INDEX `transactions_date_idx` ON `transactions` (`date`);