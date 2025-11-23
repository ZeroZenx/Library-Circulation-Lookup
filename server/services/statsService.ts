import { Stats, TopBorrowedTitle, UsageByPeriod, UsageByLocation } from '../models/Stats';
import { getAllItems, getAllTransactions } from './csvLoader';
import { APP_CONFIG } from '../config/appConfig';

/**
 * Gets top borrowed titles
 */
export function getTopBorrowedTitles(limit: number = 10): TopBorrowedTitle[] {
  const allItems = getAllItems();
  const titleMap = new Map<string, { title: string; author: string; count: number }>();

  allItems.forEach(item => {
    const key = `${item.title}|${item.author}`;
    if (!titleMap.has(key)) {
      titleMap.set(key, {
        title: item.title,
        author: item.author,
        count: 0,
      });
    }
    titleMap.get(key)!.count += item.transactionCount;
  });

  return Array.from(titleMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map(item => ({
      title: item.title,
      author: item.author,
      borrowCount: item.count,
    }));
}

/**
 * Gets usage statistics by year
 */
export function getUsageByYear(): UsageByPeriod[] {
  const transactions = getAllTransactions();
  const yearMap = new Map<string, number>();

  transactions.forEach(transaction => {
    try {
      const date = new Date(transaction.transactionDate);
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear().toString();
        yearMap.set(year, (yearMap.get(year) || 0) + 1);
      }
    } catch (error) {
      // Skip invalid dates
    }
  });

  return Array.from(yearMap.entries())
    .map(([period, count]) => ({ period, count }))
    .sort((a, b) => a.period.localeCompare(b.period));
}

/**
 * Gets usage statistics by month
 */
export function getUsageByMonth(): UsageByPeriod[] {
  const transactions = getAllTransactions();
  const monthMap = new Map<string, number>();

  transactions.forEach(transaction => {
    try {
      const date = new Date(transaction.transactionDate);
      if (!isNaN(date.getTime())) {
        const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthMap.set(month, (monthMap.get(month) || 0) + 1);
      }
    } catch (error) {
      // Skip invalid dates
    }
  });

  return Array.from(monthMap.entries())
    .map(([period, count]) => ({ period, count }))
    .sort((a, b) => a.period.localeCompare(b.period));
}

/**
 * Gets usage statistics by location
 */
export function getUsageByLocation(): UsageByLocation[] {
  const allItems = getAllItems();
  const locationMap = new Map<string, number>();

  allItems.forEach(item => {
    const location = item.location || 'Unknown';
    locationMap.set(location, (locationMap.get(location) || 0) + item.transactionCount);
  });

  return Array.from(locationMap.entries())
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Gets all statistics
 */
export function getStats(): Stats {
  const allItems = getAllItems();
  const allTransactions = getAllTransactions();

  // Get distinct titles
  const titleSet = new Set<string>();
  allItems.forEach(item => {
    if (item.title) {
      titleSet.add(item.title);
    }
  });

  return {
    totalItems: allItems.length,
    totalTransactions: allTransactions.length,
    distinctTitles: titleSet.size,
    topBorrowedTitles: getTopBorrowedTitles(10),
    usageByYear: getUsageByYear(),
    usageByMonth: getUsageByMonth(),
    usageByLocation: getUsageByLocation(),
  };
}

