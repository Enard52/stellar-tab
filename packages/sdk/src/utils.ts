import { Keypair, Networks } from '@stellar/stellar-sdk';

export function toStroops(decimal: string): bigint {
  const [whole, fraction = ''] = decimal.split('.');
  const paddedFraction = fraction.padEnd(7, '0').slice(0, 7);
  return BigInt(whole) * 10_000_000n + BigInt(paddedFraction);
}

export function fromStroops(stroops: bigint): string {
  const whole = stroops / 10_000_000n;
  const fraction = stroops % 10_000_000n;
  return `${whole}.${fraction.toString().padStart(7, '0')}`;
}

export function networkPassphrase(network: 'testnet' | 'mainnet'): string {
  return network === 'testnet' ? Networks.TESTNET : Networks.PUBLIC;
}

export function rpcUrl(network: 'testnet' | 'mainnet'): string {
  return network === 'testnet'
    ? 'https://soroban-testnet.stellar.org'
    : 'https://soroban-mainnet.stellar.org';
}

export function keypairFromEnv(envVar: string): Keypair {
  const secret = process.env[envVar];
  if (!secret) {
    throw new Error(`Missing environment variable: ${envVar}`);
  }
  return Keypair.fromSecret(secret);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
