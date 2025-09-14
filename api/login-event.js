// Vercel Serverless Function - 登录事件记录

// 内存存储登录历史（Vercel重启时会丢失）
let loginHistory = [];

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

  if (req.method !== 'POST') {
    return res.status(405).json({
      status: 'error',
      message: '只支持POST方法'
    });
  }

  try {
    const { username, ip_address, user_agent, status, error_message } = req.body;

    if (!username) {
      return res.status(400).json({
        status: 'error',
        message: '用户名不能为空'
      });
    }

    // 记录登录事件
    const loginEvent = {
      id: loginHistory.length + 1,
      username,
      login_time: new Date().toISOString(),
      ip_address: ip_address || req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown',
      user_agent: user_agent || req.headers['user-agent'] || 'unknown',
      status: status !== undefined ? status : 1,
      error_message: error_message || null
    };

    loginHistory.push(loginEvent);

    // 只保留最近100条记录（内存限制）
    if (loginHistory.length > 100) {
      loginHistory = loginHistory.slice(-100);
    }

    console.log(`📝 登录事件记录: ${username} - ${status === 1 ? '成功' : '失败'}`);

    return res.status(200).json({
      status: 'success',
      message: '登录事件记录成功',
      data: {
        id: loginEvent.id,
        username: loginEvent.username,
        login_time: loginEvent.login_time
      }
    });

  } catch (error) {
    console.error('Login Event API Error:', error);
    return res.status(500).json({
      status: 'error',
      message: '记录登录事件失败',
      error: error.message
    });
  }
}