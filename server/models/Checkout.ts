export interface CheckoutRecord {
  id: string;
  itemId: string;
  action: 'CHECKOUT' | 'CHECKIN';
  performedBy: string; // Patron/borrower name
  staffMember: string; // Staff member who performed the action
  note: string;
  timestamp: string;
  dueDate?: string; // Due date for checkouts (ISO format)
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
}

