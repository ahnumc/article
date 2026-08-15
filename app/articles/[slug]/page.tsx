import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { db } from "../../../lib/db";
export const dynamic = "force-dynamic";
export default async function Article({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const a:any=db.prepare("SELECT * FROM articles WHERE slug=? AND status='published'").get(slug);if(!a)notFound();return <main className="article"><small>{a.category} · {new Date(a.created_at).toLocaleDateString("zh-CN")}</small><h1>{a.title}</h1><p className="lead">{a.abstract}</p>{a.image_url&&<img className="cover" src={a.image_url} alt=""/>}<div className="markdown"><ReactMarkdown remarkPlugins={[remarkGfm]}>{a.body}</ReactMarkdown></div></main>}
