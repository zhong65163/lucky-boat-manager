#!/usr/bin/env node

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');

// 导入数据库
const { AccountDatabase } = require('../database/init');

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 8001;

// 安全中间件
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-hashes'"],
      scriptSrcAttr: ["'unsafe-inline'", "'unsafe-hashes'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      imgSrc: ["'self'", "data:"],
      fontSrc: ["'self'", "https:", "data:"]
    }
  }
}));
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5176', 'http://127.0.0.1:3000', 'http://127.0.0.1:5176'],
  credentials: true
}));

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP最多100个请求
  message: {
    error: '请求过于频繁，请稍后再试',
    retryAfter: '15分钟后'
  }
});
app.use(limiter);

// 中间件
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 静态文件服务（为Web界面提供）
app.use(express.static(path.join(__dirname, '../web')));

// 初始化数据库
const db = new AccountDatabase();

// ===================== API 路由 =====================

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    status: 'success',
    message: '账号管理服务运行正常',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 获取所有授权账号
app.get('/api/accounts', async (req, res) => {
  try {
    const accounts = await db.getAllAccounts();
    res.json({
      status: 'success',
      data: accounts,
      total: accounts.length
    });
  } catch (error) {
    console.error('获取账号列表失败:', error);
    res.status(500).json({
      status: 'error',
      message: '获取账号列表失败',
      error: error.message
    });
  }
});

// 检查单个账号授权状态
app.get('/api/accounts/:username/check', async (req, res) => {
  try {
    const { username } = req.params;
    const account = await db.checkAuthorization(username);
    
    if (account) {
      res.json({
        status: 'success',
        authorized: true,
        data: account
      });
    } else {
      res.json({
        status: 'success',
        authorized: false,
        message: '账号未授权或已过期'
      });
    }
  } catch (error) {
    console.error('检查账号授权失败:', error);
    res.status(500).json({
      status: 'error',
      message: '检查账号授权失败',
      error: error.message
    });
  }
});

// 添加授权账号
app.post('/api/accounts', async (req, res) => {
  try {
    const { username, display_name, email, permission_level, expires_at, note } = req.body;
    
    // 基本验证
    if (!username) {
      return res.status(400).json({
        status: 'error',
        message: '用户名不能为空'
      });
    }
    
    // 检查账号是否已存在
    const existingAccounts = await db.getAllAccounts();
    const exists = existingAccounts.find(acc => acc.username.toLowerCase() === username.toLowerCase());
    
    if (exists) {
      return res.status(409).json({
        status: 'error',
        message: '账号已存在'
      });
    }
    
    const accountData = {
      username,
      display_name: display_name || `用户${username}`,
      email,
      permission_level: permission_level || 1,
      expires_at: expires_at || null,
      note: note || '通过API添加',
      created_by: 'api'
    };
    
    const result = await db.addAccount(accountData);
    
    // 记录操作日志
    await db.logOperation({
      operator: 'api',
      operation: 'ADD_ACCOUNT',
      target_username: username,
      details: accountData,
      ip_address: req.ip
    });
    
    res.status(201).json({
      status: 'success',
      message: '账号添加成功',
      data: result
    });
    
  } catch (error) {
    console.error('添加账号失败:', error);
    res.status(500).json({
      status: 'error',
      message: '添加账号失败',
      error: error.message
    });
  }
});

// 删除授权账号
app.delete('/api/accounts/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    const success = await db.deleteAccount(username);
    
    if (success) {
      // 记录操作日志
      await db.logOperation({
        operator: 'api',
        operation: 'DELETE_ACCOUNT',
        target_username: username,
        details: { deleted_by: 'api' },
        ip_address: req.ip
      });
      
      res.json({
        status: 'success',
        message: '账号删除成功'
      });
    } else {
      res.status(404).json({
        status: 'error',
        message: '账号不存在'
      });
    }
  } catch (error) {
    console.error('删除账号失败:', error);
    res.status(500).json({
      status: 'error',
      message: '删除账号失败',
      error: error.message
    });
  }
});

