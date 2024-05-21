// src/index.js
import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { runConsumer } from './kafka/consumer';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.listen(port, async () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
  console.log(`Server is running at http://localhost:${port}`);
  try {
    await runConsumer();
  } catch (err) {
    console.error('Error starting Kafka consumer:', err);
    process.exit(1);
  }
});
