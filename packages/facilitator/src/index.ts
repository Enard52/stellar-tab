import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { router } from './routes';
import { loadFacilitatorKeypair } from './verifySession';

const app = express();
const port = parseInt(process.env.PORT ?? '3001', 10);

app.use(cors());
app.use(express.json());
app.use(router);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', facilitator: loadFacilitatorKeypair().publicKey() });
});

app.listen(port, () => {
  console.log(`[facilitator] Listening on http://localhost:${port}`);
  console.log(
    `[facilitator] Facilitator address: ${loadFacilitatorKeypair().publicKey()}`,
  );
});
