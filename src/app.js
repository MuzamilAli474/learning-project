import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/user.route.js';
import { errorHandler } from './middlewares/error.middleware.js';
const app = express();

app.use(helmet());
app.use(express.json());
app.use(cors());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/user', userRoutes);
app.get('/', (req, res) => res.send('API is running (ESM Mode)'));

app.use(errorHandler);

export default app;