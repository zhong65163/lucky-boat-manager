// Vercel Serverless Function - Health Check

export default function handler(req, res) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 处理OPTIONS请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 健康检查响应
  res.status(200).json({
    status: 'success',
    message: '账号管理服务运行正常',
    timestamp: new Date().toISOString(),
    version: '1.0.0-vercel',
    environment: 'production'
  });
}