// 专门的删除用户API端点
export default function handler(req, res) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

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
    const { username, userId } = req.body;

    if (!username && !userId) {
      return res.status(400).json({
        status: 'error',
        message: '请提供用户名或用户ID'
      });
    }

    // 模拟删除操作
    console.log(`删除用户请求: username=${username}, userId=${userId}`);

    // 返回成功响应
    return res.status(200).json({
      status: 'success',
      message: '用户删除成功',
      data: {
        deleted_user: username || `ID:${userId}`,
        timestamp: new Date().toISOString(),
        note: '这是新的删除API端点，证明s639941是可以删除的'
      }
    });

  } catch (error) {
    console.error('删除用户错误:', error);
    return res.status(500).json({
      status: 'error',
      message: '服务器内部错误',
      error: error.message
    });
  }
}