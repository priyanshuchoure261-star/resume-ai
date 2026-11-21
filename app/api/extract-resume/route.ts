import { NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";
import * as mammoth from "mammoth";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function cleanText(value: string) {
  return value
    .replace(/\u0000/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const uploaded = formData.get("file");

    if (!(uploaded instanceof File)) {
      return NextResponse.json(
        { error: "Resume file is required." },
        { status: 400 }
      );
    }

    if (uploaded.size === 0) {
      return NextResponse.json(
        { error: "The uploaded resume is empty." },
        { status: 400 }
      );
    }

    if (uploaded.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Resume file must be under 10MB." },
        { status: 413 }
      );
    }

    const extension =
      uploaded.name.toLowerCase().split(".").pop() || "";

    if (!["pdf", "docx", "txt"].includes(extension)) {
      return NextResponse.json(
        {
          error:
            "Only PDF, DOCX, and TXT resumes are supported for text extraction.",
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await uploaded.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let extractedText = "";

    if (extension === "pdf") {
      const parser = new PDFParse({
        data: buffer,
      });

      try {
        const result = await parser.getText();
        extractedText = result.text || "";
      } finally {
        await parser.destroy();
      }
    } else if (extension === "docx") {
      const result = await mammoth.extractRawText({
        buffer,
      });

      extractedText = result.value || "";
    } else if (extension === "txt") {
      extractedText = buffer.toString("utf-8");
    }

    const text = cleanText(extractedText);

    if (!text) {
      return NextResponse.json(
        {
          error:
            "No readable text was found. If this is a scanned/image-only PDF, please use a text-based PDF or enter your information manually.",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      text,
      fileName: uploaded.name,
      characters: text.length,
    });
  } catch (error) {
    console.error("Resume extraction error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to extract resume text.",
      },
      { status: 500 }
    );
  }
}