// 更新账号状态（启用/禁用）
app.patch('/api/accounts/:username/status', async (req, res) => {
  try {
    const { username } = req.params;
    const { status } = req.body;
    
    if (status === undefined) {
      return res.status(400).json({
        status: 'error',
        message: '状态参数不能为空'
      });
    }
    
    const success = await db.updateAccountStatus(username, status);
    
    if (success) {
      // 记录操作日志
      await db.logOperation({
        operator: 'api',
        operation: 'UPDATE_STATUS',
        target_username: username,
        details: { new_status: status },
        ip_address: req.ip
      });
      
      res.json({
        status: 'success',
        message: `账号${status === 1 ? '启用' : '禁用'}成功`
      });
    } else {
      res.status(404).json({
        status: 'error',
        message: '账号不存在'
      });
    }
  } catch (error) {
    console.error('更新账号状态失败:', error);
    res.status(500).json({
      status: 'error',
      message: '更新账号状态失败',
      error: error.message
    });
  }
});

// 获取登录历史
app.get('/api/login-history', async (req, res) => {
  try {
    const { username, limit = 50, offset = 0 } = req.query;
    
    const history = await db.getLoginHistory(
      username, 
      parseInt(limit), 
      parseInt(offset)
    );
    
    res.json({
      status: 'success',
      data: history,
      total: history.length
    });
  } catch (error) {
    console.error('获取登录历史失败:', error);
    res.status(500).json({
      status: 'error',
      message: '获取登录历史失败',
      error: error.message
    });
  }
});

// 获取操作日志
app.get('/api/operation-logs', async (req, res) => {
  try {
    const { operator, limit = 50, offset = 0 } = req.query;
    
    const logs = await db.getOperationLogs(
      operator, 
      parseInt(limit), 
      parseInt(offset)
    );
    
    res.json({
      status: 'success',
      data: logs,
      total: logs.length
    });
  } catch (error) {
    console.error('获取操作日志失败:', error);
    res.status(500).json({
      status: 'error',
      message: '获取操作日志失败',
      error: error.message
    });
  }
});

// 记录登录事件（供主应用调用）
app.post('/api/login-event', async (req, res) => {
  try {
    const { username, ip_address, user_agent, status, error_message } = req.body;
    
    if (!username) {
      return res.status(400).json({
        status: 'error',
        message: '用户名不能为空'
      });
    }
    
    await db.logLogin({
      username,
      ip_address: ip_address || req.ip,
      user_agent: user_agent || req.get('User-Agent'),
      status: status || 1,
      error_message
    });
    
    res.json({
      status: 'success',
      message: '登录事件记录成功'
    });
    
  } catch (error) {
    console.error('记录登录事件失败:', error);
    res.status(500).json({
      status: 'error',
      message: '记录登录事件失败',
      error: error.message
    });
  }
});

// 统计信息
app.get('/api/statistics', async (req, res) => {
  try {
    const accounts = await db.getAllAccounts();
    
    const stats = {
      total_accounts: accounts.length,
      active_accounts: accounts.filter(acc => acc.status === 1).length,
      disabled_accounts: accounts.filter(acc => acc.status === 0).length,
      permission_breakdown: {
        level_1: accounts.filter(acc => acc.permission_level === 1).length,
        level_2: accounts.filter(acc => acc.permission_level === 2).length,
        level_3: accounts.filter(acc => acc.permission_level === 3).length
      },
      recent_created: accounts.filter(acc => {
        const created = new Date(acc.created_at);
        const week_ago = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return created > week_ago;
      }).length
    };
    
    res.json({
      status: 'success',
      data: stats
    });
    
  } catch (error) {
    console.error('获取统计信息失败:', error);
    res.status(500).json({
      status: 'error',
      message: '获取统计信息失败',
      error: error.message
    });
  }
});

