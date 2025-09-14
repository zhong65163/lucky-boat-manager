# 🎯 Lucky Boat Monitor - 高级账号管理系统

完整的账号管理解决方案，整合了**数据库存储**、**RESTful API**和**Web管理界面**三大核心功能。

## 🌟 系统特性

### 📊 数据库存储 (方案三)
- ✅ SQLite 数据库，支持复杂查询和事务
- ✅ 完整的账号信息存储（用户名、显示名、邮箱、权限级别等）
- ✅ 权限级别管理（基础、高级、管理员）
- ✅ 账号过期时间控制
- ✅ 登录历史和操作日志记录
- ✅ 统计信息和数据分析

### 🚀 RESTful API (方案四)
- ✅ 完整的 RESTful API 接口
- ✅ 账号CRUD操作（创建、读取、更新、删除）
- ✅ 批量操作支持
- ✅ 实时授权检查
- ✅ 登录事件记录
- ✅ 统计信息API
- ✅ 健康检查和监控

### 🎨 Web管理界面 (方案二)
- ✅ 现代化响应式设计
- ✅ 实时数据展示和统计
- ✅ 可视化账号管理
- ✅ 搜索和过滤功能
- ✅ 批量操作支持
- ✅ 数据导出功能

## 🏗️ 系统架构

```
Lucky Boat Monitor
├── account-manager/           # 账号管理系统
│   ├── database/             # 数据库层
│   │   ├── schema.sql        # 数据库结构
│   │   ├── init.js          # 初始化脚本
│   │   └── accounts.db      # SQLite数据库文件
│   ├── server/               # API服务层
│   │   ├── server.js        # Express服务器
│   │   └── package.json     # 服务器依赖
│   ├── web/                  # Web界面层
│   │   ├── index.html       # 管理界面
│   │   └── app.js          # 前端脚本
│   ├── start-manager.js      # 启动脚本
│   └── README.md            # 说明文档
└── src/
    ├── services/
    │   ├── authApi.ts           # 认证服务（已集成）
    │   └── accountManagerApi.ts # 账号管理API客户端
    └── config/
        └── authorizedAccounts.ts # 本地配置（兼容性）
```

## 🚀 快速开始

### 方法一：使用启动脚本（推荐）

```bash
# 进入管理系统目录
cd account-manager

# 启动管理系统
node start-manager.js
```

启动脚本会自动：
- 检查系统依赖
- 安装必要的npm包
- 初始化数据库
- 启动API服务器
- 显示访问地址

### 方法二：手动启动

```bash
# 1. 安装数据库依赖
cd account-manager/database
npm install

# 2. 初始化数据库
node init.js

# 3. 安装服务器依赖
cd ../server
npm install

# 4. 启动服务器
npm start
```

## 🌐 服务地址

启动成功后，可以通过以下地址访问：

- **Web管理界面**: http://localhost:3001
- **API文档**: http://localhost:3001/api/health
- **健康检查**: http://localhost:3001/api/health

## 📋 API接口说明

### 账号管理
- `GET /api/accounts` - 获取所有账号
- `POST /api/accounts` - 添加新账号
- `DELETE /api/accounts/:username` - 删除账号
- `PATCH /api/accounts/:username/status` - 更新账号状态

### 授权检查
- `GET /api/accounts/:username/check` - 检查账号授权状态

### 日志记录
- `POST /api/login-event` - 记录登录事件
- `GET /api/login-history` - 获取登录历史
- `GET /api/operation-logs` - 获取操作日志

### 统计信息
- `GET /api/statistics` - 获取系统统计信息

### 批量操作
- `POST /api/accounts/batch` - 批量操作账号

## 🎯 权限级别说明

| 级别 | 名称 | 描述 | 功能权限 |
|------|------|------|----------|
| 1 | 基础用户 | 基本功能权限 | 登录、查看数据、基础投注 |
| 2 | 高级用户 | 高级功能权限 | 基础功能 + 高级投注、统计分析 |
| 3 | 管理员 | 完整管理权限 | 所有功能 + 用户管理、系统配置 |

