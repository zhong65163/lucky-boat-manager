// Vercel Serverless Function - 检查账号授权

// 内存数据存储
const accounts = [
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

  if (req.method !== 'GET') {
    return res.status(405).json({
      status: 'error',
      message: '只支持GET方法'
    });
  }

  const { query } = req;
  const username = query.username;

  if (!username) {
    return res.status(400).json({
      status: 'error',
      message: '用户名参数缺失'
    });
  }

  try {
    // 查找账号
    const account = accounts.find(acc =>
      acc.username.toLowerCase() === username.toLowerCase()
    );

    if (account) {
      // 检查账号状态和过期时间
      const isActive = account.status === 1;
      const isNotExpired = !account.expires_at || new Date(account.expires_at) > new Date();
      const authorized = isActive && isNotExpired;

      return res.status(200).json({
        status: 'success',
        authorized,
        data: account
      });
    } else {
      return res.status(200).json({
        status: 'success',
        authorized: false,
        message: '账号未授权或已过期'
      });
    }
  } catch (error) {
    console.error('Check Authorization Error:', error);
    return res.status(500).json({
      status: 'error',
      message: '检查授权状态失败',
      error: error.message
    });
  }
}