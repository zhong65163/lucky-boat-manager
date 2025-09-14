# 账号管理系统部署指南

## 🚀 Vercel 部署（推荐）

### 前置条件
1. 注册 [Vercel](https://vercel.com) 账号
2. 安装 Vercel CLI: `npm i -g vercel`

### 部署步骤
```bash
# 1. 进入account-manager目录
cd account-manager

# 2. 登录Vercel
vercel login

# 3. 部署
vercel --prod

# 4. 获得的URL类似: https://your-project.vercel.app
```

## 🛠️ Railway 部署

1. 访问 [Railway](https://railway.app)
2. 连接GitHub仓库
3. 选择account-manager目录
4. 自动部署

## 🏷️ 域名配置

部署成功后，你会得到类似这样的URL：
- Vercel: `https://lucky-boat-accounts.vercel.app`
- Railway: `https://lucky-boat-accounts.railway.app`

## 📝 更新主应用配置

部署成功后，需要更新主应用中的API地址：

在 `src/services/accountManagerApi.ts` 中修改：
```javascript
const ACCOUNT_MANAGER_API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://your-deployed-url.vercel.app/api'  // 替换为你的域名
  : 'http://localhost:8001/api';
```

## 🔄 重新打包应用

修改配置后重新打包：
```bash
npm run pack:zip
```

## ✅ 验证部署

访问 `https://your-domain.com/api/health` 检查服务状态。