## 💼 Web界面功能

### 📊 统计面板
- 总账号数量
- 活跃账号统计
- 禁用账号统计
- 本周新增账号

### 👥 账号管理
- 添加新账号
- 编辑账号信息
- 启用/禁用账号
- 删除账号
- 批量操作

### 🔍 搜索和过滤
- 实时搜索账号
- 按状态过滤
- 按权限级别过滤

### 📤 数据导出
- CSV格式导出
- 包含完整账号信息

## 🔧 集成说明

### 主应用集成

系统已自动集成到主应用的认证流程中：

1. **认证检查**: 登录时优先从数据库检查账号授权
2. **回退机制**: 如果数据库不可用，回退到本地配置文件
3. **事件记录**: 自动记录登录成功/失败事件
4. **权限验证**: 支持过期时间和权限级别检查

### 使用示例

```typescript
// 检查账号授权
const authCheck = await accountManagerApi.checkAccountAuthorization('a68668');
if (authCheck.authorized) {
    console.log('账号已授权', authCheck.account);
}

// 记录登录事件
await accountManagerApi.logLoginEvent({
    username: 'a68668',
    status: 1, // 1: 成功, 0: 失败
    error_message: undefined
});

// 获取统计信息
const stats = await accountManagerApi.getStatistics();
console.log('总账号数:', stats.total_accounts);
```

## 📝 数据库结构

### authorized_accounts (授权账号表)
- `id` - 主键
- `username` - 用户名（唯一）
- `display_name` - 显示名
- `email` - 邮箱
- `permission_level` - 权限级别
- `status` - 状态（1:激活, 0:禁用）
- `expires_at` - 过期时间
- `created_at` - 创建时间
- `updated_at` - 更新时间
- `last_login_at` - 最后登录时间
- `login_count` - 登录次数
- `note` - 备注

### login_history (登录历史表)
- `id` - 主键
- `username` - 用户名
- `login_time` - 登录时间
- `ip_address` - IP地址
- `user_agent` - 浏览器信息
- `status` - 登录状态
- `error_message` - 错误消息

### operation_logs (操作日志表)
- `id` - 主键
- `operator` - 操作者
- `operation` - 操作类型
- `target_username` - 目标用户名
- `details` - 操作详情
- `timestamp` - 操作时间
- `ip_address` - IP地址

## 🛠️ 故障排除

### 常见问题

1. **数据库初始化失败**
   ```bash
   cd account-manager/database
   npm install sqlite3
   node init.js
   ```

2. **API服务无法访问**
   - 检查端口3001是否被占用
   - 确认服务器已正常启动
   - 查看控制台错误日志

3. **Web界面无法加载**
   - 确认API服务正常运行
   - 检查浏览器控制台错误
   - 尝试刷新页面

4. **主应用无法连接账号管理服务**
   - 确认账号管理服务在端口3001运行
   - 检查CORS配置
   - 查看网络连接

### 日志查看

```bash
# 查看服务器日志
cd account-manager/server
npm start

# 检查数据库状态
cd account-manager/database
node init.js
```

## 🔒 安全说明

- 数据库文件存储在本地，确保适当的文件权限
- API接口包含速率限制保护
- 所有操作都有日志记录
- 支持账号过期时间控制
- 提供批量操作的确认机制

## 📈 性能优化

- SQLite数据库索引优化
- API响应缓存机制
- 前端数据懒加载
- 批量操作事务处理

## 🔄 版本升级

系统支持平滑升级：
1. 数据库结构向后兼容
2. API接口版本控制
3. 配置文件迁移支持
4. 数据备份和恢复

## 📞 技术支持

如需技术支持，请检查：
1. 系统日志输出
2. 数据库文件完整性
3. 网络连接状态
4. 依赖版本兼容性

---

**🎉 享受全新的高级账号管理体验！**