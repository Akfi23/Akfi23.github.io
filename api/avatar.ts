export const config = { runtime: "edge" };

const ALLOW = ["t.me", "telegram.org", "telesco.pe", "cdn1.telesco.pe", "cdn2.telesco.pe", "cdn3.telesco.pe", "cdn4.telesco.pe"];

export default async function handler(req: Request) {
  const urlObj = new URL(req.url);
  const src = urlObj.searchParams.get("url");
  if (!src) return new Response("url required", { status: 400 });

  const srcUrl = new URL(src);
  if (!ALLOW.includes(srcUrl.hostname)) return new Response("forbidden host", { status: 403 });

  const upstream = await fetch(src, { redirect: "follow" }); // сам последует за 302
  if (!upstream.ok) return new Response("upstream error", { status: 502 });

  const ct = upstream.headers.get("content-type") ?? "application/octet-stream";
  return new Response(upstream.body, {
    headers: {
      "Content-Type": ct,
      "Cache-Control": "public, max-age=31536000, immutable",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
