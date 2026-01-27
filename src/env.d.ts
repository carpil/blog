/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly RESEND_API_KEY: string
  readonly GENERAL_SEGMENT_ID: string
  readonly WEEKLY_UPDATES_SEGMENT_ID: string
  readonly WEEKLY_UPDATES_TOPIC_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
