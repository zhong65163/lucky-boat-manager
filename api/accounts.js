// Vercel Serverless Function - 账号管理

// 全局状态管理（在单个实例内保持一致）
if (!global.accountsData) {
  global.accountsData = {
    accounts: [
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
    ],
    lastModified: new Date().toISOString(),
    instanceId: Math.random().toString(36).substring(7)
  };
  console.log(`🚀 初始化账号数据，实例ID: ${global.accountsData.instanceId}`);
}

// 获取当前账号数据的引用
function getAccounts() {
  return global.accountsData.accounts;
}

// 更新账号数据
function updateAccounts(newAccounts, operation = 'unknown') {
  global.accountsData.accounts = newAccounts;
  global.accountsData.lastModified = new Date().toISOString();
  console.log(`📝 更新账号数据 (${operation})，实例ID: ${global.accountsData.instanceId}，账号数量: ${newAccounts.length}`);
}

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method, query } = req;

  try {
    switch (method) {
      case 'GET':
        // 获取所有账号
        const currentAccounts = getAccounts();
        return res.status(200).json({
          status: 'success',
          data: currentAccounts,
          total: currentAccounts.length,
          instance: global.accountsData.instanceId,
          lastModified: global.accountsData.lastModified
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

        // 检查用户名是否已存在
        const accountsForCheck = getAccounts();
        const exists = accountsForCheck.find(acc => acc.username.toLowerCase() === username.toLowerCase());
        if (exists) {
          return res.status(409).json({
            status: 'error',
            message: '账号已存在'
          });
        }

        // 创建新账号
        const newAccount = {
          id: Math.max(...accountsForCheck.map(a => a.id), 0) + 1,
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

        const updatedAccounts = [...accountsForCheck, newAccount];
        updateAccounts(updatedAccounts, 'ADD');

        return res.status(201).json({
          status: 'success',
          message: '账号添加成功',
          data: { id: newAccount.id, username: newAccount.username }
        });

      case 'DELETE':
        // 删除账号 - 支持通过查询参数传递ID
        const accountId = parseInt(query.id);

        if (!accountId || isNaN(accountId)) {
          return res.status(400).json({
            status: 'error',
            message: '请提供有效的账号ID'
          });
        }

        const accountsForDelete = getAccounts();
        const accountIndex = accountsForDelete.findIndex(acc => acc.id === accountId);

        if (accountIndex === -1) {
          console.log(`删除失败: 账号ID ${accountId} 不存在`);
          console.log('当前账号列表:', accountsForDelete.map(a => ({ id: a.id, username: a.username })));
          console.log(`实例ID: ${global.accountsData.instanceId}`);
          return res.status(404).json({
            status: 'error',
            message: '账号不存在'
          });
        }

        const deletedAccount = accountsForDelete[accountIndex];
        const remainingAccounts = accountsForDelete.filter((_, index) => index !== accountIndex);
        updateAccounts(remainingAccounts, 'DELETE');

        console.log(`成功删除账号: ${deletedAccount.username} (ID: ${deletedAccount.id})`);

        return res.status(200).json({
          status: 'success',
          message: '账号删除成功',
          data: {
            deleted_account: {
              id: deletedAccount.id,
              username: deletedAccount.username
            },
            remaining_count: remainingAccounts.length
          }
        });

      default:
        return res.status(405).json({
          status: 'error',
          message: '方法不被允许'
        });
    }
  } catch (error) {
    console.error('Accounts API Error:', error);
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