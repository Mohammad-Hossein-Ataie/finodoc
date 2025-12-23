import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "@/lib/s3";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { key } = await req.json();

    const command = new GetObjectCommand({
      Bucket: process.env.LIARA_BUCKET_NAME,
      Key: key,
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });

    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json({ error: "Failed to sign URL" }, { status: 500 });
  }
}
