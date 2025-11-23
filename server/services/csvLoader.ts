import * as fs from 'fs';
import * as path from 'path';
import csv from 'csv-parser';
import { Item } from '../models/Item';
import { Transaction } from '../models/Transaction';
import { CSV_COLUMN_MAPPING } from '../config/csvConfig';
import { APP_CONFIG } from '../config/appConfig';
import { inferStatusFromTransactions } from './statusHelpers';

let itemsCache: Item[] = [];
let transactionsCache: Transaction[] = [];
let isLoaded = false;

/**
 * Normalizes column names by trimming and converting to uppercase for comparison
 */
function normalizeColumnName(name: string): string {
  return name.trim().toUpperCase();
}

/**
 * Gets the value from a CSV row using the column mapping
 */
function getValue(row: any, mappedKey: string): string {
  const columnName = CSV_COLUMN_MAPPING[mappedKey as keyof typeof CSV_COLUMN_MAPPING];
  if (!columnName) return '';

  // Try exact match first
  if (row[columnName] !== undefined) {
    return String(row[columnName] || '').trim();
  }

  // Try case-insensitive match
  const normalizedColumnName = normalizeColumnName(columnName);
  for (const key in row) {
    if (normalizeColumnName(key) === normalizedColumnName) {
      return String(row[key] || '').trim();
    }
  }

  return '';
}

/**
 * Parses author from title if format is "Title / Author"
 */
function parseAuthorFromTitle(title: string): { title: string; author: string } {
  const parts = title.split(' / ');
  if (parts.length > 1) {
    return {
      title: parts[0].trim(),
      author: parts.slice(1).join(' / ').trim(),
    };
  }
  return { title: title.trim(), author: '' };
}

/**
 * Creates a unique item ID from available fields
 */
function createItemId(row: any): string {
  const callNumber = getValue(row, 'callNumber') || '';
  const location = getValue(row, 'location') || '';
  const itemEnum = getValue(row, 'itemEnum') || '';
  const chron = getValue(row, 'chron') || '';
  
  // Create unique ID from combination of fields
  const parts = [callNumber, location, itemEnum, chron].filter(p => p);
  return parts.join('|') || `item-${Date.now()}-${Math.random()}`;
}

/**
 * Loads and parses the CSV file
 */
export async function loadCSV(): Promise<void> {
  if (isLoaded) {
    return;
  }

  const csvPath = path.resolve(APP_CONFIG.csvPath);
  const sampleCsvPath = path.resolve(APP_CONFIG.sampleCsvPath);

  let filePath = csvPath;
  let usingSample = false;

  // Check if main CSV exists, otherwise use sample
  if (!fs.existsSync(csvPath)) {
    if (fs.existsSync(sampleCsvPath)) {
      filePath = sampleCsvPath;
      usingSample = true;
      console.log('⚠️  Main CSV not found. Using sample CSV for demonstration.');
      console.log(`   Place your real CSV at: ${csvPath}`);
    } else {
      throw new Error(`CSV file not found at ${csvPath} or ${sampleCsvPath}`);
    }
  }

  const transactions: Transaction[] = [];
  const items: Item[] = [];

  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row: any) => {
        try {
          const callNumber = getValue(row, 'callNumber');
          if (!callNumber && !getValue(row, 'title')) {
            // Skip rows without basic identification
            return;
          }

          // Create unique item ID
          const itemId = createItemId(row);
          
          // Get transaction count (for aggregated format)
          const transactionCountStr = row['CountOfCHARGE_DATE'] || '0';
          const transactionCount = parseInt(String(transactionCountStr), 10) || 0;

          // Parse title and author
          const fullTitle = getValue(row, 'title') || '';
          const { title, author } = parseAuthorFromTitle(fullTitle);

          // Get location
          const location = getValue(row, 'location') || '';

          // Create item
          const item: Item = {
            id: itemId,
            itemId: itemId,
            barcode: callNumber, // Use call number as barcode identifier
            title: title,
            author: author,
            callNumber: callNumber,
            location: location,
            itemType: getValue(row, 'itemType') || 'Unknown',
            lastKnownStatus: transactionCount > 0 ? 'Likely available' : 'Unknown',
            lastTransactionDate: null, // Not available in aggregated format
            transactionCount: transactionCount,
            transactions: [], // No individual transactions in aggregated format
          };

          items.push(item);

          // Create synthetic transactions for analytics (one per charge count)
          // These are placeholders for the count, not real transaction records
          for (let i = 0; i < transactionCount; i++) {
            const transaction: Transaction = {
              id: `${itemId}-tx-${i}`,
              itemId: itemId,
              transactionType: 'CHARGE',
              transactionDate: '2017-01-01', // Placeholder date since we don't have actual dates
              patronId: null,
              location: location || null,
            };
            transactions.push(transaction);
          }
        } catch (error) {
          console.error('Error parsing row:', error);
        }
      })
      .on('end', () => {
        itemsCache = items;
        transactionsCache = transactions;
        isLoaded = true;

        console.log(`✅ Loaded ${items.length} items with ${transactions.length} total charge transactions from CSV`);
        if (usingSample) {
          console.log('   (Using sample data - replace with your real CSV)');
        } else {
          console.log('   (Using aggregated circulation data)');
        }

        resolve();
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

/**
 * Reloads the CSV (useful if the file is updated)
 */
export async function reloadCSV(): Promise<void> {
  isLoaded = false;
  itemsCache = [];
  transactionsCache = [];
  await loadCSV();
}

/**
 * Gets all items
 */
export function getAllItems(): Item[] {
  return itemsCache;
}

/**
 * Gets all transactions
 */
export function getAllTransactions(): Transaction[] {
  return transactionsCache;
}

/**
 * Gets an item by ID
 */
export function getItemById(itemId: string): Item | undefined {
  return itemsCache.find(item => item.id === itemId || item.itemId === itemId || item.barcode === itemId);
}

