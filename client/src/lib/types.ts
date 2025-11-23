export interface Item {
  id: string;
  itemId: string;
  barcode: string;
  title: string;
  author: string;
  callNumber: string;
  location: string;
  itemType: string;
  lastKnownStatus: string;
  lastTransactionDate: string | null;
  transactionCount: number;
  transactions?: Transaction[];
  checkoutStatus?: CheckoutStatus;
  checkoutHistory?: CheckoutRecord[];
}

export interface ItemSummary {
  id: string;
  itemId: string;
  barcode: string;
  title: string;
  author: string;
  callNumber: string;
  location: string;
  itemType: string;
  lastKnownStatus: string;
  lastTransactionDate: string | null;
  transactionCount: number;
}

export interface Transaction {
  id: string;
  itemId: string;
  transactionType: string;
  transactionDate: string;
  patronId: string | null;
  location: string | null;
}

export interface Note {
  id: string;
  itemId: string;
  text: string;
  createdAt: string;
  createdBy: string;
}

export interface TopBorrowedTitle {
  title: string;
  author: string;
  borrowCount: number;
}

export interface UsageByPeriod {
  period: string;
  count: number;
}

export interface UsageByLocation {
  location: string;
  count: number;
}

export interface Stats {
  totalItems: number;
  totalTransactions: number;
  distinctTitles: number;
  topBorrowedTitles: TopBorrowedTitle[];
  usageByYear: UsageByPeriod[];
  usageByMonth: UsageByPeriod[];
  usageByLocation: UsageByLocation[];
}

export interface SearchParams {
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

export interface CheckoutRecord {
  id: string;
  itemId: string;
  action: 'CHECKOUT' | 'CHECKIN';
  performedBy: string;
  staffMember: string;
  note: string;
  timestamp: string;
  dueDate?: string;
}

export interface CheckoutStatus {
  isCheckedOut: boolean;
  checkedOutBy?: string;
  checkedOutAt?: string;
  checkoutNote?: string;
  staffMember?: string;
  dueDate?: string;
  isOverdue?: boolean;
  daysOverdue?: number;
  lastCheckoutRecord?: CheckoutRecord;
  history?: CheckoutRecord[];
}

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

export interface ReportingStats {
  totalCheckedOut: number;
  totalTransactions: number;
  overdueItems: number;
  avgDaysOut: number;
  avgLoanDuration: number;
}

