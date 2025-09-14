#!/usr/bin/env node

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// 数据库配置
const DB_PATH = path.join(__dirname, 'accounts.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

// 颜色输出
const colors = {
  green: text => `\x1b[32m${text}\x1b[0m`,
  red: text => `\x1b[31m${text}\x1b[0m`,
  yellow: text => `\x1b[33m${text}\x1b[0m`,
  blue: text => `\x1b[34m${text}\x1b[0m`,
  cyan: text => `\x1b[36m${text}\x1b[0m`,
};

// 初始化数据库
async function initDatabase() {
  console.log(colors.blue('🗄️  初始化账号管理数据库...'));
  
  try {
    // 检查是否已存在数据库
    const dbExists = fs.existsSync(DB_PATH);
    if (dbExists) {
      console.log(colors.yellow('⚠️  数据库已存在，将进行更新...'));
    }
    
    // 读取SQL架构
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
    
    // 创建数据库连接
    const db = new sqlite3.Database(DB_PATH);
    
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        // 执行建表语句
        db.exec(schema, (err) => {
          if (err) {
            console.error(colors.red('❌ 创建数据库失败:'), err.message);
            reject(err);
            return;
          }
          
          console.log(colors.green('✅ 数据库表创建成功'));
          
          // 验证数据
          db.get("SELECT COUNT(*) as count FROM authorized_accounts", (err, row) => {
            if (err) {
              console.error(colors.red('❌ 验证数据失败:'), err.message);
              reject(err);
              return;
            }
            
            console.log(colors.green(`📊 当前授权账号数量: ${row.count}`));
            
            // 显示权限级别
            db.all("SELECT * FROM permission_levels", (err, rows) => {
              if (err) {
                console.error(colors.red('❌ 查询权限级别失败:'), err.message);
                reject(err);
                return;
              }
              
              console.log(colors.cyan('\n🔑 权限级别配置:'));
              rows.forEach(level => {
                console.log(`   ${level.id}. ${colors.yellow(level.name)} - ${level.description}`);
              });
              
              // 显示现有账号
              db.all("SELECT username, display_name, permission_level, status, expires_at FROM authorized_accounts", (err, accounts) => {
                if (err) {
                  console.error(colors.red('❌ 查询账号失败:'), err.message);
                  reject(err);
                  return;
                }
                
                if (accounts.length > 0) {
                  console.log(colors.cyan('\n👥 现有授权账号:'));
                  accounts.forEach((account, index) => {
                    const status = account.status === 1 ? colors.green('激活') : colors.red('禁用');
                    const expires = account.expires_at ? new Date(account.expires_at).toLocaleDateString() : '永不过期';
                    console.log(`   ${index + 1}. ${colors.yellow(account.username)} (${account.display_name}) - 权限:${account.permission_level} - ${status} - 到期:${expires}`);
                  });
                }
                
                db.close();
                console.log(colors.green('\n🎉 数据库初始化完成!'));
                console.log(colors.blue(`📁 数据库文件: ${DB_PATH}`));
                resolve();
              });
            });
          });
        });
      });
    });
    
  } catch (error) {
    console.error(colors.red('💥 初始化过程发生错误:'), error.message);
    throw error;
  }
}

// 数据库操作类
class AccountDatabase {
  constructor() {
    this.dbPath = DB_PATH;
  }
  
  // 获取数据库连接
  getConnection() {
    return new sqlite3.Database(this.dbPath);
  }
  
