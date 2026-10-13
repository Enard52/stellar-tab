import { Networks } from '@stellar/stellar-sdk';

export function networkPassphrase(network: 'testnet' | 'mainnet'): string {
  return network === 'testnet' ? Networks.TESTNET : Networks.PUBLIC;
}

export function rpcUrl(network: 'testnet' | 'mainnet'): string {
  return network === 'testnet'
    ? 'https://soroban-testnet.stellar.org'
    : 'https://soroban-mainnet.stellar.org';
}
