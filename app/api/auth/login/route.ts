import { NextResponse } from "next/server";
import { db, hash } from "../../../../lib/db";
import { makeSession } from "../../../../lib/auth";
export async function POST(req: Request) { const {email,password}=await req.json(); const user:any=db.prepare("SELECT * FROM users WHERE email=?").get(email); if(!user || hash(password)!==user.password_hash) return NextResponse.json({error:"Invalid credentials"},{status:401}); const res=NextResponse.json({ok:true}); res.cookies.set("news_session",makeSession(user.id),{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",maxAge:86400*7,path:"/"}); return res; }
