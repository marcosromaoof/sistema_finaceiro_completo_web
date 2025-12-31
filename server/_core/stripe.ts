import Stripe from "stripe";
import { env } from "./env";

if (!env.stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY is not defined in environment variables");
}

export const stripe = new Stripe(env.stripeSecretKey, {
  apiVersion: "2025-12-15.clover",
  typescript: true,
});

export { Stripe };
