import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const bytes = await readFile(
    join(process.cwd(), "public", "Logo_CIE.JPG"),
  );
  const base64 = bytes.toString("base64");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          borderRadius: 24,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`data:image/jpeg;base64,${base64}`}
          alt=""
          width={160}
          height={160}
          style={{ objectFit: "contain" }}
        />
      </div>
    ),
    { ...size },
  );
}
