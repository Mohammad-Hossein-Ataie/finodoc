import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "@/lib/s3";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const key = `${Date.now()}-${file.name}`;

    const command = new PutObjectCommand({
      Bucket: process.env.LIARA_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    });

    await s3.send(command);
    
    // Construct public URL (assuming public read or using presigned for view)
    // If bucket is public:
    const url = `${process.env.NEXT_PUBLIC_LIARA_BASE_URL}/${key}`;

    return NextResponse.json({ url, key });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
