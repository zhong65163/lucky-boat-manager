// Vercel Serverless Function - 使用KV存储的账号管理
import { kv } from '@vercel/kv';

// KV存储的键名
const ACCOUNTS_KEY = 'accounts_list';
const ACCOUNTS_COUNTER_KEY = 'accounts_counter';

// 默认账号数据
const DEFAULT_ACCOUNTS = [
  {
    id: 1,
    username: 'a68668',
    display_name: '授权用户1',
    email: 'a68668@example.com',
    permission_level: 3,
    status: 1,
    expires_at: null,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    created_by: 'system',
    note: '主要授权账号',
    last_login_at: null,
    login_count: 0,
    permission_name: '管理员'
  },
  {
    id: 2,
    username: 'qingshui888',
    display_name: '授权用户2',
    email: 'qingshui888@example.com',
    permission_level: 2,
    status: 1,
    expires_at: null,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    created_by: 'system',
    note: '新添加的授权账号',
    last_login_at: null,
    login_count: 0,
    permission_name: '高级用户'
  },
  {
    id: 3,
    username: 'shouqi333',
    display_name: '管理员用户',
    email: 'shouqi333@example.com',
    permission_level: 3,
    status: 1,
    expires_at: null,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    created_by: 'system',
    note: '管理员授权账号',
    last_login_at: null,
    login_count: 0,
    permission_name: '管理员'
  },
  {
    id: 4,
    username: 's639941',
    display_name: '授权用户s639941',
    email: 's639941@example.com',
    permission_level: 1,
    status: 1,
    expires_at: null,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    created_by: 'system',
    note: '新添加的授权账号',
    last_login_at: null,
    login_count: 0,
    permission_name: '基础用户'
  }
];

// 初始化KV存储
async function initializeKV() {
  try {
    const accounts = await kv.get(ACCOUNTS_KEY);
    if (!accounts) {
      console.log('初始化KV存储...');
      await kv.set(ACCOUNTS_KEY, DEFAULT_ACCOUNTS);
      await kv.set(ACCOUNTS_COUNTER_KEY, 4);
      return DEFAULT_ACCOUNTS;
    }
    return accounts;
  } catch (error) {
    console.error('KV初始化失败，使用内存存储:', error.message);
    return DEFAULT_ACCOUNTS;
  }
}

// 获取所有账号
async function getAccounts() {
  try {
    const accounts = await kv.get(ACCOUNTS_KEY);
    return accounts || [];
  } catch (error) {
    console.error('获取账号失败:', error.message);
    return DEFAULT_ACCOUNTS;
  }
}

// 保存账号列表
async function saveAccounts(accounts) {
  try {
    await kv.set(ACCOUNTS_KEY, accounts);
    console.log(`保存了 ${accounts.length} 个账号到KV存储`);
    return true;
  } catch (error) {
    console.error('保存账号失败:', error.message);
    return false;
  }
}

// 获取下一个ID
async function getNextId() {
  try {
    const counter = await kv.get(ACCOUNTS_COUNTER_KEY) || 4;
    const nextId = counter + 1;
    await kv.set(ACCOUNTS_COUNTER_KEY, nextId);
    return nextId;
  } catch (error) {
    console.error('获取下一个ID失败:', error.message);
    return Date.now(); // 使用时间戳作为后备方案
  }
}

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method, query } = req;

  try {
    // 确保KV存储已初始化
    await initializeKV();

    switch (method) {
      case 'GET':
        // 获取所有账号
        const accounts = await getAccounts();
        return res.status(200).json({
          status: 'success',
          data: accounts,
          total: accounts.length,
          storage: 'kv'
        });

      case 'POST':
        // 添加账号
        const { username, display_name, email, permission_level, note } = req.body;

        if (!username) {
          return res.status(400).json({
            status: 'error',
            message: '用户名不能为空'
          });
        }

        const currentAccounts = await getAccounts();

        // 检查用户名是否已存在
        const exists = currentAccounts.find(acc => acc.username.toLowerCase() === username.toLowerCase());
        if (exists) {
          return res.status(409).json({
            status: 'error',
            message: '账号已存在'
          });
        }

        // 创建新账号
        const newId = await getNextId();
        const newAccount = {
          id: newId,
          username,
          display_name: display_name || `用户${username}`,
          email: email || `${username}@example.com`,
          permission_level: permission_level || 1,
          status: 1,
          expires_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: 'api',
          note: note || '通过API添加',
          last_login_at: null,
          login_count: 0,
          permission_name: getPermissionName(permission_level || 1)
        };

        currentAccounts.push(newAccount);
        const saveSuccess = await saveAccounts(currentAccounts);

        if (saveSuccess) {
          return res.status(201).json({
            status: 'success',
            message: '账号添加成功',
            data: { id: newAccount.id, username: newAccount.username }
          });
        } else {
          return res.status(500).json({
            status: 'error',
            message: '保存账号失败'
          });
        }

      case 'DELETE':
        // 删除账号
        const accountId = parseInt(query.id);

        if (!accountId || isNaN(accountId)) {
          return res.status(400).json({
            status: 'error',
            message: '请提供有效的账号ID'
          });
        }

        const accountsToUpdate = await getAccounts();
        const accountIndex = accountsToUpdate.findIndex(acc => acc.id === accountId);

        if (accountIndex === -1) {
          console.log(`删除失败: 账号ID ${accountId} 不存在`);
          console.log('当前KV中的账号:', accountsToUpdate.map(a => ({ id: a.id, username: a.username })));
          return res.status(404).json({
            status: 'error',
            message: '账号不存在'
          });
        }

        const deletedAccount = accountsToUpdate[accountIndex];
        accountsToUpdate.splice(accountIndex, 1);

        const deleteSuccess = await saveAccounts(accountsToUpdate);

        if (deleteSuccess) {
          console.log(`成功从KV删除账号: ${deletedAccount.username} (ID: ${deletedAccount.id})`);
          return res.status(200).json({
            status: 'success',
            message: '账号删除成功',
            data: {
              deleted_account: {
                id: deletedAccount.id,
                username: deletedAccount.username
              },
              remaining_count: accountsToUpdate.length
            }
          });
        } else {
          return res.status(500).json({
            status: 'error',
            message: '删除账号失败'
          });
        }

      default:
        return res.status(405).json({
          status: 'error',
          message: '方法不被允许'
        });
    }
  } catch (error) {
    console.error('Accounts KV API Error:', error);
    return res.status(500).json({
      status: 'error',
      message: '服务器内部错误',
      error: error.message
    });
  }
}

function getPermissionName(level) {
  const names = {
    1: '基础用户',
    2: '高级用户',
    3: '管理员'
  };
  return names[level] || `级别${level}`;
}