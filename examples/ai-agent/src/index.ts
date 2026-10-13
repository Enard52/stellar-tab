import 'dotenv/config';
import { Keypair } from '@stellar/stellar-sdk';
import { createSession, toStroops } from '@stellar-tab/sdk';

const ASSET_CONTRACT = process.env.ASSET_CONTRACT ?? '';
const FACILITATOR_URL = process.env.FACILITATOR_URL ?? 'http://localhost:3001';
const MOCK_API_URL = process.env.MOCK_API_URL ?? 'http://localhost:4000';
const CURRENT_LEDGER = parseInt(process.env.CURRENT_LEDGER ?? '0', 10);

async function main() {
  const secret = process.env.STELLAR_SECRET;
  if (!secret) {
    console.error('Missing STELLAR_SECRET environment variable.');
    process.exit(1);
  }
  if (!ASSET_CONTRACT) {
    console.error('Missing ASSET_CONTRACT environment variable.');
    process.exit(1);
  }
  if (!CURRENT_LEDGER) {
    console.error('Missing CURRENT_LEDGER environment variable.');
    process.exit(1);
  }

  const keypair = Keypair.fromSecret(secret);
  console.log(`[agent] Owner address: ${keypair.publicKey()}`);

  const config = {
    asset: ASSET_CONTRACT,
    spender: process.env.FACILITATOR_ADDRESS ?? '',
    cap: toStroops('10'),
    expiryLedger: CURRENT_LEDGER + 1000,
    network: 'testnet' as const,
    facilitatorUrl: FACILITATOR_URL,
  };

  console.log('[tab] Opening session...');
  const session = await createSession(config, keypair);
  console.log(`[tab] Session opened. ID: ${session.id}`);

  let totalSpent = 0n;

  for (let i = 1; i <= 10; i++) {
    console.log(`[agent] Request ${i}/10 ...`);
    const response = await session.fetch(`${MOCK_API_URL}/inference`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: `What is ${i} + ${i}?` }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`[agent] Response: ${JSON.stringify(data)}`);
      totalSpent += 100_000n;
    } else {
      console.error(`[agent] Request failed: ${response.status}`);
    }
  }

  await session.close();
  console.log(`[tab] Session closed. Total spent: ${totalSpent} stroops`);
}

main().catch((err) => {
  console.error('[agent] Fatal error:', err);
  process.exit(1);
});
