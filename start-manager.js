#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// 颜色输出
const colors = {
  green: text => `\x1b[32m${text}\x1b[0m`,
  red: text => `\x1b[31m${text}\x1b[0m`,
  yellow: text => `\x1b[33m${text}\x1b[0m`,
  blue: text => `\x1b[34m${text}\x1b[0m`,
  cyan: text => `\x1b[36m${text}\x1b[0m`,
  bold: text => `\x1b[1m${text}\x1b[0m`,
};

// 配置
const MANAGER_DIR = __dirname;
const SERVER_DIR = path.join(MANAGER_DIR, 'server');
const DATABASE_DIR = path.join(MANAGER_DIR, 'database');
const WEB_DIR = path.join(MANAGER_DIR, 'web');

console.log(`
${colors.cyan('🎯 Lucky Boat Monitor - 账号管理系统启动器')}
${'='.repeat(60)}
`);

// 检查依赖
async function checkDependencies() {
  console.log(colors.blue('📋 检查系统依赖...'));
  
  const checks = [
    {
      name: 'Node.js',
      check: () => {
        try {
          const version = process.version;
          console.log(colors.green(`   ✅ Node.js ${version}`));
          return true;
        } catch {
          console.log(colors.red('   ❌ Node.js 未找到'));
          return false;
        }
      }
    },
    {
      name: '服务器目录',
      check: () => {
        if (fs.existsSync(SERVER_DIR)) {
          console.log(colors.green('   ✅ 服务器目录存在'));
          return true;
        } else {
          console.log(colors.red('   ❌ 服务器目录不存在'));
          return false;
        }
      }
    },
    {
      name: '数据库目录',
      check: () => {
        if (fs.existsSync(DATABASE_DIR)) {
          console.log(colors.green('   ✅ 数据库目录存在'));
          return true;
        } else {
          console.log(colors.red('   ❌ 数据库目录不存在'));
          return false;
        }
      }
    },
    {
      name: 'Web界面目录',
      check: () => {
        if (fs.existsSync(WEB_DIR)) {
          console.log(colors.green('   ✅ Web界面目录存在'));
          return true;
        } else {
          console.log(colors.red('   ❌ Web界面目录不存在'));
          return false;
        }
      }
    },
    {
      name: '服务器依赖',
      check: () => {
        const packagePath = path.join(SERVER_DIR, 'package.json');
        const nodeModulesPath = path.join(SERVER_DIR, 'node_modules');
        
        if (fs.existsSync(packagePath) && fs.existsSync(nodeModulesPath)) {
          console.log(colors.green('   ✅ 服务器依赖已安装'));
          return true;
        } else {
          console.log(colors.yellow('   ⚠️ 服务器依赖需要安装'));
          return false;
        }
      }
    },
    {
      name: '数据库文件',
      check: () => {
        const dbPath = path.join(DATABASE_DIR, 'accounts.db');
        if (fs.existsSync(dbPath)) {
          console.log(colors.green('   ✅ 数据库文件存在'));
          return true;
        } else {
          console.log(colors.yellow('   ⚠️ 数据库文件需要初始化'));
          return false;
        }
      }
    }
  ];

  let allGood = true;
  for (const check of checks) {
    if (!check.check()) {
      allGood = false;
    }
  }

  return allGood;
}

// 安装依赖
async function installDependencies() {
  console.log(colors.blue('📦 安装服务器依赖...'));
  
  return new Promise((resolve, reject) => {
    const npm = spawn('npm', ['install'], {
      cwd: SERVER_DIR,
      stdio: 'inherit',
      shell: true
    });

    npm.on('close', (code) => {
      if (code === 0) {
        console.log(colors.green('✅ 依赖安装完成'));
        resolve();
      } else {
        console.log(colors.red('❌ 依赖安装失败'));
        reject(new Error(`npm install failed with code ${code}`));
      }
    });

    npm.on('error', (error) => {
      console.log(colors.red('❌ 启动npm失败:'), error.message);
      reject(error);
    });
  });
}

// 初始化数据库
async function initializeDatabase() {
  console.log(colors.blue('🗄️ 初始化数据库...'));
  
  return new Promise((resolve, reject) => {
    const node = spawn('node', ['init.js'], {
      cwd: DATABASE_DIR,
      stdio: 'inherit',
      shell: true
    });

    node.on('close', (code) => {
      if (code === 0) {
        console.log(colors.green('✅ 数据库初始化完成'));
        resolve();
      } else {
        console.log(colors.red('❌ 数据库初始化失败'));
        reject(new Error(`Database init failed with code ${code}`));
      }
    });

    node.on('error', (error) => {
      console.log(colors.red('❌ 数据库初始化过程出错:'), error.message);
      reject(error);
    });
  });
}

