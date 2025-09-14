// Vercel Serverless Function - 统计信息

// 内存数据存储
const accounts = [
  {
    id: 1,
    username: 'a68668',
    display_name: '授权用户1',
    permission_level: 3,
    status: 1,
    created_at: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 2,
    username: 'qingshui888',
    display_name: '授权用户2',
    permission_level: 2,
    status: 1,
    created_at: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 3,
    username: 'shouqi333',
    display_name: '管理员用户',
    permission_level: 3,
    status: 1,
    created_at: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 4,
    username: 's639941',
    display_name: '授权用户s639941',
    permission_level: 1,
    status: 1,
    created_at: '2024-01-01T00:00:00.000Z'
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

  try {
    // 计算统计信息
    const totalAccounts = accounts.length;
    const activeAccounts = accounts.filter(acc => acc.status === 1).length;
    const disabledAccounts = accounts.filter(acc => acc.status === 0).length;

    // 权限级别分布
    const permissionBreakdown = {
      level_1: accounts.filter(acc => acc.permission_level === 1).length,
      level_2: accounts.filter(acc => acc.permission_level === 2).length,
      level_3: accounts.filter(acc => acc.permission_level === 3).length
    };

    // 最近7天创建的账号（示例数据）
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentCreated = accounts.filter(acc => {
      const created = new Date(acc.created_at);
      return created > weekAgo;
    }).length;

    const stats = {
      total_accounts: totalAccounts,
      active_accounts: activeAccounts,
      disabled_accounts: disabledAccounts,
      permission_breakdown: permissionBreakdown,
      recent_created: recentCreated,
      last_updated: new Date().toISOString()
    };

    return res.status(200).json({
      status: 'success',
      data: stats
    });

  } catch (error) {
    console.error('Statistics API Error:', error);
    return res.status(500).json({
      status: 'error',
      message: '获取统计信息失败',
      error: error.message
    });
  }
}