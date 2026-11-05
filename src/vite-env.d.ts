/// <reference types="vite/client" />

declare const __APP_VERSION__: string;
/** When this build was made (ISO time), its commit and the commit's first line. */
declare const __BUILD_TIME__: string;
declare const __BUILD_COMMIT__: string;
declare const __BUILD_MESSAGE__: string;
/** True in development and test builds; false in release builds. */
declare const __ALLOW_PLACEHOLDERS__: boolean;

interface ImportMetaEnv {
  /** Anonymous telemetry endpoint. Empty = telemetry disabled and its toggle hidden (spec 8.2). */
  readonly VITE_TELEMETRY_URL?: string;
  /** WhatsApp parents group link. Empty = the "Join Parents Group" link is hidden. */
  readonly VITE_PARENTS_GROUP_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
