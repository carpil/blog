import { LOGO_DATA_URI } from "./logo-data";
import { SHIELD_ICON } from "./og-icons";

export interface OgChip {
  icon: string;
  label: string;
}

export interface OgSeatPassenger {
  name: string;
  photo: string | null;
}

export interface OgSeatStack {
  passengers: OgSeatPassenger[];
  freeSeats: number;
}

export interface OgCardProps {
  badge: string;
  origin: string;
  destination: string;
  chips: OgChip[];
  price?: string | null;
  personOverline: string;
  personName: string;
  personPhoto?: string | null;
  personVerified?: boolean;
  seatStack?: OgSeatStack | null;
}

const WHITE_70 = "rgba(241,235,255,0.7)";
const MAX_STACK = 4;

function truncate(value: string, max: number): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1).trimEnd()}…`;
}

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

// Los nombres largos harían overflow a 62px; el título baja de escalón según el más largo.
function placeFontSize(origin: string, destination: string): number {
  const longest = Math.max(origin.length, destination.length);
  if (longest > 22) return 42;
  if (longest > 18) return 50;
  if (longest > 15) return 56;
  return 62;
}

function Avatar({
  photo,
  name,
  size,
  border,
}: {
  photo?: string | null;
  name: string;
  size: number;
  border: number;
}) {
  if (photo) {
    return (
      <img
        src={photo}
        width={size}
        height={size}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: "50%",
          objectFit: "cover",
          border: `${border}px solid rgba(255,255,255,0.7)`,
        }}
      />
    );
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        border: `${border}px solid rgba(255,255,255,0.7)`,
        background: "linear-gradient(135deg, #e6deff 0%, #c9beff 100%)",
        color: "#2f009b",
        fontFamily: "Jakarta",
        fontWeight: 800,
        fontSize: `${Math.round(size * 0.36)}px`,
      }}
    >
      {initials(name)}
    </div>
  );
}

function RouteLeg({
  label,
  place,
  fontSize,
  isDestination,
}: {
  label: string;
  place: string;
  fontSize: number;
  isDestination: boolean;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
      <div
        style={{
          display: "flex",
          width: "18px",
          height: "18px",
          borderRadius: "50%",
          flexShrink: 0,
          ...(isDestination
            ? { border: "5px solid #ffb691" }
            : { background: "#ffffff" }),
        }}
      />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span
          style={{
            fontFamily: "Inter, InterExt",
            fontWeight: 700,
            fontSize: "18px",
            letterSpacing: "2.4px",
            color: WHITE_70,
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: "Jakarta",
            fontWeight: 800,
            fontSize: `${fontSize}px`,
            lineHeight: 1.05,
            letterSpacing: "-1.8px",
            color: "#ffffff",
          }}
        >
          {place}
        </span>
      </div>
    </div>
  );
}

export function buildOgCard(props: OgCardProps) {
  const {
    badge,
    origin,
    destination,
    chips,
    price,
    personOverline,
    personName,
    personPhoto,
    personVerified = false,
    seatStack = null,
  } = props;

  const fontSize = placeFontSize(origin, destination);
  const stacked = seatStack?.passengers.slice(0, MAX_STACK) ?? [];
  const dashedSeats = seatStack
    ? Math.max(0, Math.min(seatStack.freeSeats, MAX_STACK - stacked.length))
    : 0;

  return (
    <div
      style={{
        width: "1200px",
        height: "630px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "52px 64px",
        position: "relative",
        overflow: "hidden",
        background:
          "linear-gradient(150deg, #8a68ff 0%, #6c47ff 58%, #5b32f0 100%)",
        fontFamily: "Inter, InterExt",
        color: "#ffffff",
      }}
    >
      <div
        style={{
          display: "flex",
          position: "absolute",
          top: "-180px",
          left: "800px",
          width: "520px",
          height: "520px",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.13)",
        }}
      />
      <div
        style={{
          display: "flex",
          position: "absolute",
          top: "370px",
          left: "-140px",
          width: "480px",
          height: "480px",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.07)",
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <img
            src={LOGO_DATA_URI}
            width={56}
            height={56}
            style={{ borderRadius: "16px" }}
          />
          <span
            style={{
              fontFamily: "Jakarta",
              fontWeight: 800,
              fontSize: "38px",
              letterSpacing: "-1.2px",
            }}
          >
            Carpil
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          {seatStack && (
            <div style={{ display: "flex", alignItems: "center" }}>
              {stacked.map((passenger, index) => (
                <div
                  style={{
                    display: "flex",
                    marginLeft: index === 0 ? "0px" : "-10px",
                  }}
                >
                  <Avatar
                    photo={passenger.photo}
                    name={passenger.name}
                    size={44}
                    border={2}
                  />
                </div>
              ))}
              {Array.from({ length: dashedSeats }).map((_, index) => (
                <div
                  style={{
                    display: "flex",
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    border: "2px dashed rgba(255,255,255,0.55)",
                    marginLeft:
                      stacked.length === 0 && index === 0 ? "0px" : "-10px",
                  }}
                />
              ))}
            </div>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 26px",
              borderRadius: "9999px",
              background: "rgba(255,255,255,0.2)",
            }}
          >
            <div
              style={{
                display: "flex",
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: "#ffb691",
              }}
            />
            <span
              style={{
                fontWeight: 700,
                fontSize: "21px",
                letterSpacing: "2.2px",
                whiteSpace: "nowrap",
              }}
            >
              {badge}
            </span>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          position: "relative",
        }}
      >
        <RouteLeg
          label="DESDE"
          place={origin}
          fontSize={fontSize}
          isDestination={false}
        />
        <div
          style={{
            display: "flex",
            width: "3px",
            height: "36px",
            marginLeft: "8px",
            borderRadius: "2px",
            background: "rgba(255,255,255,0.4)",
          }}
        />
        <RouteLeg
          label="HACIA"
          place={destination}
          fontSize={fontSize}
          isDestination={true}
        />
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {chips.map((chip) => (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 22px",
                borderRadius: "9999px",
                background: "rgba(255,255,255,0.18)",
              }}
            >
              <img src={chip.icon} width={24} height={24} />
              <span
                style={{
                  fontWeight: 600,
                  fontSize: "24px",
                  whiteSpace: "nowrap",
                }}
              >
                {chip.label}
              </span>
            </div>
          ))}

          {price && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "10px 22px",
                borderRadius: "9999px",
                background: "rgba(255,255,255,0.95)",
              }}
            >
              <span
                style={{
                  fontWeight: 700,
                  fontSize: "24px",
                  color: "#5b32f0",
                  whiteSpace: "nowrap",
                }}
              >
                {price}
              </span>
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            padding: "12px 26px 12px 14px",
            borderRadius: "9999px",
            background: "rgba(255,255,255,0.14)",
          }}
        >
          <Avatar photo={personPhoto} name={personName} size={60} border={2} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "17px", color: "rgba(241,235,255,0.75)" }}>
              {personOverline}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  fontWeight: 700,
                  fontSize: "24px",
                  whiteSpace: "nowrap",
                }}
              >
                {truncate(personName, 24)}
              </span>
              {personVerified && <img src={SHIELD_ICON} width={22} height={22} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
