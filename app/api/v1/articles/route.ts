import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { apiPost } from "../../../../lib/articles";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  const size = Math.min(Math.max(Number(req.nextUrl.searchParams.get("pageSize") || 12), 1), 50);
  const cursor = Number(req.nextUrl.searchParams.get("cursor") || 0);
  const rows = db.prepare("SELECT * FROM articles WHERE status='published' AND (?=0 OR id<?) ORDER BY id DESC LIMIT ?").all(cursor, cursor, size + 1) as any[];
  const hasMore = rows.length > size; const page = rows.slice(0,size); const base = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin;
  const posts = page.map(a => apiPost(a, base));
  const response = NextResponse.json({ sourceInfo:{name:"AHNUMC",fullName:"AHNUMC News",iconSrc:`${base}/icon.png`}, posts, next:hasMore ? page[page.length-1].id : null });
  response.headers.set("Access-Control-Allow-Origin", "*");
  return response;
}
