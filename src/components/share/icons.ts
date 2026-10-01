export type IconName =
  | "calendar"
  | "clock"
  | "banknote"
  | "users"
  | "message-circle"
  | "facebook"
  | "instagram"
  | "link"
  | "share"
  | "shield-check"
  | "messages-square"
  | "apple"
  | "play";

export const STROKE_ICONS: Partial<Record<IconName, string>> = {
  calendar: `<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18" stroke-linecap="round"/>`,
  clock: `<circle cx="12" cy="12" r="10"/><path d="M12 7v5l3 3" stroke-linecap="round" stroke-linejoin="round"/>`,
  banknote: `<rect x="1.5" y="6" width="21" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/>`,
  users: `<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke-linecap="round"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke-linecap="round"/>`,
  "message-circle": `<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z" stroke-linecap="round" stroke-linejoin="round"/>`,
  facebook: `<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" stroke-linecap="round" stroke-linejoin="round"/>`,
  instagram: `<rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><path d="M17.5 6.5h.01" stroke-linecap="round"/>`,
  link: `<path d="M15 7h3a5 5 0 0 1 0 10h-3m-6 0H6A5 5 0 0 1 6 7h3" stroke-linecap="round"/><path d="M8 12h8" stroke-linecap="round"/>`,
  share: `<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98M15.41 6.51 8.59 10.49" stroke-linecap="round"/>`,
  "shield-check": `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke-linejoin="round"/><path d="m9 12 2 2 4-4" stroke-linecap="round" stroke-linejoin="round"/>`,
  "messages-square": `<path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2z" stroke-linejoin="round"/><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" stroke-linejoin="round"/>`,
};

export const FILL_ICONS: Partial<Record<IconName, string>> = {
  apple: `<path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>`,
  play: `<path d="M3.84 2.15A1.5 1.5 0 0 0 3 3.5v17a1.5 1.5 0 0 0 .84 1.35L13.69 12 3.84 2.15zm12.97 12.97L6.05 21.34l8.49-8.49 2.27 2.27zM20.16 10.8c.34.27.59.69.59 1.2s-.25.92-.59 1.19l-2.29 1.33-2.5-2.52 2.5-2.52 2.29 1.32zM6.05 2.66l10.76 6.22-2.27 2.27L6.05 2.66z"/>`,
};
