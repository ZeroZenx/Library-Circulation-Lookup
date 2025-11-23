import * as fs from 'fs';
import * as path from 'path';
import { Note } from '../models/Note';
import { APP_CONFIG } from '../config/appConfig';

let notesCache: Map<string, Note[]> = new Map();

/**
 * Loads notes from JSON file
 */
function loadNotes(): void {
  const notesPath = path.resolve(APP_CONFIG.notesPath);
  
  if (!fs.existsSync(notesPath)) {
    // Create empty notes file if it doesn't exist
    fs.writeFileSync(notesPath, JSON.stringify({}, null, 2));
    notesCache = new Map();
    return;
  }

  try {
    const data = fs.readFileSync(notesPath, 'utf-8');
    const notesObj = JSON.parse(data);
    notesCache = new Map(Object.entries(notesObj));
  } catch (error) {
    console.error('Error loading notes:', error);
    notesCache = new Map();
  }
}

/**
 * Saves notes to JSON file
 */
function saveNotes(): void {
  const notesPath = path.resolve(APP_CONFIG.notesPath);
  const notesDir = path.dirname(notesPath);

  // Ensure directory exists
  if (!fs.existsSync(notesDir)) {
    fs.mkdirSync(notesDir, { recursive: true });
  }

  // Convert Map to object
  const notesObj: Record<string, Note[]> = {};
  notesCache.forEach((notes, itemId) => {
    notesObj[itemId] = notes;
  });

  try {
    fs.writeFileSync(notesPath, JSON.stringify(notesObj, null, 2));
  } catch (error) {
    console.error('Error saving notes:', error);
    throw error;
  }
}

// Load notes on module initialization
loadNotes();

/**
 * Gets all notes for an item
 */
export function getNotesForItem(itemId: string): Note[] {
  return notesCache.get(itemId) || [];
}

/**
 * Adds a note for an item
 */
export function addNoteForItem(itemId: string, text: string, createdBy: string): Note {
  const note: Note = {
    id: `${itemId}-${Date.now()}`,
    itemId,
    text,
    createdAt: new Date().toISOString(),
    createdBy,
  };

  if (!notesCache.has(itemId)) {
    notesCache.set(itemId, []);
  }

  notesCache.get(itemId)!.push(note);
  saveNotes();

  return note;
}

