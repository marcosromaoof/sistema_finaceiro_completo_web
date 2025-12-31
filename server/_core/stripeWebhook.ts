import { Request, Response } from "express";
import { stripe } from "./stripe";
import { env } from "./env";
import { updateUser } from "../db-user-update";

export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"];

  if (!sig) {
    console.error("[Stripe Webhook] Missing stripe-signature header");
    return res.status(400).send("Missing stripe-signature header");
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      env.stripeWebhookSecret
    );
  } catch (err: any) {
    console.error("[Stripe Webhook] Signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log("[Stripe Webhook] Received event:", event.type);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        console.log("[Stripe Webhook] Checkout session completed:", session.id);

        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan;

        if (userId && plan) {
          await updateUser(parseInt(userId), {
            stripeCustomerId: session.customer as string,
            subscriptionStatus: "trialing",
            subscriptionPlan: plan as "free" | "premium" | "family",
          });
          console.log(`[Stripe Webhook] Updated user ${userId} with subscription`);
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        console.log("[Stripe Webhook] Subscription updated:", subscription.id);

        const userId = subscription.metadata?.userId;

        if (userId) {
          await updateUser(parseInt(userId), {
            stripeSubscriptionId: subscription.id,
            stripePriceId: subscription.items.data[0]?.price.id,
            subscriptionStatus: subscription.status as any,
            subscriptionEndsAt: (subscription as any).current_period_end
              ? new Date((subscription as any).current_period_end * 1000)
              : null,
          });
          console.log(`[Stripe Webhook] Updated user ${userId} subscription status`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        console.log("[Stripe Webhook] Subscription deleted:", subscription.id);

        const userId = subscription.metadata?.userId;

        if (userId) {
          await updateUser(parseInt(userId), {
            stripeSubscriptionId: null,
            stripePriceId: null,
            subscriptionStatus: "canceled",
            subscriptionPlan: "free",
            subscriptionEndsAt: null,
          });
          console.log(`[Stripe Webhook] User ${userId} subscription canceled`);
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        console.log("[Stripe Webhook] Payment succeeded:", invoice.id);
        // Payment successful, subscription is active
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        console.log("[Stripe Webhook] Payment failed:", invoice.id);
        
        const subscription = (invoice as any).subscription;
        if (subscription) {
          // Find user by subscription ID and update status
          // Note: You may need to add a query function to find user by subscriptionId
          console.warn("[Stripe Webhook] Payment failed for subscription:", subscription);
        }
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error("[Stripe Webhook] Error processing webhook:", error);
    res.status(500).send(`Webhook processing error: ${error.message}`);
  }
}
