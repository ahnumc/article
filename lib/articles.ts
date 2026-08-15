import { db } from "./db";
export type Article = { id:number; slug:string; title:string; abstract:string; body:string; keywords:string; image_url:string; image_width:number; image_height:number; category:string; status:string; created_at:string; updated_at:string };
export function apiPost(a: Article, base: string) { return { title:a.title, abstract:a.abstract, keywords:a.keywords, imageSrc:[a.image_url,a.image_width,a.image_height], source:{name:"AHNUMC",fullName:"AHNUMC News",endpointUrl:`${base}/v1/articles`,iconSrc:`${base}/icon.png`}, createAt:a.created_at, link:`${base}/articles/${a.slug}` }; }
export function slugify(v:string) { return v.toLowerCase().trim().replace(/[^a-z0-9\s-]/g,"").replace(/[\s-]+/g,"-").replace(/^-|-$/g,"") || `article-${Date.now()}`; }
