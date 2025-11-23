import { Router, Request, Response } from 'express';
import {
  getCheckedOutItems,
  getCheckoutHistoryReport,
  getReportingStats,
  ReportingFilters,
} from '../services/reportingService';

const router = Router();

/**
 * GET /api/reports/checked-out
 * Get all currently checked out items
 */
router.get('/checked-out', async (req: Request, res: Response) => {
  try {
    const items = getCheckedOutItems();
    res.json({ items, count: items.length });
  } catch (error) {
    console.error('Error getting checked out items:', error);
    res.status(500).json({ error: 'Failed to get checked out items' });
  }
});

/**
 * GET /api/reports/history
 * Get checkout history report
 */
router.get('/history', async (req: Request, res: Response) => {
  try {
    const {
      status,
      fromDate,
      toDate,
      performedBy,
      itemId,
    } = req.query;

    const filters: ReportingFilters = {
      status: status as 'checked-out' | 'checked-in' | 'all' | undefined,
      fromDate: fromDate as string | undefined,
      toDate: toDate as string | undefined,
      performedBy: performedBy as string | undefined,
      itemId: itemId as string | undefined,
    };

    const reports = getCheckoutHistoryReport(filters);
    res.json({ reports, count: reports.length });
  } catch (error) {
    console.error('Error getting checkout history:', error);
    res.status(500).json({ error: 'Failed to get checkout history' });
  }
});

/**
 * GET /api/reports/stats
 * Get reporting statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = getReportingStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting reporting stats:', error);
    res.status(500).json({ error: 'Failed to get reporting stats' });
  }
});

export default router;

