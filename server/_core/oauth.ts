import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      console.error("[OAuth] Missing code or state parameter");
      res.redirect(302, "/auth-error?type=callback_failed&message=Missing+authorization+code+or+state");
      return;
    }

    try {
      // Step 1: Exchange code for token
      let tokenResponse;
      try {
        tokenResponse = await sdk.exchangeCodeForToken(code, state);
      } catch (error) {
        console.error("[OAuth] Token exchange failed", error);
        const message = error instanceof Error ? error.message : "Token exchange failed";
        res.redirect(302, `/auth-error?type=token_exchange&message=${encodeURIComponent(message)}`);
        return;
      }

      // Step 2: Get user info
      let userInfo;
      try {
        userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      } catch (error) {
        console.error("[OAuth] Failed to get user info", error);
        const message = error instanceof Error ? error.message : "Failed to retrieve user information";
        res.redirect(302, `/auth-error?type=user_info&message=${encodeURIComponent(message)}`);
        return;
      }

      if (!userInfo.openId) {
        console.error("[OAuth] openId missing from user info");
        res.redirect(302, "/auth-error?type=user_info&message=OpenID+missing+from+user+profile");
        return;
      }

      // Step 3: Upsert user in database
      try {
        await db.upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: new Date(),
        });
      } catch (error) {
        console.error("[OAuth] Failed to upsert user", error);
        const message = error instanceof Error ? error.message : "Failed to create user account";
        res.redirect(302, `/auth-error?type=session_creation&message=${encodeURIComponent(message)}`);
        return;
      }

      // Step 4: Create session token
      let sessionToken;
      try {
        sessionToken = await sdk.createSessionToken(userInfo.openId, {
          name: userInfo.name || "",
          expiresInMs: ONE_YEAR_MS,
        });
      } catch (error) {
        console.error("[OAuth] Failed to create session token", error);
        const message = error instanceof Error ? error.message : "Failed to create session";
        res.redirect(302, `/auth-error?type=session_creation&message=${encodeURIComponent(message)}`);
        return;
      }

      // Step 5: Set cookie and redirect
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      console.log(`[OAuth] Login successful for user ${userInfo.openId}`);
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Unexpected error in callback", error);
      const message = error instanceof Error ? error.message : "Unexpected authentication error";
      res.redirect(302, `/auth-error?type=callback_failed&message=${encodeURIComponent(message)}`);
    }
  });
}
