import { CheckoutRecord } from '../models/Checkout';
import { Item } from '../models/Item';
import { getAllCheckoutHistory, getCheckoutStatus } from './checkoutService';
import { getAllItems, getItemById } from './csvLoader';

export interface CheckedOutItem {
  item: Item;
  checkedOutBy: string;
  staffMember: string;
  checkedOutAt: string;
  checkoutNote?: string;
  daysOut: number;
  dueDate?: string;
  isOverdue?: boolean;
  daysOverdue?: number;
}

export interface CheckoutHistoryReport {
  item: Item;
  checkoutRecord: CheckoutRecord;
  checkinRecord?: CheckoutRecord;
  checkedOutBy: string;
  staffMember: string;
  checkedOutAt: string;
  checkedInBy?: string;
  checkedInStaffMember?: string;
  checkedInAt?: string;
  daysOut?: number;
  checkoutNote?: string;
  checkinNote?: string;
}

export interface ReportingFilters {
  status?: 'checked-out' | 'checked-in' | 'all';
  fromDate?: string;
  toDate?: string;
  performedBy?: string;
  itemId?: string;
}

/**
 * Gets all currently checked out items
 */
export function getCheckedOutItems(): CheckedOutItem[] {
  const allItems = getAllItems();
  const checkedOut: CheckedOutItem[] = [];

  allItems.forEach((item) => {
    const status = getCheckoutStatus(item.id);
    if (status.isCheckedOut && status.checkedOutAt && status.checkedOutBy) {
      const checkedOutDate = new Date(status.checkedOutAt);
      const now = new Date();
      const daysOut = Math.floor((now.getTime() - checkedOutDate.getTime()) / (1000 * 60 * 60 * 24));

      checkedOut.push({
        item,
        checkedOutBy: status.checkedOutBy,
        staffMember: status.staffMember || 'Unknown',
        checkedOutAt: status.checkedOutAt,
        checkoutNote: status.checkoutNote,
        daysOut,
        dueDate: status.dueDate,
        isOverdue: status.isOverdue,
        daysOverdue: status.daysOverdue,
      });
    }
  });

  // Sort by overdue status first, then by days out (longest first)
  return checkedOut.sort((a, b) => {
    // Overdue items first
    if (a.isOverdue && !b.isOverdue) return -1;
    if (!a.isOverdue && b.isOverdue) return 1;
    // Then by days overdue (if overdue) or days out
    if (a.isOverdue && b.isOverdue) {
      return (b.daysOverdue || 0) - (a.daysOverdue || 0);
    }
    return b.daysOut - a.daysOut;
  });
}

/**
 * Gets checkout history report with checkin information
 */
export function getCheckoutHistoryReport(filters?: ReportingFilters): CheckoutHistoryReport[] {
  const allCheckoutHistory = getAllCheckoutHistory();
  const reports: CheckoutHistoryReport[] = [];
  const itemsMap = new Map<string, Item>();

  // Build a map of items for quick lookup
  getAllItems().forEach((item) => {
    itemsMap.set(item.id, item);
  });

  // Group checkout/checkin pairs
  const checkoutMap = new Map<string, CheckoutRecord[]>();
  allCheckoutHistory.forEach((record) => {
    if (!checkoutMap.has(record.itemId)) {
      checkoutMap.set(record.itemId, []);
    }
    checkoutMap.get(record.itemId)!.push(record);
  });

  // Process each item's checkout history
  checkoutMap.forEach((records, itemId) => {
    const item = itemsMap.get(itemId);
    if (!item) return;

    // Sort records by timestamp
    records.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Pair up checkout/checkin records
    for (let i = 0; i < records.length; i++) {
      const checkoutRecord = records[i];
      
      if (checkoutRecord.action === 'CHECKOUT') {
        const checkinRecord = records.find(
          (r, idx) => idx > i && r.action === 'CHECKIN'
        );

        // Apply filters
        if (filters) {
          if (filters.status === 'checked-out' && checkinRecord) continue;
          if (filters.status === 'checked-in' && !checkinRecord) continue;
          
          if (filters.fromDate) {
            const checkoutDate = new Date(checkoutRecord.timestamp);
            const fromDate = new Date(filters.fromDate);
            if (checkoutDate < fromDate) continue;
          }
          
          if (filters.toDate) {
            const checkoutDate = new Date(checkoutRecord.timestamp);
            const toDate = new Date(filters.toDate);
            toDate.setHours(23, 59, 59, 999);
            if (checkoutDate > toDate) continue;
          }
          
          if (filters.performedBy) {
            const searchTerm = filters.performedBy.toLowerCase();
            if (
              !checkoutRecord.performedBy.toLowerCase().includes(searchTerm) &&
              (!checkinRecord || !checkinRecord.performedBy.toLowerCase().includes(searchTerm))
            ) {
              continue;
            }
          }
          
          if (filters.itemId && item.id !== filters.itemId && item.barcode !== filters.itemId) {
            continue;
          }
        }

        const checkedOutDate = new Date(checkoutRecord.timestamp);
        const daysOut = checkinRecord
          ? Math.floor(
              (new Date(checkinRecord.timestamp).getTime() - checkedOutDate.getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : Math.floor(
              (new Date().getTime() - checkedOutDate.getTime()) / (1000 * 60 * 60 * 24)
            );

        reports.push({
          item,
          checkoutRecord,
          checkinRecord,
          checkedOutBy: checkoutRecord.performedBy,
          staffMember: checkoutRecord.staffMember || 'Unknown',
          checkedOutAt: checkoutRecord.timestamp,
          checkedInBy: checkinRecord?.performedBy,
          checkedInStaffMember: checkinRecord?.staffMember,
          checkedInAt: checkinRecord?.timestamp,
          daysOut,
          checkoutNote: checkoutRecord.note || undefined,
          checkinNote: checkinRecord?.note || undefined,
        });
      }
    }
  });

  // Sort by checkout date (most recent first)
  return reports.sort(
    (a, b) =>
      new Date(b.checkedOutAt).getTime() - new Date(a.checkedOutAt).getTime()
  );
}

/**
 * Gets summary statistics for reporting
 */
export function getReportingStats() {
  const checkedOut = getCheckedOutItems();
  const history = getCheckoutHistoryReport();
  
  const totalCheckedOut = checkedOut.length;
  const totalTransactions = history.length;
  const overdueItems = checkedOut.filter(item => item.isOverdue || item.daysOut > 30).length;
  
  const avgDaysOut = checkedOut.length > 0
    ? Math.round(checkedOut.reduce((sum, item) => sum + item.daysOut, 0) / checkedOut.length)
    : 0;
  
  const avgLoanDuration = history
    .filter(h => h.daysOut !== undefined)
    .map(h => h.daysOut!)
    .reduce((sum, days, _, arr) => sum + days / arr.length, 0);

  return {
    totalCheckedOut,
    totalTransactions,
    overdueItems,
    avgDaysOut,
    avgLoanDuration: Math.round(avgLoanDuration),
  };
}

