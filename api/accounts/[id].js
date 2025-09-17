// Vercel Serverless Function - 按ID操作单个账号

// 从数据库加载数据的简单实现
function loadAccounts() {
  // 默认数据
  return [
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
}

// 模拟数据存储
let accounts = loadAccounts();

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
  const accountId = parseInt(query.id);

  if (!accountId || isNaN(accountId)) {
    return res.status(400).json({
      status: 'error',
      message: '无效的账号ID'
    });
  }

  try {
    const accountIndex = accounts.findIndex(acc => acc.id === accountId);
    const account = accounts[accountIndex];

    switch (method) {
      case 'GET':
        // 获取指定账号信息
        if (!account) {
          return res.status(404).json({
            status: 'error',
            message: '账号不存在'
          });
        }

        return res.status(200).json({
          status: 'success',
          data: account
        });

      case 'PUT':
        // 更新账号信息
        if (!account) {
          return res.status(404).json({
            status: 'error',
            message: '账号不存在'
          });
        }

        const { display_name, email, permission_level, status, note } = req.body;

        // 更新账号信息
        accounts[accountIndex] = {
          ...account,
          display_name: display_name !== undefined ? display_name : account.display_name,
          email: email !== undefined ? email : account.email,
          permission_level: permission_level !== undefined ? permission_level : account.permission_level,
          status: status !== undefined ? status : account.status,
          note: note !== undefined ? note : account.note,
          permission_name: permission_level !== undefined ? getPermissionName(permission_level) : account.permission_name,
          updated_at: new Date().toISOString()
        };

        return res.status(200).json({
          status: 'success',
          message: '账号更新成功',
          data: accounts[accountIndex]
        });

      case 'DELETE':
        // 删除账号
        console.log(`删除请求: ID ${accountId}, 账号索引: ${accountIndex}`);

        if (accountIndex === -1) {
          console.log(`账号ID ${accountId} 不存在，当前账号列表:`, accounts.map(a => ({ id: a.id, username: a.username })));
          return res.status(404).json({
            status: 'error',
            message: '账号不存在'
          });
        }

        const deletedAccount = accounts[accountIndex];
        accounts.splice(accountIndex, 1);

        console.log(`成功删除账号: ${deletedAccount.username} (ID: ${deletedAccount.id})`);
        console.log(`删除后剩余账号数量: ${accounts.length}`);

        return res.status(200).json({
          status: 'success',
          message: '账号删除成功',
          data: {
            deleted_account: {
              id: deletedAccount.id,
              username: deletedAccount.username
            },
            remaining_count: accounts.length
          }
        });

      default:
        return res.status(405).json({
          status: 'error',
          message: '方法不被允许'
        });
    }
  } catch (error) {
    console.error('Account API Error:', error);
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