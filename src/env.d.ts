/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly API_URL: string
  readonly PUBLIC_API_URL: string
  readonly PUBLIC_FIREBASE_API_KEY: string
  readonly PUBLIC_FIREBASE_AUTH_DOMAIN: string
  readonly PUBLIC_FIREBASE_PROJECT_ID: string
  readonly PUBLIC_FIREBASE_APP_ID: string
  readonly PUBLIC_FIRESTORE_DATABASE_ID?: string
  readonly PUBLIC_FIREBASE_EMULATOR_HOST?: string
  readonly PUBLIC_POSTHOG_KEY?: string
  readonly PUBLIC_POSTHOG_HOST?: string
  readonly RESEND_API_KEY: string
  readonly GENERAL_SEGMENT_ID: string
  readonly WEEKLY_UPDATES_SEGMENT_ID: string
  readonly WEEKLY_UPDATES_TOPIC_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module "*.woff?inline" {
  const dataUri: string;
  export default dataUri;
}
