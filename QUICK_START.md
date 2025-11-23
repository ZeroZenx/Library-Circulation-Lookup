# Quick Start Guide

## 1. Install Dependencies

```bash
npm run install:all
```

## 2. Add Your CSV File

Place your Voyager circulation CSV export at:
```
server/data/circulation.csv
```

**Note**: If your CSV uses different column names, edit `server/config/csvConfig.ts` to match your column names.

## 3. Start the Application

```bash
npm run dev
```

This will start:
- Backend server on http://localhost:3001
- Frontend on http://localhost:5173

## 4. Access the App

Open your browser to: **http://localhost:5173**

## CSV Column Requirements

Your CSV should have these columns (or update `server/config/csvConfig.ts`):

- `ITEM_ID` - Item identifier
- `BARCODE` - Item barcode  
- `TITLE` - Item title
- `AUTHOR` - Author name
- `CALL_NUMBER` - Call number
- `LOCATION` - Item location
- `ITEM_TYPE` - Item type
- `TRANSACTION_TYPE` - Transaction type (CHARGE, DISCHARGE, etc.)
- `TRANSACTION_DATE` - Transaction date (YYYY-MM-DD format recommended)
- `PATRON_ID` - Patron/borrower ID

## Sample Data

If you don't have your CSV ready yet, the app will use `server/data/circulation.sample.csv` for demonstration.

## Troubleshooting

- **Port already in use?** Edit `server/config/appConfig.ts` (server port) or `client/vite.config.ts` (client port)
- **CSV not loading?** Check the server console for error messages
- **Columns not matching?** Update `server/config/csvConfig.ts` with your column names

For more details, see [README.md](README.md).

