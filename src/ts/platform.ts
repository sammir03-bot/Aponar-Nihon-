type ApiOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

type ApiResult<T> = {
  ok: boolean;
  status: number;
  data: T | null;
};

type PlatformApi = {
  version: string;
  api<T>(path: string, options?: ApiOptions): Promise<ApiResult<T>>;
  online(): boolean;
};

declare global {
  interface Window {
    AponarPlatform?: PlatformApi;
  }
}

const VERSION = "2026.08";

function apiBase(): string {
  const meta = document.querySelector<HTMLMetaElement>('meta[name="aponar-api-base"]');
  const configured = meta?.content?.trim();
  return configured ? configured.replace(/\/$/, "") : "";
}

async function api<T>(path: string, options: ApiOptions = {}): Promise<ApiResult<T>> {
  const headers = new Headers(options.headers ?? {});
  let body: BodyInit | undefined;

  if (options.body !== undefined) {
    headers.set("content-type", "application/json");
    body = JSON.stringify(options.body);
  }

  const response = await fetch(`${apiBase()}${path}`, {
    ...options,
    body,
    headers,
    credentials: options.credentials ?? "same-origin",
  });

  let data: T | null = null;
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    data = (await response.json()) as T;
  }

  return { ok: response.ok, status: response.status, data };
}

function syncConnectivityState(): void {
  document.documentElement.dataset.network = navigator.onLine ? "online" : "offline";
}

function hardenBlankLinks(root: ParentNode = document): void {
  root.querySelectorAll<HTMLAnchorElement>('a[target="_blank"]').forEach((anchor) => {
    const rel = new Set((anchor.rel || "").split(/\s+/).filter(Boolean));
    rel.add("noopener");
    rel.add("noreferrer");
    anchor.rel = [...rel].join(" ");
  });
}

function boot(): void {
  document.documentElement.dataset.aponarPlatform = VERSION;
  syncConnectivityState();
  hardenBlankLinks();

  window.addEventListener("online", syncConnectivityState, { passive: true });
  window.addEventListener("offline", syncConnectivityState, { passive: true });

  window.AponarPlatform = {
    version: VERSION,
    api,
    online: () => navigator.onLine,
  };
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}

export {};