// 批量操作
app.post('/api/accounts/batch', async (req, res) => {
  try {
    const { action, usernames } = req.body;
    
    if (!action || !usernames || !Array.isArray(usernames)) {
      return res.status(400).json({
        status: 'error',
        message: '操作类型和用户名列表不能为空'
      });
    }
    
    const results = [];
    
    for (const username of usernames) {
      try {
        let result;
        
        switch (action) {
          case 'delete':
            result = await db.deleteAccount(username);
            break;
          case 'disable':
            result = await db.updateAccountStatus(username, 0);
            break;
          case 'enable':
            result = await db.updateAccountStatus(username, 1);
            break;
          default:
            throw new Error('不支持的操作类型');
        }
        
        results.push({
          username,
          status: 'success',
          result
        });
        
      } catch (error) {
        results.push({
          username,
          status: 'error',
          error: error.message
        });
      }
    }
    
    // 记录批量操作日志
    await db.logOperation({
      operator: 'api',
      operation: `BATCH_${action.toUpperCase()}`,
      target_username: usernames.join(', '),
      details: { action, usernames, results },
      ip_address: req.ip
    });
    
    res.json({
      status: 'success',
      message: '批量操作完成',
      data: results
    });
    
  } catch (error) {
    console.error('批量操作失败:', error);
    res.status(500).json({
      status: 'error',
      message: '批量操作失败',
      error: error.message
    });
  }
});

// 数据导出
app.get('/api/export/accounts', async (req, res) => {
  try {
    const accounts = await db.getAllAccounts();
    
    // 设置CSV头
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="accounts.csv"');
    
    // CSV头行
    let csv = '\ufeff用户名,显示名,邮箱,权限级别,状态,创建时间,最后登录,登录次数,备注\n';
    
    // 数据行
    accounts.forEach(account => {
      const row = [
        account.username,
        account.display_name || '',
        account.email || '',
        account.permission_name,
        account.status === 1 ? '激活' : '禁用',
        account.created_at,
        account.last_login_at || '从未登录',
        account.login_count,
        account.note || ''
      ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
      csv += row + '\n';
    });
    
    res.send(csv);
  } catch (error) {
    console.error('导出失败:', error);
    res.status(500).json({
      status: 'error',
      message: '导出失败',
      error: error.message
    });
  }
});

app.get('/api/export/login-history', async (req, res) => {
  try {
    const history = await db.getLoginHistory(null, 1000, 0);
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="login_history.csv"');
    
    let csv = '\ufeff用户名,显示名,登录时间,IP地址,浏览器,状态,错误信息\n';
    
    history.forEach(record => {
      const row = [
        record.username,
        record.display_name || '',
        record.login_time,
        record.ip_address || '',
        record.user_agent || '',
        record.status === 1 ? '成功' : '失败',
        record.error_message || ''
      ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
      csv += row + '\n';
    });
    
    res.send(csv);
  } catch (error) {
    console.error('导出失败:', error);
    res.status(500).json({
      status: 'error',
      message: '导出失败',
      error: error.message
    });
  }
});

// ===================== Web界面路由 =====================

// 为Web界面提供HTML文件
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../web/index.html'));
});

// 捕获所有其他路由，返回Web界面（SPA支持）
app.get('*', (req, res) => {
  // 如果是API请求，返回404
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      status: 'error',
      message: '接口不存在'
    });
  }
  
  // 否则返回Web界面
  res.sendFile(path.join(__dirname, '../web/index.html'));
});

// 错误处理中间件
app.use((error, req, res, next) => {
  console.error('服务器错误:', error);
  res.status(500).json({
    status: 'error',
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? error.message : '服务器错误'
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`\n🚀 账号管理服务已启动`);
  console.log(`📡 API服务地址: http://localhost:${PORT}/api`);
  console.log(`🌐 Web管理界面: http://localhost:${PORT}`);
  console.log(`📊 健康检查: http://localhost:${PORT}/api/health`);
  console.log(`🔧 环境: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⏰ 启动时间: ${new Date().toLocaleString()}\n`);
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('🛑 收到SIGTERM信号，正在关闭服务器...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n🛑 收到SIGINT信号，正在关闭服务器...');
  process.exit(0);
});