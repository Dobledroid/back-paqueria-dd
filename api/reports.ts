import { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../src/index';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    return app(req, res);
  } catch (error) {
    console.error('Reports API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
