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

