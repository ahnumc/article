import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { currentUser } from "../../../../lib/auth";

export const dynamic = "force-dynamic";
const allowed = new Map([["image/png","png"],["image/jpeg","jpg"],["image/webp","webp"],["image/gif","gif"]]);

export async function POST(request:Request){
  if(!await currentUser())return NextResponse.json({error:"Unauthorized"},{status:401});
  const data=await request.formData();const file=data.get("file");
  if(!(file instanceof File))return NextResponse.json({error:"file required"},{status:400});
  const extension=allowed.get(file.type);if(!extension)return NextResponse.json({error:"unsupported image type"},{status:415});
  if(file.size>8*1024*1024)return NextResponse.json({error:"file too large"},{status:413});
  const folder=path.join(process.cwd(),"public","uploads");await fs.mkdir(folder,{recursive:true});
  const name=`${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${extension}`;
  await fs.writeFile(path.join(folder,name),Buffer.from(await file.arrayBuffer()));
  return NextResponse.json({url:`/uploads/${name}`});
}
