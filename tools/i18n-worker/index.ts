type AiBinding = {
  run(model: string, input: unknown, options?: { queueRequest?: boolean }): Promise<unknown>;
};

type Env = {
  AI: AiBinding;
  I18N_JOB_TOKEN?: string;
};

const MODEL = "@cf/meta/m2m100-1.2b";
const TARGET_LANGUAGES = new Set(["ja", "en", "vi", "ne", "hi", "ur", "my", "zh", "si", "tl"]);
const MAX_BODY_BYTES = 9_500_000;
const MAX_BATCH_ITEMS = 5_000;
const MAX_TEXT_CHARS = 4_000;

function response(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: {
      "cache-control": "no-store",
      "content-type": "application/json; charset=utf-8",
      "x-content-type-options": "nosniff",
    },
  });
}

function authorized(request: Request, env: Env): boolean {
  const expected = env.I18N_JOB_TOKEN || "";
  const actual = request.headers.get("x-i18n-job-token") || "";
  if (!expected || actual.length !== expected.length) return false;
  let mismatch = 0;
  for (let index = 0; index < expected.length; index += 1) {
    mismatch |= expected.charCodeAt(index) ^ actual.charCodeAt(index);
  }
  return mismatch === 0;
}

async function readBody(request: Request): Promise<Record<string, unknown>> {
  const declared = Number(request.headers.get("content-length") || "0");
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
    throw new Error("body_too_large");
  }
  const buffer = await request.arrayBuffer();
  if (buffer.byteLength > MAX_BODY_BYTES) throw new Error("body_too_large");
  const value: unknown = JSON.parse(new TextDecoder().decode(buffer));
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("invalid_json_object");
  }
  return value as Record<string, unknown>;
}

function validText(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= MAX_TEXT_CHARS;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/health") {
      return response({ ok: true, model: MODEL });
    }
    if (request.method !== "POST" || !["/single", "/batch"].includes(url.pathname)) {
      return response({ ok: false, error: "not_found" }, 404);
    }
    if (!authorized(request, env)) {
      return response({ ok: false, error: "unauthorized" }, 401);
    }

    try {
      const body = await readBody(request);
      if (url.pathname === "/single") {
        const target = body.target_lang;
        if (!validText(body.text) || typeof target !== "string" || !TARGET_LANGUAGES.has(target)) {
          return response({ ok: false, error: "invalid_translation_request" }, 400);
        }
        const result = await env.AI.run(MODEL, {
          text: body.text,
          source_lang: "bn",
          target_lang: target,
        });
        return response({ ok: true, result });
      }

      if (typeof body.request_id === "string" && body.request_id) {
        const result = await env.AI.run(MODEL, { request_id: body.request_id });
        return response({ ok: true, result });
      }

      const target = body.target_lang;
      const texts = body.texts;
      if (
        typeof target !== "string" ||
        !TARGET_LANGUAGES.has(target) ||
        !Array.isArray(texts) ||
        texts.length < 1 ||
        texts.length > MAX_BATCH_ITEMS ||
        !texts.every(validText)
      ) {
        return response({ ok: false, error: "invalid_batch_request" }, 400);
      }
      const requests = texts.map((text, index) => ({
        text,
        source_lang: "bn",
        target_lang: target,
        external_reference: String(index),
      }));
      const result = await env.AI.run(MODEL, { requests }, { queueRequest: true });
      return response({ ok: true, result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown_error";
      const status = message === "body_too_large" ? 413 : 500;
      return response({ ok: false, error: message }, status);
    }
  },
};
