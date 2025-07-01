import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Solo permitir GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed. Only GET requests are supported.'
    });
  }

  // Respuesta de health check
  return res.status(200).json({
    success: true,
    message: 'Backend Paquetería DD funcionando correctamente en Vercel',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: 'production',
    node_version: process.version
  });
}
