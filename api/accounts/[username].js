// Vercel Serverless Function - 单个账号操作

// 内存数据存储（与accounts.js共享，但Vercel中可能不共享）
let accounts = [
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
  const username = query.username;

  if (!username) {
    return res.status(400).json({
      status: 'error',
      message: '用户名参数缺失'
    });
  }

  try {
    const account = accounts.find(acc => acc.username.toLowerCase() === username.toLowerCase());

    switch (method) {
      case 'GET':
        // 检查账号授权状态
        if (account && account.status === 1) {
          return res.status(200).json({
            status: 'success',
            authorized: true,
            data: account
          });
        } else {
          return res.status(200).json({
            status: 'success',
            authorized: false,
            message: '账号未授权或已过期'
          });
        }

      case 'DELETE':
        // 删除账号
        const index = accounts.findIndex(acc => acc.username.toLowerCase() === username.toLowerCase());

        if (index === -1) {
          return res.status(404).json({
            status: 'error',
            message: '账号不存在'
          });
        }

        accounts.splice(index, 1);

        return res.status(200).json({
          status: 'success',
          message: '账号删除成功'
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