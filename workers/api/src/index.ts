export interface Env {
  APP_ORIGIN?: string;
  API_VERSION?: string;
}

type JsonRecord = Record<string, unknown>;

const DEFAULT_ORIGIN = "https://aponar-nihon.eu.cc";

function securityHeaders(origin: string): HeadersInit {
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "authorization,content-type,x-requested-with",
    "access-control-max-age": "86400",
    "cache-control": "no-store",
    "content-type": "application/json; charset=utf-8",
    "cross-origin-resource-policy": "same-site",
    "referrer-policy": "strict-origin-when-cross-origin",
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY"
  };
}

function allowedOrigin(request: Request, env: Env): string | null {
  const expected = env.APP_ORIGIN?.trim() || DEFAULT_ORIGIN;
  const requestOrigin = new URL(request.url).origin;
  const origin = request.headers.get("origin");

  if (!origin) return requestOrigin;
  if (origin === requestOrigin) return origin;
  if (origin === expected) return origin;
  if (/^https:\/\/[a-z0-9-]+\.pages\.dev$/i.test(origin)) return origin;
  if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)) return origin;
  return null;
}

function json(data: JsonRecord, status: number, origin: string): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: securityHeaders(origin)
  });
}

function requestId(request: Request): string {
  return request.headers.get("cf-ray") || crypto.randomUUID();
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const requestOrigin = new URL(request.url).origin;
    const origin = allowedOrigin(request, env);
    if (!origin) {
      return json({ ok: false, error: "origin_not_allowed" }, 403, requestOrigin);
    }

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: securityHeaders(origin) });
    }

    const url = new URL(request.url);
    const rid = requestId(request);

    if (request.method === "GET" && url.pathname === "/api/health") {
      return json(
        {
          ok: true,
          service: "aponar-nihon-api",
          version: env.API_VERSION || "2026.08",
          request_id: rid
        },
        200,
        origin
      );
    }

    if (request.method === "GET" && url.pathname === "/api/config") {
      return json(
        {
          ok: true,
          api_version: env.API_VERSION || "2026.08",
          request_id: rid
        },
        200,
        origin
      );
    }

    return json(
      {
        ok: false,
        error: "not_found",
        request_id: rid
      },
      404,
      origin
    );
  }
};
