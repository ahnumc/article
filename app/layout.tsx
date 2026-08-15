import "./styles.css";
export const metadata={title:"AHNUMC News",description:"Minecraft community news"};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="zh-CN"><body><header><a href="/" className="brand">AHNUMC <span>NEWS</span></a><nav><a href="/">首页</a><a href="/?category=News">新闻</a><a href="/admin">管理</a></nav></header>{children}<footer>AHNUMC News · Minecraft community updates</footer></body></html>}
