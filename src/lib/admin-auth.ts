import type { NextRequest, NextResponse } from "next/server";

import { fail } from "@/lib/api-response";

type AdminCheck =
  | {
      ok: true;
    }
  | {
      ok: false;
      response: NextResponse;
    };

export function requireAdmin(request: NextRequest): AdminCheck {
  const setupSecret = process.env.ADMIN_SETUP_SECRET;
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;

  const incomingSecret = request.headers.get("x-admin-secret");
  const sessionCookie = request.cookies.get("school_vote_admin_session")?.value;

  const headerIsValid = Boolean(setupSecret) && incomingSecret === setupSecret;
  const sessionIsValid =
    Boolean(sessionSecret) && sessionCookie === sessionSecret;

  if (headerIsValid || sessionIsValid) {
    return {
      ok: true,
    };
  }

  return {
    ok: false,
    response: fail("Unauthorized admin request.", 401),
  };
}