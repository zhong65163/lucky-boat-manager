# GitHub 仓库设置指南

## 🚀 快速部署步骤

### 1. 创建 GitHub 仓库

1. 访问 [GitHub](https://github.com)
2. 点击右上角的 "+" 按钮，选择 "New repository"
3. 仓库设置：
   - **Repository name**: `lucky-boat-account-manager`
   - **Description**: `Lucky Boat Monitor Account Management System`
   - **Visibility**: Public 或 Private（推荐Private）
   - **不要勾选**: Add a README file, .gitignore, license
4. 点击 "Create repository"

### 2. 推送代码到 GitHub

复制以下命令到终端运行：

```bash
# 进入项目目录
cd account-manager-deploy

# 添加远程仓库（替换为你的GitHub用户名）
git remote add origin https://github.com/YOUR_USERNAME/lucky-boat-account-manager.git

# 推送代码
git branch -M main
git push -u origin main
```

**注意**: 将 `YOUR_USERNAME` 替换为你的 GitHub 用户名

### 3. 验证上传成功

推送完成后，在 GitHub 仓库页面应该能看到以下文件：

```
lucky-boat-account-manager/
├── database/           # 数据库初始化
├── server/            # Express API服务器
├── web/               # Web管理界面
├── .gitignore         # Git忽略规则
├── DEPLOY.md          # 部署说明
├── README.md          # 项目文档
├── VERCEL_DEPLOY.md   # Vercel部署指南
├── deploy.bat         # Windows部署脚本
├── deploy.sh          # Linux部署脚本
├── package.json       # 项目配置
├── vercel.json        # Vercel配置
└── start-manager.js   # 启动脚本
```

## 🌐 Vercel 部署

代码推送成功后，即可进行 Vercel 部署：

1. 访问 [vercel.com](https://vercel.com)
2. 使用 GitHub 账号登录
3. 点击 "New Project"
4. 选择 `lucky-boat-account-manager` 仓库
5. 项目设置保持默认
6. 点击 "Deploy"

## 📋 部署后配置

### 获取部署地址
部署成功后，Vercel 会提供一个 URL，例如：
```
https://lucky-boat-account-manager.vercel.app
```

### 配置主应用
在主应用的 `src/services/accountManagerApi.ts` 中更新：
```typescript
const ACCOUNT_MANAGER_API_BASE = process.env.NODE_ENV === 'production'
  ? 'https://lucky-boat-account-manager.vercel.app/api'
  : 'http://localhost:8001/api';
```

### 重新打包主应用
```bash
npm run build
npm run pack
```

## ✅ 测试验证

访问以下地址验证部署：

1. **健康检查**: `https://your-url.vercel.app/api/health`
2. **Web界面**: `https://your-url.vercel.app`
3. **账号API**: `https://your-url.vercel.app/api/accounts`

## 📝 Git 状态

当前 Git 仓库状态：
- ✅ 仓库已初始化
- ✅ 所有文件已添加并提交
- ✅ 提交信息：初始化账号管理系统
- ⏳ 等待推送到远程仓库

## 🔗 相关文件

- **完整部署指南**: [VERCEL_DEPLOY.md](VERCEL_DEPLOY.md)
- **项目文档**: [README.md](README.md)
- **快速部署**: 运行 `deploy.bat`（Windows）或 `deploy.sh`（Linux）

---

**下一步**: 创建 GitHub 仓库并推送代码