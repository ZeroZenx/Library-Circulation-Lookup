# Library Circulation Lookup

A read-only web application for library staff to search and analyze legacy circulation data from Voyager. This tool provides lookup, filtering, item history, and simple analytics for circulation transactions exported from the Voyager ILS system.

## Purpose

This application is designed to help library staff access historical circulation data after the Voyager system went offline due to ransomware and hardware failure. It is **read-only** and does not replace a full Integrated Library System (ILS). It does not support:

- Live check-in or check-out operations
- Fines, fees, or renewals
- Patron account management
- Real-time inventory updates

## Features

- **Search & Filter**: Search items by title, author, barcode, or call number with advanced filtering options
- **Item Details**: View complete item information including transaction history
- **Status Inference**: Automatically determines item status based on transaction history
- **Analytics**: View usage statistics by year, month, and location
- **Staff Notes**: Add and view staff notes for individual items (stored locally in JSON)

## Tech Stack

### Backend
- Node.js 20
- TypeScript
- Express
- csv-parser for CSV parsing
- File system-based JSON storage for notes

### Frontend
- React 18 with TypeScript
- Vite for bundling
- Tailwind CSS for styling
- Recharts for analytics visualization
- React Router for navigation

## Project Structure

```
library-circulation-lookup/
├── package.json              # Root package.json with dev scripts
├── tsconfig.json             # TypeScript config for server
├── README.md                 # This file
│
├── server/                   # Backend code
│   ├── server.ts            # Express server entry point
│   ├── config/
│   │   ├── csvConfig.ts     # CSV column mapping configuration
│   │   └── appConfig.ts     # Application configuration
│   ├── models/              # TypeScript type definitions
│   │   ├── Item.ts
│   │   ├── Transaction.ts
│   │   ├── Stats.ts
│   │   └── Note.ts
│   ├── services/            # Business logic
│   │   ├── csvLoader.ts     # CSV parsing and loading
│   │   ├── itemService.ts   # Item search and filtering
│   │   ├── statsService.ts  # Analytics calculations
│   │   ├── notesService.ts  # Staff notes management
│   │   └── statusHelpers.ts # Status inference logic
│   ├── routes/              # API route handlers
│   │   ├── items.ts
│   │   ├── stats.ts
│   │   └── notes.ts
│   └── data/                # Data files
│       ├── circulation.csv          # Your real CSV file (place here)
│       ├── circulation.sample.csv   # Sample data for testing
│       └── notes.json              # Staff notes (auto-created)
│
└── client/                  # Frontend code
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.cjs
    ├── index.html
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── pages/
        │   ├── SearchPage.tsx
        │   ├── ItemDetailPage.tsx
        │   └── AnalyticsPage.tsx
        ├── components/
        │   ├── Layout.tsx
        │   ├── SearchBar.tsx
        │   ├── FiltersPanel.tsx
        │   ├── ItemsTable.tsx
        │   ├── ItemDetailPanel.tsx
        │   ├── StatusBadge.tsx
        │   ├── NotesPanel.tsx
        │   ├── StatsCards.tsx
        │   └── UsageCharts.tsx
        ├── lib/
        │   ├── api.ts           # API client functions
        │   ├── types.ts          # TypeScript types
        │   └── statusHelpers.ts # Status display helpers
        ├── config/
        │   └── uiConfig.ts
        └── styles/
            └── index.css
```

## Setup Instructions

### 1. Install Dependencies

From the project root directory:

```bash
npm run install:all
```

This will install dependencies for both the server and client.

### 2. Prepare Your CSV File

1. Export your Voyager circulation data as a CSV file
2. Place the CSV file at: `server/data/circulation.csv`

**Important**: The CSV must include columns that match the mapping defined in `server/config/csvConfig.ts`. By default, the application expects these column names:

- `ITEM_ID` - Unique item identifier
- `BARCODE` - Item barcode
- `TITLE` - Book/item title
- `AUTHOR` - Author name
- `CALL_NUMBER` - Library call number
- `LOCATION` - Item location/shelf
- `ITEM_TYPE` - Type of item (Book, DVD, etc.)
- `TRANSACTION_TYPE` - Type of transaction (CHARGE, DISCHARGE, etc.)
- `TRANSACTION_DATE` - Date of transaction
- `PATRON_ID` - Patron/borrower ID

