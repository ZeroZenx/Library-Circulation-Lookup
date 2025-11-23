import * as fs from 'fs';
import * as path from 'path';
import { CheckoutRecord, CheckoutStatus } from '../models/Checkout';
import { APP_CONFIG } from '../config/appConfig';

let checkoutsCache: Map<string, CheckoutRecord[]> = new Map();

/**
 * Loads checkout records from JSON file
 */
function loadCheckouts(): void {
  const checkoutsPath = path.resolve('./server/data/checkouts.json');
  
  if (!fs.existsSync(checkoutsPath)) {
    // Create empty checkouts file if it doesn't exist
    fs.writeFileSync(checkoutsPath, JSON.stringify({}, null, 2));
    checkoutsCache = new Map();
    return;
  }

  try {
    const data = fs.readFileSync(checkoutsPath, 'utf-8');
    const checkoutsObj = JSON.parse(data);
    // Migrate old records to include staffMember field for backward compatibility
    Object.keys(checkoutsObj).forEach((itemId) => {
      checkoutsObj[itemId] = checkoutsObj[itemId].map((record: any) => ({
        ...record,
        staffMember: record.staffMember || record.performedBy || 'Unknown',
      }));
    });
    checkoutsCache = new Map(Object.entries(checkoutsObj));
  } catch (error) {
    console.error('Error loading checkouts:', error);
    checkoutsCache = new Map();
  }
}

/**
 * Saves checkout records to JSON file
 */
function saveCheckouts(): void {
  const checkoutsPath = path.resolve('./server/data/checkouts.json');
  const checkoutsDir = path.dirname(checkoutsPath);

  // Ensure directory exists
  if (!fs.existsSync(checkoutsDir)) {
    fs.mkdirSync(checkoutsDir, { recursive: true });
  }

  // Convert Map to object
  const checkoutsObj: Record<string, CheckoutRecord[]> = {};
  checkoutsCache.forEach((records, itemId) => {
    checkoutsObj[itemId] = records;
  });

  try {
    fs.writeFileSync(checkoutsPath, JSON.stringify(checkoutsObj, null, 2));
  } catch (error) {
    console.error('Error saving checkouts:', error);
    throw error;
  }
}

// Load checkouts on module initialization
loadCheckouts();

/**
 * Gets all checkout records for an item
 */
export function getCheckoutHistory(itemId: string): CheckoutRecord[] {
  return checkoutsCache.get(itemId) || [];
}

/**
 * Gets current checkout status for an item
 */
export function getCheckoutStatus(itemId: string): CheckoutStatus {
  const history = getCheckoutHistory(itemId);
  
  if (history.length === 0) {
    return { isCheckedOut: false };
  }

  // Get the most recent record
  const lastRecord = history[history.length - 1];
  
  if (lastRecord.action === 'CHECKOUT') {
    const dueDate = lastRecord.dueDate;
    let isOverdue = false;
    let daysOverdue = 0;
    
    if (dueDate) {
      const due = new Date(dueDate);
      const now = new Date();
      if (now > due) {
        isOverdue = true;
        daysOverdue = Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
      }
    }
    
    return {
      isCheckedOut: true,
      checkedOutBy: lastRecord.performedBy,
      checkedOutAt: lastRecord.timestamp,
      checkoutNote: lastRecord.note,
      staffMember: lastRecord.staffMember,
      dueDate: dueDate,
      isOverdue,
      daysOverdue,
      lastCheckoutRecord: lastRecord,
    };
  } else {
    return {
      isCheckedOut: false,
      lastCheckoutRecord: lastRecord,
    };
  }
}

/**
 * Checks out an item
 */
export function checkoutItem(itemId: string, performedBy: string, staffMember: string, note: string, dueDate?: string): CheckoutRecord {
  const status = getCheckoutStatus(itemId);
  
  if (status.isCheckedOut) {
    throw new Error('Item is already checked out');
  }

  const record: CheckoutRecord = {
    id: `${itemId}-${Date.now()}`,
    itemId,
    action: 'CHECKOUT',
    performedBy,
    staffMember,
    note,
    timestamp: new Date().toISOString(),
    dueDate: dueDate,
  };

  if (!checkoutsCache.has(itemId)) {
    checkoutsCache.set(itemId, []);
  }

  checkoutsCache.get(itemId)!.push(record);
  saveCheckouts();

  return record;
}

/**
 * Checks in an item
 */
export function checkinItem(itemId: string, performedBy: string, staffMember: string, note: string): CheckoutRecord {
  const status = getCheckoutStatus(itemId);
  
  if (!status.isCheckedOut) {
    throw new Error('Item is not currently checked out');
  }

  const record: CheckoutRecord = {
    id: `${itemId}-${Date.now()}`,
    itemId,
    action: 'CHECKIN',
    performedBy,
    staffMember,
    note,
    timestamp: new Date().toISOString(),
  };

  if (!checkoutsCache.has(itemId)) {
    checkoutsCache.set(itemId, []);
  }

  checkoutsCache.get(itemId)!.push(record);
  saveCheckouts();

  return record;
}

/**
 * Gets checkout history for all items (for admin/analytics)
 */
export function getAllCheckoutHistory(): CheckoutRecord[] {
  const allRecords: CheckoutRecord[] = [];
  checkoutsCache.forEach((records) => {
    allRecords.push(...records);
  });
  
  // Sort by timestamp, most recent first
  return allRecords.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

