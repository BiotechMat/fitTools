import { ImageResponse } from "next/og";
import { PixelSprite } from "@/lib/og-image";
import { FIVEADAY_APPLE } from "@/lib/pixel-art";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Five a Day's home-screen icon: the pixel apple on paper. */
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
        <PixelSprite rows={FIVEADAY_APPLE} cell={12} />
      </div>
    ),
    size,
  );
}
