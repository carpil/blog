import { LOGO_DATA_URI } from "./logo-data";
import { Avatar, truncate, type OgSeatPassenger } from "./og-card";

export const STORY_SIZE = { width: 1080, height: 1920 };

export interface OgStoryProps {
  headline: string;
  subline: string;
  origin: string;
  destination: string;
  when: string;
  price: string;
  passengers: OgSeatPassenger[];
  capacity: number;
  // "2 de 4", read with "campos tomados" underneath.
  takenLabel: string;
  footer: string;
}

const WHITE_70 = "rgba(241,235,255,0.7)";
const WHITE_80 = "rgba(241,235,255,0.8)";
const MAX_FACES = 4;

function placeFontSize(origin: string, destination: string): number {
  const longest = Math.max(origin.length, destination.length);
  if (longest > 22) return 52;
  if (longest > 18) return 60;
  if (longest > 14) return 68;
  return 76;
}

function StoryLeg({ label, place, fontSize, isDestination }: { label: string; place: string; fontSize: number; isDestination: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
      <div
        style={{
          display: "flex",
          width: "24px",
          height: "24px",
          borderRadius: "50%",
          flexShrink: 0,
          ...(isDestination ? { border: "6px solid #ffb691" } : { background: "#ffffff" }),
        }}
      />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontWeight: 700, fontSize: "24px", letterSpacing: "3px", color: WHITE_70 }}>{label}</span>
        <span style={{ fontFamily: "Jakarta", fontWeight: 800, fontSize: `${fontSize}px`, lineHeight: 1.05, letterSpacing: "-2px" }}>
          {truncate(place, 28)}
        </span>
      </div>
    </div>
  );
}

// The Instagram story a driver posts to fill the ride, in their own voice. The top and
// bottom stay clear for Instagram's own UI; the dashed pill marks where the link sticker goes.
export function buildStoryCard(props: OgStoryProps) {
  const { headline, subline, origin, destination, when, price, passengers, capacity, takenLabel, footer } = props;
  const faces = passengers.slice(0, MAX_FACES);
  const freeFaces = Math.max(0, Math.min(capacity, MAX_FACES) - faces.length);
  const fontSize = placeFontSize(origin, destination);

  return (
    <div
      style={{
        width: "1080px",
        height: "1920px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "200px 80px 280px",
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(160deg, #8a68ff 0%, #6c47ff 55%, #5b32f0 100%)",
        fontFamily: "Inter, InterExt",
        color: "#ffffff",
      }}
    >
      <div
        style={{
          display: "flex",
          position: "absolute",
          top: "-260px",
          right: "-260px",
          width: "820px",
          height: "820px",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.13)",
        }}
      />
      <div
        style={{
          display: "flex",
          position: "absolute",
          bottom: "-300px",
          left: "-280px",
          width: "800px",
          height: "800px",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.07)",
        }}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "56px", position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <img src={LOGO_DATA_URI} width={72} height={72} style={{ borderRadius: "20px" }} />
          <span style={{ fontFamily: "Jakarta", fontWeight: 800, fontSize: "48px", letterSpacing: "-1.4px" }}>Carpil</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <span style={{ fontFamily: "Jakarta", fontWeight: 800, fontSize: "128px", lineHeight: 1.0, letterSpacing: "-4px" }}>{headline}</span>
          <span style={{ fontFamily: "Jakarta", fontWeight: 700, fontSize: "60px", lineHeight: 1.15, letterSpacing: "-1.2px", color: "rgba(241,235,255,0.85)" }}>
            {subline}
          </span>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "40px",
          padding: "56px",
          borderRadius: "56px",
          background: "rgba(255,255,255,0.14)",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <StoryLeg label="DESDE" place={origin} fontSize={fontSize} isDestination={false} />
          <div style={{ display: "flex", width: "4px", height: "40px", marginLeft: "10px", borderRadius: "2px", background: "rgba(255,255,255,0.4)" }} />
          <StoryLeg label="HACIA" place={destination} fontSize={fontSize} isDestination={true} />
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", padding: "16px 32px", borderRadius: "9999px", background: "rgba(255,255,255,0.18)", fontWeight: 600, fontSize: "34px" }}>
            {when}
          </div>
          <div style={{ display: "flex", padding: "16px 32px", borderRadius: "9999px", background: "rgba(255,255,255,0.95)", color: "#5b32f0", fontWeight: 700, fontSize: "34px" }}>
            {price}
          </div>
        </div>

        <div style={{ display: "flex", height: "2px", background: "rgba(255,255,255,0.25)" }} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            {faces.map((passenger, index) => (
              <div style={{ display: "flex", marginLeft: index === 0 ? "0px" : "-20px" }}>
                <Avatar photo={passenger.photo} name={passenger.name} size={104} border={4} />
              </div>
            ))}
            {Array.from({ length: freeFaces }).map((_, index) => (
              <div
                style={{
                  display: "flex",
                  width: "104px",
                  height: "104px",
                  borderRadius: "50%",
                  border: "4px dashed rgba(255,255,255,0.6)",
                  marginLeft: faces.length === 0 && index === 0 ? "0px" : "-20px",
                }}
              />
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <span style={{ fontWeight: 700, fontSize: "36px" }}>{takenLabel}</span>
            <span style={{ fontWeight: 600, fontSize: "28px", color: "rgba(241,235,255,0.75)" }}>campos tomados</span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", position: "relative" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "620px",
            height: "120px",
            borderRadius: "9999px",
            border: "4px dashed rgba(255,255,255,0.55)",
            fontWeight: 600,
            fontSize: "30px",
            color: WHITE_80,
          }}
        >
          Sticker de enlace
        </div>
        <span style={{ fontWeight: 600, fontSize: "32px", color: WHITE_80 }}>{truncate(footer, 52)}</span>
      </div>
    </div>
  );
}
