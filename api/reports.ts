import { VercelRequest, VercelResponse } from '@vercel/node';
import { createApp } from '../src/app';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const app = await createApp();
    return app(req, res);
  } catch (error) {
    console.error('Reports API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
