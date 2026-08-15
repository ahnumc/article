"use client";

import { ChangeEvent, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Mode = "write" | "split" | "preview";
type FormState = { email:string; password:string; title:string; abstract:string; body:string; keywords:string; category:string; status:string; imageUrl:string };

const initialForm: FormState = { email:"", password:"", title:"", abstract:"", body:"", keywords:"", category:"News", status:"published", imageUrl:"" };

export default function Admin() {
  const [logged, setLogged] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [mode, setMode] = useState<Mode>("split");
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const login = async () => {
    const response = await fetch("/api/auth/login", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({email:form.email,password:form.password}) });
    if (!response.ok) return setMessage("邮箱或密码错误");
    setLogged(true); setMessage("");
  };

  const publish = async () => {
    if (!form.title.trim() || !form.body.trim()) return setMessage("请填写标题和正文");
    setMessage("正在保存...");
    const response = await fetch("/api/admin/articles", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form) });
    if (!response.ok) return setMessage("保存失败，请稍后重试");
    setMessage(form.status === "published" ? "文章已发布" : "草稿已保存");
  };

  const insert = (before:string, after="", placeholder="文本") => {
    const editor = editorRef.current; if (!editor) return;
    const start=editor.selectionStart, end=editor.selectionEnd;
    const selected=form.body.slice(start,end) || placeholder;
    const next=form.body.slice(0,start)+before+selected+after+form.body.slice(end);
    setForm({...form,body:next});
    requestAnimationFrame(()=>{editor.focus();editor.setSelectionRange(start+before.length,start+before.length+selected.length);});
  };

  const linePrefix = (prefix:string) => {
    const editor=editorRef.current;if(!editor)return;
    const start=editor.selectionStart,end=editor.selectionEnd;
    const lineStart=form.body.lastIndexOf("\n",start-1)+1;
    const selected=form.body.slice(lineStart,end)||"内容";
    const transformed=selected.split("\n").map(line=>prefix+line).join("\n");
    setForm({...form,body:form.body.slice(0,lineStart)+transformed+form.body.slice(end)});
    requestAnimationFrame(()=>editor.focus());
  };

  const uploadImage = async (event:ChangeEvent<HTMLInputElement>) => {
    const file=event.target.files?.[0]; if(!file)return;
    setUploading(true); setMessage("正在上传图片...");
    const payload=new FormData();payload.append("file",file);
    const response=await fetch("/api/admin/uploads",{method:"POST",body:payload});
    if(!response.ok){setUploading(false);setMessage("图片上传失败，仅支持 PNG、JPEG、WebP、GIF，最大 8 MB");return;}
    const {url}=await response.json();
    insert(`![${file.name.replace(/\.[^.]+$/,"")}](`,")",url);
    if(!form.imageUrl)setForm(current=>({...current,imageUrl:url,body:current.body}));
    setUploading(false);setMessage("图片已插入正文");event.target.value="";
  };

  if (!logged) return <main className="admin login-shell"><div><p className="eyebrow">EDITOR ACCESS</p><h1>新闻管理</h1><p className="muted">登录后撰写和发布 AHNUMC 社区新闻。</p></div><div className="panel login-panel"><label>邮箱<input placeholder="admin@example.com" autoComplete="email" onChange={e=>setForm({...form,email:e.target.value})}/></label><label>密码<input placeholder="请输入密码" type="password" autoComplete="current-password" onKeyDown={e=>e.key==="Enter"&&login()} onChange={e=>setForm({...form,password:e.target.value})}/></label>{message&&<p className="form-message error">{message}</p>}<button onClick={login}>登录</button></div></main>;

  return <main className="admin editor-page">
    <div className="editor-heading"><div><p className="eyebrow">AHNUMC PUBLISHING</p><h1>撰写新闻</h1></div><div className="publish-actions"><select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option value="draft">保存为草稿</option><option value="published">立即发布</option></select><button onClick={publish}>{form.status==="published"?"发布文章":"保存草稿"}</button></div></div>
    <section className="article-fields">
      <label className="title-field"><span>文章标题</span><input value={form.title} placeholder="输入一个清晰、具体的标题" onChange={e=>setForm({...form,title:e.target.value})}/></label>
      <label><span>摘要</span><textarea rows={2} value={form.abstract} placeholder="用一两句话概括文章内容" onChange={e=>setForm({...form,abstract:e.target.value})}/></label>
      <div className="field-row"><label><span>分类</span><input value={form.category} onChange={e=>setForm({...form,category:e.target.value})}/></label><label><span>标签</span><input value={form.keywords} placeholder="Minecraft, 社区" onChange={e=>setForm({...form,keywords:e.target.value})}/></label><label><span>封面 URL</span><input value={form.imageUrl} placeholder="上传首张图片后自动填写" onChange={e=>setForm({...form,imageUrl:e.target.value})}/></label></div>
    </section>
    <section className="md-editor">
      <div className="editor-topbar">
        <div className="format-tools">
          <button title="标题" onClick={()=>linePrefix("## ")}>H</button><button title="粗体" onClick={()=>insert("**","**","粗体")}>B</button><button title="斜体" onClick={()=>insert("*","*","斜体")}>I</button><button title="引用" onClick={()=>linePrefix("> ")}>❯</button><button title="无序列表" onClick={()=>linePrefix("- ")}>☷</button><button title="有序列表" onClick={()=>linePrefix("1. ")}>≡</button><button title="行内代码" onClick={()=>insert("`","`","代码")}>{"<>"}</button><button title="链接" onClick={()=>insert("[","](https://)","链接文本")}>↗</button><button title="上传并插入图片" disabled={uploading} onClick={()=>fileRef.current?.click()}>▧</button><span className="tool-divider"/><button title="撤销" onClick={()=>document.execCommand("undo")}>↶</button><button title="重做" onClick={()=>document.execCommand("redo")}>↷</button>
          <input ref={fileRef} className="file-input" type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={uploadImage}/>
        </div>
        <div className="mode-switch"><button className={mode==="write"?"active":""} onClick={()=>setMode("write")}>编辑</button><button className={mode==="split"?"active":""} onClick={()=>setMode("split")}>分屏</button><button className={mode==="preview"?"active":""} onClick={()=>setMode("preview")}>预览</button></div>
      </div>
      <div className={`editor-workspace mode-${mode}`}>
        {mode!=="preview"&&<div className="write-pane"><textarea ref={editorRef} value={form.body} spellCheck={false} placeholder="# 从这里开始写作..." onChange={e=>setForm({...form,body:e.target.value})}/><span className="word-count">{form.body.length} 字符</span></div>}
        {mode!=="write"&&<div className="preview-pane markdown">{form.body?<ReactMarkdown remarkPlugins={[remarkGfm]}>{form.body}</ReactMarkdown>:<p className="preview-empty">预览会显示在这里</p>}</div>}
      </div>
    </section>
    {message&&<div className="status-bar">{message}</div>}
  </main>;
}
