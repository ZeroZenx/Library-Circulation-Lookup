import { Transaction } from './Transaction';

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
  transactions: Transaction[];
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

