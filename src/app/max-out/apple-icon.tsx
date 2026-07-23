import { ImageResponse } from "next/og";
import { PixelSprite } from "@/lib/og-image";
import { MAXOUT_LIFTER } from "@/lib/pixel-art";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Max Out's home-screen icon: the pixel lifter on paper. */
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
        <PixelSprite rows={MAXOUT_LIFTER} cell={10} />
      </div>
    ),
    size,
  );
}
