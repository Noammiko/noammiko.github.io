/// <reference path="../.astro/types.d.ts" />

// import type { Posthog } from "posthog-js";
interface Window {
  posthog: any;
}

interface ImportMetaEnv {
  readonly CONVEX_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
