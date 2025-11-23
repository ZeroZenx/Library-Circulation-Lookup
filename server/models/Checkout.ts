export interface CheckoutRecord {
  id: string;
  itemId: string;
  action: 'CHECKOUT' | 'CHECKIN';
  performedBy: string;
  note: string;
  timestamp: string;
}

export interface CheckoutStatus {
  isCheckedOut: boolean;
  checkedOutBy?: string;
  checkedOutAt?: string;
  checkoutNote?: string;
  lastCheckoutRecord?: CheckoutRecord;
}

