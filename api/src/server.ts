import app from './app';
import { closeDatabase, initializeDatabase } from './utils/database';

const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

console.log('🚀 Starting server setup...');
console.log(`📡 PORT: ${PORT}`);
console.log(`🔗 CORS_ORIGIN: ${CORS_ORIGIN}`);

async function startServer() {
  try {
    console.log('📦 Initializing database...');
    await initializeDatabase();
    console.log('✅ Database initialized');

    console.log(`🔌 Starting server on port ${PORT}...`);
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`📚 API documentation: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

async function shutdownGracefully(signal: string) {
  console.log(`\n🛑 Shutting down gracefully (${signal})...`);
  try {
    await closeDatabase();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error closing database:', error);
  }
  process.exit(0);
}

process.on('SIGINT', () => shutdownGracefully('SIGINT'));
process.on('SIGTERM', () => shutdownGracefully('SIGTERM'));

startServer();