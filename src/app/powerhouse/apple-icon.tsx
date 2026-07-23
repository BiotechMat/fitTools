import { ImageResponse } from "next/og";
import { PixelSprite } from "@/lib/og-image";
import { POWERHOUSE_MITO } from "@/lib/pixel-art";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Powerhouse's home-screen icon: the pixel mitochondrion on paper. */
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
          background: "#fbf4ec",
        }}
      >
        <PixelSprite rows={POWERHOUSE_MITO} cell={8} />
      </div>
    ),
    size,
  );
}
