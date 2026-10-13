import { describe, it, expect } from 'vitest';
import { networkPassphrase, rpcUrl } from '../src/utils';
import { Networks } from '@stellar/stellar-sdk';

describe('facilitator utils', () => {
  it('returns testnet passphrase', () => {
    expect(networkPassphrase('testnet')).toBe(Networks.TESTNET);
  });

  it('returns mainnet passphrase', () => {
    expect(networkPassphrase('mainnet')).toBe(Networks.PUBLIC);
  });

  it('returns testnet RPC URL', () => {
    expect(rpcUrl('testnet')).toContain('testnet');
  });
});