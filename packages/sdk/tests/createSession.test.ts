import { describe, it, expect } from 'vitest';
import { toStroops, fromStroops, networkPassphrase } from '../src/utils';
import { Networks } from '@stellar/stellar-sdk';

describe('utils', () => {
  describe('toStroops', () => {
    it('converts whole numbers', () => {
      expect(toStroops('1')).toBe(10_000_000n);
    });

    it('converts decimals', () => {
      expect(toStroops('1.5')).toBe(15_000_000n);
    });

    it('converts small fractions', () => {
      expect(toStroops('0.0000001')).toBe(1n);
    });

    it('handles zero', () => {
      expect(toStroops('0')).toBe(0n);
    });
  });

  describe('fromStroops', () => {
    it('converts whole numbers', () => {
      expect(fromStroops(10_000_000n)).toBe('1.0000000');
    });

    it('converts decimals', () => {
      expect(fromStroops(15_000_000n)).toBe('1.5000000');
    });

    it('converts small fractions', () => {
      expect(fromStroops(1n)).toBe('0.0000001');
    });

    it('handles zero', () => {
      expect(fromStroops(0n)).toBe('0.0000000');
    });
  });

  describe('networkPassphrase', () => {
    it('returns testnet passphrase', () => {
      expect(networkPassphrase('testnet')).toBe(Networks.TESTNET);
    });

    it('returns mainnet passphrase', () => {
      expect(networkPassphrase('mainnet')).toBe(Networks.PUBLIC);
    });
  });
});