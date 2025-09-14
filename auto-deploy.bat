@echo off
chcp 65001 >nul

echo 🚀 Lucky Boat 账号管理系统 - 自动化部署脚本
echo ================================================

echo.
echo 📋 当前Git状态:
echo    账号: zhong65163
echo    邮箱: levitchmcadam@gmail.com
echo    分支: main
echo    提交: 3个提交已准备好推送

echo.
echo 🔗 需要手动创建GitHub仓库:
echo.
echo 方法1: 访问 https://github.com/new
echo    - Repository name: lucky-boat-manager
echo    - Description: Lucky Boat Account Management System
echo    - Public/Private: 选择一个
echo    - 不要添加 README, .gitignore, license
echo    - 点击 Create repository
echo.

echo 方法2: 如果有GitHub CLI，运行:
echo    gh repo create zhong65163/lucky-boat-manager --public
echo.

echo 📤 创建仓库后，运行以下命令推送:
echo    git push -u origin main
echo.

echo ✅ 推送成功后，您可以在以下地址查看:
echo    https://github.com/zhong65163/lucky-boat-manager
echo.

echo 🌐 然后可以部署到Vercel:
echo    1. 访问 https://vercel.com
echo    2. 导入GitHub仓库
echo    3. 一键部署
echo.

echo 📁 所有文件已准备就绪! 按任意键退出...
pause