// 启动服务器
function startServer() {
  console.log(colors.blue('🚀 启动账号管理服务器...'));
  
  const server = spawn('node', ['server.js'], {
    cwd: SERVER_DIR,
    stdio: 'inherit',
    shell: true
  });

  server.on('close', (code) => {
    console.log(colors.yellow(`🛑 服务器已停止 (退出码: ${code})`));
  });

  server.on('error', (error) => {
    console.log(colors.red('❌ 启动服务器失败:'), error.message);
  });

  // 优雅关闭
  process.on('SIGINT', () => {
    console.log(colors.yellow('\n🛑 正在关闭账号管理服务器...'));
    server.kill('SIGINT');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log(colors.yellow('\n🛑 正在关闭账号管理服务器...'));
    server.kill('SIGTERM');
    process.exit(0);
  });

  return server;
}

// 显示服务信息
function showServiceInfo() {
  console.log(`
${colors.green('🎉 账号管理系统已启动成功！')}
${'='.repeat(60)}

📡 ${colors.bold('服务地址:')}
   • API接口: ${colors.cyan('http://localhost:3001/api')}
   • Web管理界面: ${colors.cyan('http://localhost:3001')}
   • 健康检查: ${colors.cyan('http://localhost:3001/api/health')}

🔧 ${colors.bold('常用API接口:')}
   • GET  /api/accounts           获取所有账号
   • POST /api/accounts           添加新账号
   • GET  /api/accounts/:username/check  检查账号授权
   • DELETE /api/accounts/:username      删除账号
   • GET  /api/statistics         获取统计信息

💡 ${colors.bold('使用提示:')}
   • 打开浏览器访问 Web 管理界面进行可视化管理
   • 使用 Ctrl+C 停止服务
   • 查看控制台输出获取实时日志信息

📚 ${colors.bold('相关文件:')}
   • 数据库: ${DATABASE_DIR}/accounts.db
   • 配置: ${SERVER_DIR}/server.js
   • Web界面: ${WEB_DIR}/index.html

${'='.repeat(60)}
`);
}

// 主启动流程
async function main() {
  try {
    // 检查依赖
    const depsOk = await checkDependencies();
    
    if (!depsOk) {
      console.log(colors.yellow('\n🔧 正在自动修复问题...\n'));
      
      // 检查并安装服务器依赖
      const nodeModulesPath = path.join(SERVER_DIR, 'node_modules');
      if (!fs.existsSync(nodeModulesPath)) {
        await installDependencies();
      }
      
      // 检查并初始化数据库
      const dbPath = path.join(DATABASE_DIR, 'accounts.db');
      if (!fs.existsSync(dbPath)) {
        await initializeDatabase();
      }
    }
    
    // 最终检查
    console.log(colors.blue('\n🔍 最终检查...'));
    const finalCheck = await checkDependencies();
    
    if (!finalCheck) {
      console.log(colors.red('\n❌ 系统检查失败，请手动检查配置'));
      process.exit(1);
    }
    
    console.log(colors.green('\n✅ 所有检查通过，启动服务...\n'));
    
    // 启动服务器
    startServer();
    
    // 等待服务器启动
    setTimeout(() => {
      showServiceInfo();
    }, 2000);
    
  } catch (error) {
    console.error(colors.red('\n💥 启动失败:'), error.message);
    process.exit(1);
  }
}

// 命令行参数处理
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
${colors.cyan('Lucky Boat Monitor - 账号管理系统启动器')}

用法:
  node start-manager.js [选项]

选项:
  --help, -h          显示帮助信息
  --install-deps      仅安装依赖
  --init-db           仅初始化数据库
  --check             仅检查系统状态

示例:
  node start-manager.js           # 完整启动
  node start-manager.js --check   # 检查状态
  `);
  process.exit(0);
}

if (args.includes('--check')) {
  checkDependencies().then(ok => {
    process.exit(ok ? 0 : 1);
  });
} else if (args.includes('--install-deps')) {
  installDependencies().then(() => {
    console.log(colors.green('✅ 依赖安装完成'));
    process.exit(0);
  }).catch(error => {
    console.error(colors.red('❌ 安装失败:'), error.message);
    process.exit(1);
  });
} else if (args.includes('--init-db')) {
  initializeDatabase().then(() => {
    console.log(colors.green('✅ 数据库初始化完成'));
    process.exit(0);
  }).catch(error => {
    console.error(colors.red('❌ 初始化失败:'), error.message);
    process.exit(1);
  });
} else {
  // 默认：完整启动
  main();
}