**If your CSV uses different column names**, edit `server/config/csvConfig.ts` and update the `CSV_COLUMN_MAPPING` object to match your column names.

### 3. Run the Application

#### Development Mode (Both Server and Client)

```bash
npm run dev
```

This starts:
- Backend server on `http://localhost:3001`
- Frontend dev server on `http://localhost:5173`

The frontend will automatically open in your browser, or navigate to `http://localhost:5173`.

#### Run Server Only

```bash
npm run dev:server
```

#### Run Client Only

```bash
npm run dev:client
```

### 4. Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001/api/health

## Using the Application

### Search Page

1. Use the search bar to search across titles, authors, barcodes, and call numbers
2. Use the filters panel to narrow results by:
   - Location
   - Item Type
   - Status
   - Date range (based on last transaction date)
3. Click on any item in the results table to view full details

### Item Detail Page

- View complete item metadata
- See full transaction history sorted by date
- View and add staff notes
- See inferred status based on transaction history

### Analytics Page

- View summary statistics (total items, transactions, distinct titles)
- See usage trends by year and month
- Analyze usage by location
- View top borrowed titles

## CSV Column Mapping

If your CSV file uses different column names than the defaults, edit `server/config/csvConfig.ts`:

```typescript
export const CSV_COLUMN_MAPPING = {
  itemId: 'YOUR_ITEM_ID_COLUMN',
  barcode: 'YOUR_BARCODE_COLUMN',
  title: 'YOUR_TITLE_COLUMN',
  // ... etc
};
```

The application will attempt to match columns case-insensitively, but exact matches are preferred.

## Status Inference

The application automatically infers item status from transaction history:

- **Likely on loan**: Last transaction contains keywords like CHARGE, CHECKOUT, LOAN
- **Likely available**: Last transaction contains keywords like DISCHARGE, CHECKIN, RETURN
- **Lost**: Last transaction indicates LOST status
- **Missing**: Last transaction indicates MISSING status
- **Withdrawn**: Last transaction indicates WITHDRAWN status
- **Unknown**: Cannot determine status from available data

Status inference rules can be customized in `server/config/appConfig.ts`.

## Staff Notes

Staff notes are stored locally in `server/data/notes.json`. Each note includes:
- Item ID
- Note text
- Created by (staff name)
- Created timestamp

Notes persist across server restarts but are not synced with any external system.

## API Endpoints

### Items

- `GET /api/items` - Search and filter items
  - Query parameters: `q`, `title`, `author`, `barcode`, `location`, `status`, `itemType`, `fromDate`, `toDate`, `page`, `pageSize`
- `GET /api/items/:id` - Get item details with transaction history
- `GET /api/items/:id/notes` - Get notes for an item
- `POST /api/items/:id/notes` - Add a note for an item
  - Body: `{ text: string, createdBy: string }`

### Statistics

- `GET /api/stats` - Get analytics statistics

### Health

- `GET /api/health` - Health check endpoint

## Troubleshooting

### CSV Not Loading

1. Check that `server/data/circulation.csv` exists
2. Verify CSV column names match `server/config/csvConfig.ts`
3. Check server console for error messages
4. The app will fall back to `circulation.sample.csv` if the main file is missing

### Port Already in Use

If port 3001 (server) or 5173 (client) is already in use:

1. Edit `server/config/appConfig.ts` to change the server port
2. Edit `client/vite.config.ts` to change the client port
3. Update the CORS origin in `server/config/appConfig.ts` if needed

### Data Not Appearing

1. Verify your CSV file is properly formatted
2. Check that column names match the configuration
3. Review server console logs for parsing errors
4. Ensure dates are in a parseable format (YYYY-MM-DD recommended)

## Building for Production

```bash
npm run build
```

This builds the frontend for production. The built files will be in `client/dist/`.

To serve the production build, you'll need to configure your Express server to serve static files from `client/dist/` or use a separate web server.

## Important Notes

- **Read-Only**: This application is read-only and does not modify your CSV data
- **No Database**: All data is loaded into memory from CSV on server startup
- **Local Storage**: Staff notes are stored in a local JSON file
- **Not a Replacement**: This tool does not replace a full ILS system
- **Data Refresh**: To reload CSV data, restart the server

## Support

For issues or questions:
1. Check the server console for error messages
2. Verify CSV format and column mappings
3. Review the configuration files in `server/config/`

## License

This is an internal tool for library staff use.

