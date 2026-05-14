import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not set" }, { status: 500 });
  }

  const { image, mimeType } = await req.json();
  if (!image || !mimeType) {
    return NextResponse.json({ error: "Missing image or mimeType" }, { status: 400 });
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mimeType, data: image },
            },
            {
              type: "text",
              text: `You are analyzing a phone stock/inventory list image for a wholesale business in Dubai.
Extract every phone item visible in the image.

Return ONLY a valid JSON array (no markdown, no explanation). Each object must have:
- "model": string  (e.g. "iPhone 15 Pro Max", "Samsung S24 Ultra")
- "storage": string  (e.g. "256GB" — include GB suffix)
- "color": string  (e.g. "Black", "White", "Unknown")
- "grade": string  — MUST be exactly one of: "A+", "A", "A-", "B", "C"
- "price": number  (AED price as a plain integer)
- "quantity": number  (default 1 if not shown)
- "country": string or null  (e.g. "Japan", "USA", "UK", or null)

Example output:
[{"model":"iPhone 15 Pro","storage":"256GB","color":"Black","grade":"A","price":3500,"quantity":10,"country":"Japan"}]`,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    return NextResponse.json({ error: `Anthropic API error: ${err}` }, { status: 500 });
  }

  const data = await response.json();
  const text: string = data.content?.[0]?.text?.trim() ?? "";

  // Extract JSON array from response
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) {
    return NextResponse.json({ error: "AI did not return valid JSON", raw: text }, { status: 422 });
  }

  try {
    const items = JSON.parse(match[0]);
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ error: "JSON parse failed", raw: text }, { status: 422 });
  }
}
