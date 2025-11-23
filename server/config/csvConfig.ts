/**
 * CSV Column Mapping Configuration
 * 
 * This file maps the expected column names in the Voyager CSV export.
 * If your CSV uses different column names, update the mappings below.
 * 
 * The keys are the internal field names used by the application.
 * The values are the actual column names as they appear in your CSV file.
 */

export const CSV_COLUMN_MAPPING = {
  // Item identification
  itemId: 'DISPLAY_CALL_NO', // Using call number as item ID since no explicit item ID
  barcode: 'DISPLAY_CALL_NO', // Using call number as barcode identifier
  callNumber: 'DISPLAY_CALL_NO',
  
  // Bibliographic data
  title: 'TITLE',
  author: 'TITLE', // Author may be embedded in title, will parse if needed
  
  // Location and type
  location: 'LOCATION NAME',
  itemType: 'ITEM_TYPE', // May not be present, will default
  
  // Transaction data (aggregated format - these may not be used)
  transactionType: 'CHARGE', // Default to CHARGE since we only have charge counts
  transactionDate: null, // Not available in aggregated format
  patronId: null, // Not available in aggregated format
  
  // Additional fields from this CSV
  itemEnum: 'ITEM_ENUM',
  chron: 'CHRON',
  
  // Status flags (if present in CSV)
  status: 'STATUS',
  lost: 'LOST',
  missing: 'MISSING',
  withdrawn: 'WITHDRAWN'
};

/**
 * Alternative column name mappings (common variations)
 * If your CSV uses different names, update the values above.
 * 
 * Common variations:
 * - itemId: 'Item ID', 'ItemID', 'ITEMID', 'ID'
 * - barcode: 'Barcode', 'BARCODE', 'Barcode Number'
 * - title: 'Title', 'TITLE', 'Book Title'
 * - author: 'Author', 'AUTHOR', 'Author Name'
 * - location: 'Location', 'LOCATION', 'Shelf Location'
 * - callNumber: 'Call Number', 'CALL_NUMBER', 'CallNumber'
 * - itemType: 'Item Type', 'ITEM_TYPE', 'Type'
 * - transactionType: 'Transaction Type', 'TRANSACTION_TYPE', 'Type', 'Action'
 * - transactionDate: 'Transaction Date', 'TRANSACTION_DATE', 'Date', 'Transaction_Date'
 * - patronId: 'Patron ID', 'PATRON_ID', 'PatronID', 'Borrower ID'
 */

