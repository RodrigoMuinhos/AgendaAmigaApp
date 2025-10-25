import { Request, Response, Router } from "express";

const authRouter = Router();

type Provider = "google" | "govbr";

const PROVIDER_CONFIG: Record<Provider, { envVar: string; callbackPath: string }> = {
  google: {
    envVar: "GOOGLE_OAUTH_AUTHORIZE_URL",
    callbackPath: "/auth/google/callback",
  },
  govbr: {
    envVar: "GOVBR_OAUTH_AUTHORIZE_URL",
    callbackPath: "/auth/govbr/callback",
  },
};

function resolveReturnUrl(req: Request) {
  const requestedReturn = typeof req.query.return_to === "string" ? req.query.return_to : undefined;
  if (requestedReturn) {
    return requestedReturn;
  }
  if (process.env.AUTH_SUCCESS_REDIRECT) {
    return process.env.AUTH_SUCCESS_REDIRECT;
  }
  return undefined;
}

function resolveFailureRedirect(provider: Provider) {
  const base =
    process.env.AUTH_FAILURE_REDIRECT ??
    process.env.AUTH_SUCCESS_REDIRECT ??
    process.env.FRONTEND_ORIGIN ??
    "http://localhost:5173/login";

  const url = new URL(base);
  url.searchParams.set("provider", provider);
  url.searchParams.set("error", "oauth_not_configured");
  return url.toString();
}

function buildHandler(provider: Provider) {
  return (req: Request, res: Response) => {
    const config = PROVIDER_CONFIG[provider];
    const configuredUrl = process.env[config.envVar]?.trim();

    if (configuredUrl) {
      const redirectTarget = new URL(configuredUrl);
      const returnTo = resolveReturnUrl(req);

      if (returnTo) {
        redirectTarget.searchParams.set("state", returnTo);
      }

      return res.redirect(redirectTarget.toString());
    }

    return res.redirect(resolveFailureRedirect(provider));
  };
}

authRouter.get("/api/auth/google", buildHandler("google"));
authRouter.get("/api/auth/govbr", buildHandler("govbr"));

export { authRouter };
