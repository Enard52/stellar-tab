import 'dotenv/config';
import { Keypair } from '@stellar/stellar-sdk';
import { createSession, toStroops } from '@stellar-tab/sdk';

const ASSET_CONTRACT = process.env.ASSET_CONTRACT ?? '';
const FACILITATOR_URL = process.env.FACILITATOR_URL ?? 'http://localhost:3001';

const ACTIONS = [
  { name: 'Mine ore', cost: toStroops('0.001') },
  { name: 'Craft sword', cost: toStroops('0.002') },
  { name: 'Upgrade shield', cost: toStroops('0.003') },
  { name: 'Heal potion', cost: toStroops('0.001') },
  { name: 'Teleport', cost: toStroops('0.005') },
];

async function main() {
  const secret = process.env.STELLAR_SECRET;
  if (!secret) {
    console.error('Missing STELLAR_SECRET environment variable.');
    process.exit(1);
  }

  const keypair = Keypair.fromSecret(secret);
  console.log(`[game] Player address: ${keypair.publicKey()}`);

  const config = {
    asset: ASSET_CONTRACT,
    spender: process.env.FACILITATOR_ADDRESS ?? '',
    cap: toStroops('5'),
    expiryLedger:
      parseInt(process.env.CURRENT_LEDGER ?? '0', 10) + 500,    network: 'testnet' as const,
    facilitatorUrl: FACILITATOR_URL,
  };

  console.log('[tab] Opening session...');
  const session = await createSession(config, keypair);
  console.log(`[tab] Session opened. ID: ${session.id}`);

  let totalSpent = 0n;

  for (let i = 0; i < 20; i++) {
    const action = ACTIONS[i % ACTIONS.length];
    console.log(
      `[game] Action ${i + 1}: ${action.name} (cost: ${action.cost} stroops)`,
    );

    try {
      const response = await session.fetch(
        'http://localhost:4000/game-action',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: action.name,
            cost: action.cost.toString(),
          }),
        },
      );

      if (response.ok) {
        console.log(`[game] Action succeeded.`);
        totalSpent += action.cost;
      } else {
        console.error(`[game] Action failed: ${response.status}`);
      }
    } catch (err: any) {
      console.error(`[game] Error: ${err.message}`);
    }
  }

  await session.close();
  console.log(`[game] Session closed. Total spent: ${totalSpent} stroops`);
}

main().catch((err) => {
  console.error('[game] Fatal error:', err);
  process.exit(1);
});
