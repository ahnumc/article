import { NextResponse } from "next/server";
import { db, hash } from "../../../../lib/db";
import { currentUser } from "../../../../lib/auth";
export const dynamic = "force-dynamic";
export async function GET(){if(!await currentUser())return NextResponse.json({error:"Unauthorized"},{status:401});return NextResponse.json(db.prepare("SELECT id,email,role,created_at FROM users ORDER BY id").all());}
export async function POST(req:Request){const actor=await currentUser();if(!actor)return NextResponse.json({error:"Unauthorized"},{status:401});const {email,password,role="editor"}=await req.json();if(!email||!password)return NextResponse.json({error:"email and password required"},{status:400});try{const r=db.prepare("INSERT INTO users(email,password_hash,role,created_at) VALUES(?,?,?,?)").run(email,hash(password),role,new Date().toISOString());return NextResponse.json({id:r.lastInsertRowid,email,role});}catch{return NextResponse.json({error:"email already exists"},{status:409});}}
