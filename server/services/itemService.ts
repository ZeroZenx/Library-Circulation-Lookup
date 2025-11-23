import { Item, ItemSummary } from '../models/Item';
import { Transaction } from '../models/Transaction';
import { getAllItems, getItemById } from './csvLoader';
import { APP_CONFIG } from '../config/appConfig';

export interface SearchOptions {
  q?: string;
  title?: string;
  author?: string;
  barcode?: string;
  location?: string;
  status?: string;
  itemType?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  pageSize?: number;
}

export interface SearchResult {
  items: ItemSummary[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Normalizes a string for search (lowercase, trim)
 */
function normalizeSearch(text: string): string {
  return text.toLowerCase().trim();
}

/**
 * Checks if a string matches a search query
 */
function matchesSearch(text: string, query: string): boolean {
  if (!query) return true;
  return normalizeSearch(text).includes(normalizeSearch(query));
}

/**
 * Checks if a date is within a range
 */
function isDateInRange(dateStr: string | null, fromDate?: string, toDate?: string): boolean {
  if (!dateStr) return false;
  
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return false;

  if (fromDate) {
    const from = new Date(fromDate);
    if (date < from) return false;
  }

  if (toDate) {
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999); // Include entire end date
    if (date > to) return false;
  }

  return true;
}

/**
 * Searches and filters items
 */
export function searchItems(options: SearchOptions): SearchResult {
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
    page = 1,
    pageSize = APP_CONFIG.defaultPageSize,
  } = options;

  const allItems = getAllItems();
  let filtered = [...allItems];

  // General text search (q parameter)
  if (q) {
    filtered = filtered.filter(item =>
      matchesSearch(item.title, q) ||
      matchesSearch(item.author, q) ||
      matchesSearch(item.barcode, q) ||
      matchesSearch(item.callNumber, q)
    );
  }

  // Specific field filters
  if (title) {
    filtered = filtered.filter(item => matchesSearch(item.title, title));
  }

  if (author) {
    filtered = filtered.filter(item => matchesSearch(item.author, author));
  }

  if (barcode) {
    filtered = filtered.filter(item => matchesSearch(item.barcode, barcode));
  }

  if (location) {
    filtered = filtered.filter(item => matchesSearch(item.location, location));
  }

  if (status) {
    filtered = filtered.filter(item => item.lastKnownStatus === status);
  }

  if (itemType) {
    filtered = filtered.filter(item => matchesSearch(item.itemType, itemType));
  }

  // Date range filter (based on last transaction date)
  if (fromDate || toDate) {
    filtered = filtered.filter(item =>
      isDateInRange(item.lastTransactionDate, fromDate, toDate)
    );
  }

  // Pagination
  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const pageNum = Math.max(1, Math.min(page, totalPages));
  const start = (pageNum - 1) * pageSize;
  const end = start + pageSize;

  const paginated = filtered.slice(start, end);

  // Convert to ItemSummary (exclude full transaction arrays)
  const items: ItemSummary[] = paginated.map(item => ({
    id: item.id,
    itemId: item.itemId,
    barcode: item.barcode,
    title: item.title,
    author: item.author,
    callNumber: item.callNumber,
    location: item.location,
    itemType: item.itemType,
    lastKnownStatus: item.lastKnownStatus,
    lastTransactionDate: item.lastTransactionDate,
    transactionCount: item.transactionCount,
  }));

  return {
    items,
    total,
    page: pageNum,
    pageSize,
    totalPages,
  };
}

/**
 * Gets an item with full transaction history
 */
export function getItemWithHistory(itemId: string): Item | null {
  const item = getItemById(itemId);
  if (!item) {
    return null;
  }

  // Return a copy with transactions sorted by date
  return {
    ...item,
    transactions: [...item.transactions].sort((a, b) => {
      const dateA = new Date(a.transactionDate).getTime();
      const dateB = new Date(b.transactionDate).getTime();
      return dateB - dateA; // Most recent first
    }),
  };
}

