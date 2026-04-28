import app from './app.js';
import { config } from './config/index.js';
import connectDB from './config/database.js';

const startServer = async () => {
  await connectDB();
  app.listen(config.port, () => {
    console.log(`[Server] Running in ${config.env} on port ${config.port}`);
  });
};

startServer();