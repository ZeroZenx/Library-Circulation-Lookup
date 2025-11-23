import { Transaction } from '../models/Transaction';
import { APP_CONFIG } from '../config/appConfig';

/**
 * Infers the last known status of an item based on its transaction history
 */
export function inferStatusFromTransactions(transactions: Transaction[]): string {
  if (transactions.length === 0) {
    return 'Unknown';
  }

  // Get the most recent transaction
  const lastTransaction = transactions[transactions.length - 1];
  const transactionType = lastTransaction.transactionType?.toUpperCase() || '';

  // Check for explicit status flags
  if (APP_CONFIG.statusRules.lostKeywords.some(keyword => 
    transactionType.includes(keyword.toUpperCase())
  )) {
    return 'Lost';
  }

  if (APP_CONFIG.statusRules.missingKeywords.some(keyword => 
    transactionType.includes(keyword.toUpperCase())
  )) {
    return 'Missing';
  }

  if (APP_CONFIG.statusRules.withdrawnKeywords.some(keyword => 
    transactionType.includes(keyword.toUpperCase())
  )) {
    return 'Withdrawn';
  }

  // Check for checkout/checkin patterns
  if (APP_CONFIG.statusRules.checkoutKeywords.some(keyword => 
    transactionType.includes(keyword.toUpperCase())
  )) {
    return 'Likely on loan';
  }

  if (APP_CONFIG.statusRules.checkinKeywords.some(keyword => 
    transactionType.includes(keyword.toUpperCase())
  )) {
    return 'Likely available';
  }

  // Default fallback
  return 'Unknown';
}

