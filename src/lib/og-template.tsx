interface OgTemplateProps {
  origin: string;
  destination: string;
  date: string;
  time: string;
  price: string;
  seatsAvailable: number;
  driverName: string;
  driverPhoto: string;
}

export function buildOgTemplate(props: OgTemplateProps) {
  const {
    origin,
    destination,
    date,
    time,
    price,
    seatsAvailable,
    driverName,
    driverPhoto,
  } = props;

  return (
    <div
      style={{
        width: "1200px",
        height: "630px",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Inter",
        color: "#FFFFFF",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "1200px",
          height: "630px",
          background: "#6C3AED",
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "1200px",
          height: "630px",
          background:
            "linear-gradient(135deg, #6C3AED 0%, #7C3AED 50%, #4C1D95 100%)",
          display: "flex",
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px 56px 40px 56px",
          height: "100%",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #6C3AED, #8B5CF6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
                color: "#FFFFFF",
                fontWeight: 700,
              }}
            >
              C
            </div>
            <span
              style={{
                fontSize: "28px",
                fontWeight: 700,
                letterSpacing: "-0.5px",
              }}
            >
              Carpil
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(255, 255, 255, 0.18)",
              border: "1px solid rgba(255, 255, 255, 0.35)",
              borderRadius: "24px",
              padding: "8px 20px",
            }}
          >
            <span style={{ fontSize: "20px", fontWeight: 700, color: "#FFFFFF" }}>
              {seatsAvailable}{" "}
              {seatsAvailable === 1 ? "asiento" : "asientos"}
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "16px",
                height: "16px",
                borderRadius: "50%",
                background: "#FFFFFF",
                border: "3px solid rgba(255,255,255,0.6)",
                display: "flex",
              }}
            />
            <span
              style={{
                fontSize: "52px",
                fontWeight: 700,
                letterSpacing: "-1px",
                lineHeight: 1.1,
                color: "#FFFFFF",
              }}
            >
              {origin}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              marginLeft: "6px",
              width: "4px",
              height: "32px",
              background: "rgba(255, 255, 255, 0.4)",
              borderRadius: "2px",
            }}
          />

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "16px",
                height: "16px",
                borderRadius: "50%",
                background: "#34D399",
                border: "3px solid rgba(52,211,153,0.5)",
                display: "flex",
              }}
            />
            <span
              style={{
                fontSize: "52px",
                fontWeight: 700,
                letterSpacing: "-1px",
                lineHeight: 1.1,
                color: "#FFFFFF",
              }}
            >
              {destination}
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  fontSize: "22px",
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.9)",
                }}
              >
                {date}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  fontSize: "22px",
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.9)",
                }}
              >
                {time}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(255,255,255,0.95)",
                border: "1px solid rgba(255,255,255,1)",
                borderRadius: "12px",
                padding: "6px 16px",
              }}
            >
              <span
                style={{
                  fontSize: "24px",
                  fontWeight: 700,
                  color: "#6C3AED",
                }}
              >
                {price}
              </span>
              <span
                style={{
                  fontSize: "16px",
                  color: "rgba(76,29,149,0.7)",
                }}
              >
                /asiento
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {driverPhoto ? (
              <img
                src={driverPhoto}
                width={48}
                height={48}
                style={{
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid rgba(108, 58, 237, 0.5)",
                }}
              />
            ) : (
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background: "rgba(108, 58, 237, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "#FFFFFF",
                }}
              >
                {driverName.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#FFFFFF",
                }}
              >
                {driverName}
              </span>
              <span
                style={{
                  fontSize: "14px",
                  color: "rgba(255,255,255,0.75)",
                }}
              >
                Conductor verificado
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: "linear-gradient(90deg, #6C3AED, #8B5CF6, #10B981)",
          display: "flex",
        }}
      />
    </div>
  );
}
