import { Router, Request, Response } from 'express';
import { searchItems, getItemWithHistory } from '../services/itemService';
import { getNotesForItem, addNoteForItem } from '../services/notesService';
import { checkoutItem, checkinItem, getCheckoutStatus, getCheckoutHistory } from '../services/checkoutService';

const router = Router();

/**
 * GET /api/items
 * Search and filter items
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      q,
      title,
      author,
      barcode,
      location,
      status,
      itemType,
      fromDate,
      toDate,
      page,
      pageSize,
    } = req.query;

    const result = searchItems({
      q: q as string,
      title: title as string,
      author: author as string,
      barcode: barcode as string,
      location: location as string,
      status: status as string,
      itemType: itemType as string,
      fromDate: fromDate as string,
      toDate: toDate as string,
      page: page ? parseInt(page as string, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize as string, 10) : undefined,
    });

    res.json(result);
  } catch (error) {
    console.error('Error searching items:', error);
    res.status(500).json({ error: 'Failed to search items' });
  }
});

/**
 * GET /api/items/:id
 * Get item details with transaction history
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const item = getItemWithHistory(id);

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Include checkout status
    const checkoutStatus = getCheckoutStatus(id);
    const checkoutHistory = getCheckoutHistory(id);

    res.json({
      ...item,
      checkoutStatus,
      checkoutHistory,
    });
  } catch (error) {
    console.error('Error getting item:', error);
    res.status(500).json({ error: 'Failed to get item' });
  }
});

/**
 * GET /api/items/:id/notes
 * Get notes for an item
 */
router.get('/:id/notes', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const notes = getNotesForItem(id);
    res.json(notes);
  } catch (error) {
    console.error('Error getting notes:', error);
    res.status(500).json({ error: 'Failed to get notes' });
  }
});

/**
 * POST /api/items/:id/notes
 * Add a note for an item
 */
router.post('/:id/notes', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { text, createdBy } = req.body;

    if (!text || !createdBy) {
      return res.status(400).json({ error: 'text and createdBy are required' });
    }

    const note = addNoteForItem(id, text, createdBy);
    res.status(201).json(note);
  } catch (error) {
    console.error('Error adding note:', error);
    res.status(500).json({ error: 'Failed to add note' });
  }
});

/**
 * GET /api/items/:id/checkout
 * Get checkout status for an item
 */
router.get('/:id/checkout', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const status = getCheckoutStatus(id);
    const history = getCheckoutHistory(id);
    res.json({ ...status, history });
  } catch (error) {
    console.error('Error getting checkout status:', error);
    res.status(500).json({ error: 'Failed to get checkout status' });
  }
});

/**
 * POST /api/items/:id/checkout
 * Check out an item
 */
router.post('/:id/checkout', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { performedBy, staffMember, note, dueDate } = req.body;

    if (!performedBy) {
      return res.status(400).json({ error: 'performedBy is required' });
    }
    if (!staffMember) {
      return res.status(400).json({ error: 'staffMember is required' });
    }

    const record = checkoutItem(id, performedBy, staffMember, note || '', dueDate);
    res.status(201).json(record);
  } catch (error: any) {
    console.error('Error checking out item:', error);
    if (error.message === 'Item is already checked out') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to check out item' });
  }
});

/**
 * POST /api/items/:id/checkin
 * Check in an item
 */
router.post('/:id/checkin', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { performedBy, staffMember, note } = req.body;

    if (!performedBy) {
      return res.status(400).json({ error: 'performedBy is required' });
    }
    if (!staffMember) {
      return res.status(400).json({ error: 'staffMember is required' });
    }

    const record = checkinItem(id, performedBy, staffMember, note || '');
    res.status(201).json(record);
  } catch (error: any) {
    console.error('Error checking in item:', error);
    if (error.message === 'Item is not currently checked out') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to check in item' });
  }
});

export default router;

