const CR_LOCAL = /^\d{8}$/;

export function localDigits(raw: string): string {
  return raw.replace(/\D/g, "").replace(/^506(?=\d{8}$)/, "");
}

export function isLocalPhone(raw: string): boolean {
  return CR_LOCAL.test(localDigits(raw));
}

export function toE164(raw: string): string {
  return `+506${localDigits(raw)}`;
}

const REMEMBERED_PHONE = "carpil:phone";

// Per-browser convenience only; the API keeps the real record.
export function rememberedPhone(): string {
  try {
    return localStorage.getItem(REMEMBERED_PHONE) ?? "";
  } catch {
    return "";
  }
}

export function rememberPhone(localPhone: string): void {
  try {
    localStorage.setItem(REMEMBERED_PHONE, localPhone);
  } catch {
    // Private mode or blocked storage: the form just won't prefill next time.
  }
}
