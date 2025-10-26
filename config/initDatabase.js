import dotenv from 'dotenv';
import { testConnection, initializeDatabase } from './database.js';

dotenv.config();


async function init() {
  console.log('🔄 Initializing database...');
  
  try {
    // Test connection
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ Failed to connect to database');
      process.exit(1);
    }

    // Initialize tables
    await initializeDatabase();
    
    console.log('✅ Database initialized successfully');
    console.log('🎉 You can now start the server with: npm start');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Initialization failed:', error.message);
    process.exit(1);
  }
}

init();