import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Simples respuestas de prueba para auth
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      message: 'Auth API endpoint is working',
      endpoint: '/api/auth',
      timestamp: new Date().toISOString()
    });
  }

  if (req.method === 'POST') {
    return res.status(200).json({
      success: true,
      message: 'Auth POST endpoint is working',
      body: req.body,
      timestamp: new Date().toISOString()
    });
  }

  return res.status(405).json({
    success: false,
    message: 'Method not allowed'
  });
}
