import type { NextApiRequest, NextApiResponse } from "next";
import { put, list } from "@vercel/blob";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  console.log("=== BLOB STORAGE SIMPLE TEST ===");
  console.log(
    "BLOB_READ_WRITE_TOKEN present:",
    !!process.env.BLOB_READ_WRITE_TOKEN,
  );
  console.log("Token length:", process.env.BLOB_READ_WRITE_TOKEN?.length || 0);
  console.log("NODE_ENV:", process.env.NODE_ENV);

  try {
    // Test list operation first
    console.log("Testing list operation...");
    const listResult = await list();
    console.log("List successful:", listResult.blobs.length, "blobs found");

    // Test put operation
    console.log("Testing put operation...");
    const testContent = JSON.stringify({
      test: true,
      timestamp: new Date().toISOString(),
      message: "Simple blob storage test",
    });

    const putResult = await put("test-simple.json", testContent, {
      access: "public",
      contentType: "application/json",
    });

    console.log("Put successful:", putResult.url);

    return res.status(200).json({
      success: true,
      message: "Blob storage is working correctly",
      results: {
        listTest: {
          success: true,
          blobCount: listResult.blobs.length,
        },
        putTest: {
          success: true,
          url: putResult.url,
        },
      },
    });
  } catch (error: any) {
    console.error("Blob storage test failed:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
      details: {
        tokenPresent: !!process.env.BLOB_READ_WRITE_TOKEN,
        nodeEnv: process.env.NODE_ENV,
        stack: error.stack,
      },
    });
  }
}
