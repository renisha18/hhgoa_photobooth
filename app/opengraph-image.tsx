import { ImageResponse } from "next/og";

export const alt = "HH Goa 2026 Builder ID";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 84px",
          background: "linear-gradient(135deg,#063c29 0%,#0a7448 100%)",
          color: "#fff9e8",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 26,
            fontWeight: 800,
            letterSpacing: 6,
            color: "#ffdd1f",
          }}
        >
          OCTOBER 28–31 • GOA, INDIA
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 108,
            fontWeight: 900,
            lineHeight: 1,
            marginTop: 22,
            letterSpacing: -4,
          }}
        >
          Your face. Your build.
        </div>
        <div style={{ fontSize: 32, marginTop: 26, color: "#d8ecdf" }}>
          Build your HH Goa 2026 Builder ID — free, instant, private.
        </div>
        <div
          style={{
            fontSize: 34,
            fontWeight: 900,
            marginTop: 40,
            letterSpacing: 3,
            color: "#ff2b88",
          }}
        >
          #FRAMEINGOA
        </div>
      </div>
    ),
    size,
  );
}
