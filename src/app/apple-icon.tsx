import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Home-screen icon: the pixel heart on espresso — the brand at 180px. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1c130d",
          fontSize: 110,
        }}
      >
        <div
          style={{
            display: "flex",
            color: "#ff531a",
            fontWeight: 700,
            transform: "translateY(-6px)",
          }}
        >
          ♥
        </div>
      </div>
    ),
    size,
  );
}
