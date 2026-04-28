import express from 'express';
import helmet from 'helmet';
import cors from 'cors';

const app = express();

app.use(helmet());
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => res.send('API is running (ESM Mode)'));

export default app;