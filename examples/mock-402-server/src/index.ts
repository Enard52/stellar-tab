import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
const port = parseInt(process.env.PORT ?? '4000', 10);

app.use(cors());
app.use(express.json());

app.post('/inference', (req, res) => {
  const paid = req.header('x-tab-paid');
  if (!paid) {
    return res.status(402).json({
      error: 'Payment Required',
      amount: '100000',
      asset: process.env.ASSET_CONTRACT ?? 'native',
      destination: process.env.DESTINATION ?? '',
    });
  }
  const { prompt } = req.body ?? {};
  return res.json({
    answer: `Mock AI response to: "${prompt ?? 'unknown'}"`,
    paid: true,
  });
});

app.post('/game-action', (req, res) => {
  const paid = req.header('x-tab-paid');
  if (!paid) {
    return res.status(402).json({
      error: 'Payment Required',
      amount: req.body?.cost ?? '1000',
      asset: process.env.ASSET_CONTRACT ?? 'native',
      destination: process.env.DESTINATION ?? '',
    });
  }
  return res.json({ action: req.body?.action, result: 'success' });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'mock-402-server' });
});

app.listen(port, () => {
  console.log(`[mock-402] Listening on http://localhost:${port}`);
});
