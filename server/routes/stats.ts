import { Router, Request, Response } from 'express';
import { getStats } from '../services/statsService';

const router = Router();

/**
 * GET /api/stats
 * Get analytics statistics
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const stats = getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

export default router;

