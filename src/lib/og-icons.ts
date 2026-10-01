function svgDataUri(inner: string, stroke = "#ffffff"): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="1.8">${inner}</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

export const CALENDAR_ICON = svgDataUri(
  `<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18" stroke-linecap="round"/>`,
);

export const CLOCK_ICON = svgDataUri(
  `<circle cx="12" cy="12" r="10"/><path d="M12 7v5l3 3" stroke-linecap="round" stroke-linejoin="round"/>`,
);

export const SHIELD_ICON = `data:image/svg+xml;base64,${Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="#ffffff" fill-opacity="0.9"/><path d="M9 12l2 2 4-4" stroke="#6c47ff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
).toString("base64")}`;
