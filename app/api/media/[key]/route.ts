import { getCloudflareContext } from "@opennextjs/cloudflare";

// R2에서 이미지를 읽어 서빙. 공개(인증 불필요). 키는 업로드가 만든 uuid.ext.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key } = await params;
  const { env } = getCloudflareContext();
  const obj = await env.BUCKET.get(key);
  if (!obj) {
    return new Response("Not found", { status: 404 });
  }
  return new Response(obj.body, {
    headers: {
      "content-type":
        obj.httpMetadata?.contentType ?? "application/octet-stream",
      "cache-control": "public, max-age=31536000, immutable",
      // 업로드한 SVG를 직접 열었을 때 안의 스크립트가 이 오리진에서 실행되는
      // 것을 막는다. <img>로 렌더할 땐 어차피 실행 안 되므로 영향 없음.
      "content-security-policy": "default-src 'none'; sandbox",
    },
  });
}
