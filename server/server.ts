import express from 'express';
import cors from 'cors';
import { APP_CONFIG } from './config/appConfig';
import { loadCSV } from './services/csvLoader';
import itemsRouter from './routes/items';
import statsRouter from './routes/stats';
import notesRouter from './routes/notes';
import reportsRouter from './routes/reports';

const app = express();

// Middleware
app.use(cors({
  origin: APP_CONFIG.corsOrigin,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/items', itemsRouter);
app.use('/api/stats', statsRouter);
app.use('/api/notes', notesRouter);
app.use('/api/reports', reportsRouter);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
async function startServer() {
  try {
    // Load CSV data on startup
    console.log('Loading CSV data...');
    await loadCSV();

    const port = APP_CONFIG.port;
    app.listen(port, () => {
      console.log(`🚀 Server running on http://localhost:${port}`);
      console.log(`📊 Health check: http://localhost:${port}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

