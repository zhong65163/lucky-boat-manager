@echo off
chcp 65001 >nul

echo 🚀 Lucky Boat 账号管理系统 - Vercel 部署
echo ============================================

REM 检查 Git 是否已初始化
if not exist ".git" (
    echo 📝 初始化 Git 仓库...
    git init
    echo ✅ Git 仓库初始化完成
)

REM 添加文件到 Git
echo 📦 添加文件到 Git...
git add .

REM 创建提交
echo 💾 创建 Git 提交...
for /f "tokens=1-4 delims=/ " %%a in ("%date%") do set mydate=%%a-%%b-%%c
for /f "tokens=1-2 delims=: " %%a in ("%time%") do set mytime=%%a:%%b
git commit -m "Deploy: Lucky Boat Account Manager System %mydate% %mytime%"

echo ✅ Git 准备完成
echo.
echo 🔗 接下来的步骤:
echo 1. 将代码推送到 GitHub/GitLab:
echo    git remote add origin https://github.com/your-username/your-repo.git
echo    git push -u origin main
echo.
echo 2. 在 Vercel 部署:
echo    - 访问 https://vercel.com
echo    - 导入你的 Git 仓库
echo    - 点击部署
echo.
echo 3. 获取部署地址并配置主应用
echo    查看 VERCEL_DEPLOY.md 获取详细说明
echo.
echo 📁 部署文件已准备就绪！
pause