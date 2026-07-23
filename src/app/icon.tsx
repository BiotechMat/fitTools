import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

/** Manifest icon (512px) — same mark as the apple icon, rounded card. */
export default function Icon() {
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
          borderRadius: 96,
          fontSize: 320,
        }}
      >
        <div
          style={{
            display: "flex",
            color: "#ff531a",
            fontWeight: 700,
            transform: "translateY(-18px)",
          }}
        >
          ♥
        </div>
      </div>
    ),
    size,
  );
}
