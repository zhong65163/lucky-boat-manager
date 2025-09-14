-- 授权账号管理系统数据库模式
-- SQLite 数据库结构

-- 授权账号表
CREATE TABLE IF NOT EXISTS authorized_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100),
    email VARCHAR(100),
    permission_level INTEGER DEFAULT 1,
    status INTEGER DEFAULT 1, -- 1: 激活, 0: 禁用
    expires_at DATETIME, -- 过期时间，NULL表示永不过期
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    note TEXT,
    last_login_at DATETIME,
    login_count INTEGER DEFAULT 0
);

-- 权限级别表
CREATE TABLE IF NOT EXISTS permission_levels (
    id INTEGER PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    features JSON -- 功能权限列表，JSON格式
);

-- 登录历史表
CREATE TABLE IF NOT EXISTS login_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) NOT NULL,
    login_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    status INTEGER, -- 1: 成功, 0: 失败
    error_message TEXT,
    session_duration INTEGER -- 会话持续时间（秒）
);

-- 操作日志表
CREATE TABLE IF NOT EXISTS operation_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    operator VARCHAR(50) NOT NULL,
    operation VARCHAR(50) NOT NULL, -- ADD, DELETE, UPDATE, etc.
    target_username VARCHAR(50),
    details JSON,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45)
);

-- 系统配置表
CREATE TABLE IF NOT EXISTS system_config (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT,
    description TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_authorized_accounts_username ON authorized_accounts(username);
CREATE INDEX IF NOT EXISTS idx_authorized_accounts_status ON authorized_accounts(status);
CREATE INDEX IF NOT EXISTS idx_authorized_accounts_expires_at ON authorized_accounts(expires_at);
CREATE INDEX IF NOT EXISTS idx_login_history_username ON login_history(username);
CREATE INDEX IF NOT EXISTS idx_login_history_time ON login_history(login_time);
CREATE INDEX IF NOT EXISTS idx_operation_logs_operator ON operation_logs(operator);
CREATE INDEX IF NOT EXISTS idx_operation_logs_timestamp ON operation_logs(timestamp);

-- 插入默认权限级别
INSERT OR IGNORE INTO permission_levels (id, name, description, features) VALUES 
(1, '基础用户', '基本功能权限', '["login", "view_data", "basic_betting"]'),
(2, '高级用户', '高级功能权限', '["login", "view_data", "basic_betting", "advanced_betting", "statistics"]'),
(3, '管理员', '完整管理权限', '["login", "view_data", "basic_betting", "advanced_betting", "statistics", "user_management", "system_config"]');

-- 插入默认授权账号
INSERT OR IGNORE INTO authorized_accounts (username, display_name, permission_level, note, created_by) VALUES 
('a68668', '主要授权账号', 2, '初始授权账号', 'system');

-- 插入系统配置
INSERT OR IGNORE INTO system_config (key, value, description) VALUES 
('max_users', '100', '最大用户数量'),
('default_permission_level', '1', '新用户默认权限级别'),
('session_timeout', '7200', '会话超时时间（秒）'),
('auto_cleanup_logs', 'true', '自动清理过期日志'),
('log_retention_days', '90', '日志保留天数');