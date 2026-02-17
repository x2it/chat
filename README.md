# 飞书 CMS 动态博客

本项目使用飞书多维表格作为内容管理系统（CMS），通过 Cloudflare Worker 代理获取数据，实现动态博客功能。

## 项目结构

```
├── index.html          # 个人主页（静态）
├── blog.html           # 博客列表页（动态）
├── works.html          # 作品集页（静态）
├── assets/
│   └── css/
│       └── style.css   # 全站样式
├── worker.js           # Cloudflare Worker 代理脚本
├── wrangler.toml       # Cloudflare Worker 配置文件
└── README.md           # 项目说明
```

## 功能说明

1. **飞书多维表格**：作为内容管理后台，存储博客文章数据
2. **Cloudflare Worker**：作为代理服务，安全调用飞书 API 并返回数据
3. **动态博客**：blog.html 通过 JavaScript 调用 Worker 获取数据并动态生成文章卡片

## Cloudflare Worker 部署

### 1. 安装 Wrangler CLI

```bash
npm install -g wrangler
```

### 2. 登录 Cloudflare

```bash
wrangler login
```

### 3. 配置 wrangler.toml

编辑 `wrangler.toml` 文件，填写你的 Cloudflare 账户 ID：

```toml
account_id = "your-account-id"
```

### 4. 部署 Worker

```bash
wrangler publish
```

### 5. 配置环境变量

在 Cloudflare 控制台中为 Worker 设置以下环境变量：

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| FEISHU_APP_ID | 飞书应用 ID | `cli_a1b2c3d4e5f6` |
| FEISHU_APP_SECRET | 飞书应用密钥 | `abcdef1234567890` |
| FEISHU_APP_TOKEN | 飞书多维表格 APP_TOKEN | `O0MmbvnrbahpTFsc0Nzczkl3nVf` |
| FEISHU_TABLE_ID | 飞书多维表格 TABLE_ID | `tblti06E1WY7GwoE` |

### 6. 获取 Worker 访问地址

部署成功后，你将获得一个 Worker 访问地址，格式类似于：

```
https://feishu-cms-proxy.yourname.workers.dev
```

## 配置 blog.html

编辑 `blog.html` 文件，将 Worker 地址替换为你的实际地址：

```javascript
// 从 Cloudflare Worker 获取数据
const response = await fetch('https://your-worker.workers.dev');
```

## 飞书多维表格字段要求

为了确保数据正常显示，飞书多维表格需要包含以下字段：

| 字段名 | 类型 | 说明 |
|--------|------|------|
| title | 文本 | 文章标题 |
| category | 文本 | 文章分类（筛选值："博客"） |
| publish_date | 日期 | 发布时间 |
| excerpt | 文本 | 文章摘要 |
| link | 文本 | 文章链接 |

## 运行项目

将项目部署到任何静态网站托管服务（如 GitHub Pages、Vercel、Netlify 等）即可。

## 注意事项

1. 确保飞书应用已获得 `bitable:app` 和 `bitable:table` 的权限
2. 确保 Cloudflare Worker 环境变量配置正确
3. 首次访问可能需要等待几秒钟，因为 Worker 需要获取飞书访问令牌

## 故障排除

- **数据加载失败**：检查 Worker 环境变量配置，确保飞书应用权限正确
- **文章不显示**：检查飞书表格中的分类字段是否设置为"博客"
- **样式问题**：确保 style.css 文件路径正确，且文章卡片结构与样式匹配
