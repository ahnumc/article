# AHNUMC News

兼容 SJMCL/AHNUMCL 新闻源格式的独立新闻站。

```powershell
copy .env.example .env
npm install
npm run dev
```

打开 `http://localhost:3000/admin` 登录后台。将 `https://your-domain/v1/articles` 加入启动器的 `discoverSourceEndpoints` 即可订阅。首次启动会使用 `.env` 中的 `ADMIN_EMAIL` 和 `ADMIN_PASSWORD` 创建管理员。
