export interface Transaction {
  id: string;
  itemId: string;
  transactionType: string;
  transactionDate: string;
  patronId: string | null;
  location: string | null;
}

