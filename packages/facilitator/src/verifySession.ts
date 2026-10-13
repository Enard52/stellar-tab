import {
  Contract,
  Keypair,
  TransactionBuilder,
  BASE_FEE,
  nativeToScVal,
  Address,
  scValToNative,
} from '@stellar/stellar-sdk';
import { Server } from '@stellar/stellar-sdk/rpc';
import { networkPassphrase, rpcUrl } from './utils';

export interface SessionRecord {
  sessionId: string;
  asset: string;
  owner: string;
  spender: string;
  cap: bigint;
  spent: bigint;
  expiryLedger: number;
  network: 'testnet' | 'mainnet';
  approveTxHash: string;
  active: boolean;
}

const sessions = new Map<string, SessionRecord>();

export function getSession(sessionId: string): SessionRecord | undefined {
  return sessions.get(sessionId);
}

export function setSession(session: SessionRecord): void {
  sessions.set(session.sessionId, session);
}

export function deleteSession(sessionId: string): void {
  const s = sessions.get(sessionId);
  if (s) s.active = false;
}

export function loadFacilitatorKeypair(): Keypair {
  const secret = process.env.FACILITATOR_SECRET;
  if (!secret) {
    throw new Error('Missing FACILITATOR_SECRET environment variable');
  }
  return Keypair.fromSecret(secret);
}

export async function verifyAllowance(session: SessionRecord): Promise<bigint> {
  const passphrase = networkPassphrase(session.network);
  const server = new Server(rpcUrl(session.network));
  const contract = new Contract(session.asset);

  const call = contract.call(
    'allowance',
    nativeToScVal(Address.fromString(session.owner), { type: 'address' }),
    nativeToScVal(Address.fromString(session.spender), { type: 'address' }),
  );

  const sourceAccount = await server.getAccount(
    loadFacilitatorKeypair().publicKey(),
  );

  const tx = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: passphrase,
  })
    .addOperation(call)
    .setTimeout(30)
    .build();

  const simulated = await server.simulateTransaction(tx);
  if ('error' in simulated) {
    throw new Error(`Simulation failed: ${simulated.error}`);
  }
  const result = (simulated as any).result;
  if (!result) return 0n;
  return BigInt(scValToNative(result.retval));
}

async function getCurrentLedger(
  network: 'testnet' | 'mainnet',
): Promise<number> {
  const server = new Server(rpcUrl(network));
  const health = await server.getLatestLedger();
  return health.sequence;
}

export async function canSettle(
  session: SessionRecord,
  amount: bigint,
): Promise<{ ok: boolean; reason?: string; remaining: bigint }> {
  if (!session.active) {
    return { ok: false, reason: 'Session is not active', remaining: 0n };
  }

  const currentLedger = await getCurrentLedger(session.network);
  if (currentLedger >= session.expiryLedger) {
    return { ok: false, reason: 'Session has expired', remaining: 0n };
  }

  const onChainAllowance = await verifyAllowance(session);
  if (onChainAllowance < amount) {
    return {
      ok: false,
      reason: `Insufficient allowance: ${onChainAllowance} < ${amount}`,
      remaining: onChainAllowance,
    };
  }

  return { ok: true, remaining: onChainAllowance };
}
