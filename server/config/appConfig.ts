/**
 * Application Configuration
 */

export const APP_CONFIG = {
  // Server settings
  port: process.env.PORT || 3001,
  
  // Data file paths
  csvPath: process.env.CSV_PATH || './server/data/Circulation Transactions  -2017 to 2025-2.csv',
  sampleCsvPath: './server/data/circulation.sample.csv',
  notesPath: './server/data/notes.json',
  
  // API settings
  defaultPageSize: 50,
  maxPageSize: 500,
  
  // CORS settings
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5171',
  
  // Status inference rules
  statusRules: {
    checkoutKeywords: ['CHARGE', 'CHECKOUT', 'CHECK OUT', 'LOAN', 'BORROW'],
    checkinKeywords: ['DISCHARGE', 'CHECKIN', 'CHECK IN', 'RETURN', 'RENEW'],
    lostKeywords: ['LOST', 'LOST-ASSUM', 'LOST-PAID'],
    missingKeywords: ['MISSING', 'MISSING-INVENTORY'],
    withdrawnKeywords: ['WITHDRAWN', 'WITHDRAW', 'DISCARD']
  }
};

