ALTER TABLE `users` ADD `stripeCustomerId` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `stripeSubscriptionId` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `stripePriceId` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionStatus` enum('active','canceled','past_due','trialing','incomplete');--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionPlan` enum('free','premium','family') DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionEndsAt` timestamp;