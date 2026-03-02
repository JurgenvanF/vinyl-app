import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

type DestroyRequestBody = {
  publicIds?: unknown;
};

const MAX_DESTROY_IDS = 25;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as DestroyRequestBody;
  const publicIds = Array.isArray(body.publicIds)
    ? body.publicIds.filter((v): v is string => typeof v === "string" && v.length > 0)
    : [];

  if (publicIds.length === 0) {
    return NextResponse.json({ ok: true, deleted: [] });
  }
  if (publicIds.length > MAX_DESTROY_IDS) {
    return NextResponse.json(
      { ok: false, error: "Too many ids" },
      { status: 400 },
    );
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      { ok: false, error: "Cloudinary not configured" },
      { status: 500 },
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });

  const safeIds = publicIds.filter((id) => id.includes("custom-albums/"));

  if (safeIds.length === 0) {
    return NextResponse.json({ ok: true, deleted: [] });
  }

  try {
    const result = await cloudinary.api.delete_resources(safeIds, {
      resource_type: "image",
      type: "upload",
      invalidate: true,
    });
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { ok: false, error: "Destroy failed" },
      { status: 500 },
    );
  }
}