  // 查询所有授权账号
  async getAllAccounts() {
    return new Promise((resolve, reject) => {
      const db = this.getConnection();
      db.all(`
        SELECT a.*, p.name as permission_name 
        FROM authorized_accounts a 
        LEFT JOIN permission_levels p ON a.permission_level = p.id
        ORDER BY a.created_at DESC
      `, (err, rows) => {
        db.close();
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
  
  // 添加授权账号
  async addAccount(accountData) {
    return new Promise((resolve, reject) => {
      const db = this.getConnection();
      const { username, display_name, email, permission_level, expires_at, note, created_by } = accountData;
      
      db.run(`
        INSERT INTO authorized_accounts 
        (username, display_name, email, permission_level, expires_at, note, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [username, display_name, email, permission_level, expires_at, note, created_by], 
      function(err) {
        db.close();
        if (err) reject(err);
        else resolve({ id: this.lastID, username });
      });
    });
  }
  
  // 删除授权账号
  async deleteAccount(username) {
    return new Promise((resolve, reject) => {
      const db = this.getConnection();
      db.run("DELETE FROM authorized_accounts WHERE username = ?", [username], function(err) {
        db.close();
        if (err) reject(err);
        else resolve(this.changes > 0);
      });
    });
  }
  
  // 更新账号状态
  async updateAccountStatus(username, status) {
    return new Promise((resolve, reject) => {
      const db = this.getConnection();
      db.run(`
        UPDATE authorized_accounts 
        SET status = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE username = ?
      `, [status, username], function(err) {
        db.close();
        if (err) reject(err);
        else resolve(this.changes > 0);
      });
    });
  }
  
  // 检查账号授权
  async checkAuthorization(username) {
    return new Promise((resolve, reject) => {
      const db = this.getConnection();
      db.get(`
        SELECT * FROM authorized_accounts 
        WHERE username = ? AND status = 1 
        AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
      `, [username], (err, row) => {
        db.close();
        if (err) reject(err);
        else resolve(row);
      });
    });
  }
  
  // 记录登录历史
  async logLogin(loginData) {
    return new Promise((resolve, reject) => {
      const db = this.getConnection();
      const { username, ip_address, user_agent, status, error_message } = loginData;
      
      db.run(`
        INSERT INTO login_history 
        (username, ip_address, user_agent, status, error_message)
        VALUES (?, ?, ?, ?, ?)
      `, [username, ip_address, user_agent, status, error_message], 
      function(err) {
        if (!err && status === 1) {
          // 更新最后登录时间和登录次数
          db.run(`
            UPDATE authorized_accounts 
            SET last_login_at = CURRENT_TIMESTAMP, 
                login_count = login_count + 1 
            WHERE username = ?
          `, [username]);
        }
        db.close();
        if (err) reject(err);
        else resolve({ id: this.lastID });
      });
    });
  }
  
  // 记录操作日志
  async logOperation(operationData) {
    return new Promise((resolve, reject) => {
      const db = this.getConnection();
      const { operator, operation, target_username, details, ip_address } = operationData;
      
      db.run(`
        INSERT INTO operation_logs 
        (operator, operation, target_username, details, ip_address)
        VALUES (?, ?, ?, ?, ?)
      `, [operator, operation, target_username, JSON.stringify(details), ip_address], 
      function(err) {
        db.close();
        if (err) reject(err);
        else resolve({ id: this.lastID });
      });
    });
  }
  
  // 获取登录历史
  async getLoginHistory(username = null, limit = 50, offset = 0) {
    return new Promise((resolve, reject) => {
      const db = this.getConnection();
      let sql = `
        SELECT lh.*, aa.display_name 
        FROM login_history lh
        LEFT JOIN authorized_accounts aa ON lh.username = aa.username
      `;
      let params = [];
      
      if (username) {
        sql += ' WHERE lh.username = ?';
        params.push(username);
      }
      
      sql += ' ORDER BY lh.login_time DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);
      
      db.all(sql, params, (err, rows) => {
        db.close();
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
  
  // 获取操作日志
  async getOperationLogs(operator = null, limit = 50, offset = 0) {
    return new Promise((resolve, reject) => {
      const db = this.getConnection();
      let sql = 'SELECT * FROM operation_logs';
      let params = [];
      
      if (operator) {
        sql += ' WHERE operator = ?';
        params.push(operator);
      }
      
      sql += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);
      
      db.all(sql, params, (err, rows) => {
        db.close();
        if (err) reject(err);
        else resolve(rows.map(row => ({
          ...row,
          details: JSON.parse(row.details || '{}')
        })));
      });
    });
  }
}

// 如果直接运行此文件，则初始化数据库
if (require.main === module) {
  initDatabase().catch(error => {
    console.error(colors.red('💥 初始化失败:'), error.message);
    process.exit(1);
  });
}

module.exports = {
  initDatabase,
  AccountDatabase,
  DB_PATH
};