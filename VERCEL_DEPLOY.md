# Vercel 部署指南

## 📋 部署前准备

您需要将这些文件上传到 Git 仓库（GitHub/GitLab/Bitbucket）：

```
account-manager-deploy/
├── database/           # 数据库初始化
├── server/            # Express API 服务器
├── web/               # Web 管理界面
├── package.json       # 依赖配置
├── vercel.json        # Vercel 配置
├── .gitignore         # Git 忽略文件
└── README.md          # 项目说明
```

## 🚀 快速部署步骤

### 1. 上传代码到 Git

```bash
# 在 account-manager-deploy 目录中执行

# 初始化 Git 仓库
git init

# 添加所有文件
git add .

# 创建提交
git commit -m "初始化账号管理系统"

# 连接到远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/yourusername/lucky-boat-account-manager.git

# 推送代码
git push -u origin main
```

### 2. Vercel 部署

1. 访问 [vercel.com](https://vercel.com)
2. 使用 GitHub/GitLab 账号登录
3. 点击 "New Project"
4. 选择你上传的仓库
5. 项目设置：
   - **Root Directory**: 保持默认（留空）
   - **Framework Preset**: Other
   - **Build Command**: 留空
   - **Output Directory**: 留空
   - **Install Command**: `npm install`
6. 点击 "Deploy"

### 3. 获取部署地址

部署完成后，您会得到类似这样的 URL：
```
https://your-project-name.vercel.app
```

## ⚙️ 配置说明

### Vercel 配置文件 (vercel.json)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "server/server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 环境变量
如需设置环境变量，在 Vercel 项目设置中添加：
- `NODE_ENV` = `production`
- `PORT` = `8001` (可选)

## 🔧 主应用配置

部署成功后，需要在主应用中配置 API 地址：

在 `src/services/accountManagerApi.ts` 中修改：
```typescript
const ACCOUNT_MANAGER_API_BASE = process.env.NODE_ENV === 'production'
  ? 'https://your-deployed-url.vercel.app/api'  // 替换为你的 Vercel URL
  : 'http://localhost:8001/api';
```

然后重新打包主应用：
```bash
npm run build
npm run pack
```

## ✅ 验证部署

访问以下地址验证部署是否成功：

1. **健康检查**: `https://your-url.vercel.app/api/health`
2. **Web 界面**: `https://your-url.vercel.app`
3. **账号列表**: `https://your-url.vercel.app/api/accounts`

## ⚠️ 重要说明

### 数据存储限制
- Vercel 的无服务器函数是无状态的
- SQLite 数据库文件在每次部署时会重置
- **生产环境建议使用外部数据库**（如 PlanetScale, Railway 等）

### 替代方案
如需持久化数据存储，建议使用：
1. **Railway** - 支持 SQLite 持久化
2. **Render** - 支持持久化文件系统
3. **传统 VPS** - 完全控制

## 🛠️ 故障排除

### 部署失败
1. 检查 `package.json` 文件格式
2. 确认所有必要文件已上传
3. 查看 Vercel 部署日志

### API 无法访问
1. 确认 `vercel.json` 路由配置正确
2. 检查函数超时设置
3. 查看 Vercel 函数日志

### 数据库问题
由于 Vercel 无状态特性：
- 每次访问都会重新初始化数据库
- 建议在生产环境使用云数据库
- 测试环境可以接受数据重置

---

**注意**: 此部署方案适用于测试和演示，生产环境建议使用支持持久化存储的平台。