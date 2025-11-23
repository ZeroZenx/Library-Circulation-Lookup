import { Router, Request, Response } from 'express';
import { getNotesForItem, addNoteForItem } from '../services/notesService';

const router = Router();

/**
 * GET /api/notes/:itemId
 * Get notes for an item (alternative endpoint)
 */
router.get('/:itemId', async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const notes = getNotesForItem(itemId);
    res.json(notes);
  } catch (error) {
    console.error('Error getting notes:', error);
    res.status(500).json({ error: 'Failed to get notes' });
  }
});

/**
 * POST /api/notes/:itemId
 * Add a note for an item (alternative endpoint)
 */
router.post('/:itemId', async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const { text, createdBy } = req.body;

    if (!text || !createdBy) {
      return res.status(400).json({ error: 'text and createdBy are required' });
    }

    const note = addNoteForItem(itemId, text, createdBy);
    res.status(201).json(note);
  } catch (error) {
    console.error('Error adding note:', error);
    res.status(500).json({ error: 'Failed to add note' });
  }
});

export default router;

