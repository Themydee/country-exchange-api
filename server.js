import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import countryRoutes from './routes/countryRoutes.js';
import { testConnection, initializeDatabase } from './config/database.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Country Currency & Exchange API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      refresh: 'POST /countries/refresh',
      countries: 'GET /countries',
      country: 'GET /countries/:name',
      delete: 'DELETE /countries/:name',
      status: 'GET /status',
      image: 'GET /countries/image'
    }
  });
});

// API Routes
app.use('/', countryRoutes);

// 404 Handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Initialize database and start server
async function startServer() {
  try {
    // Test database connection
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ Failed to connect to database. Please check your configuration.');
      process.exit(1);
    }

    // Initialize database tables
    await initializeDatabase();

   // Start server
const HOST = '0.0.0.0'; // Allow external connections

app.listen(PORT, HOST, () => {
  console.log(`
╔══════════════════════════════════════════════════════╗
║                                                      ║
║   🚀 Country Currency & Exchange API                ║
║                                                      ║
║   Server running on http://${HOST}:${PORT.toString().padEnd(27)}║
║   Environment: ${(process.env.NODE_ENV || 'development').padEnd(35)}║
║                                                      ║
║   📡 Endpoints:                                      ║
║   - POST /countries/refresh                          ║
║   - GET  /countries                                  ║
║   - GET  /countries/:name                            ║
║   - DELETE /countries/:name                          ║
║   - GET  /status                                     ║
║   - GET  /countries/image                            ║
║                                                      ║
╚══════════════════════════════════════════════════════╝
  `);
});

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Start the server
startServer();

export default app;