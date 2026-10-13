export type Network = 'testnet' | 'mainnet';

export interface SessionConfig {
  asset: string;
  spender: string;
  cap: bigint;
  expiryLedger: number;
  network: Network;
  facilitatorUrl?: string;
}

export interface SessionHandle {
  sessionId: string;
  config: SessionConfig;
  approveTxHash: string;
  fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
  close: () => Promise<void>;
}

export interface PaymentReceipt {
  txHash: string;
  amount: string;
  ledger: number;
  timestamp: number;
}

export interface FacilitatorSessionResponse {
  sessionId: string;
  approveTxHash: string;
}

export interface FacilitatorSettleResponse {
  receipt: PaymentReceipt;
  remainingAllowance: string;
}

export interface FacilitatorSessionInfo {
  sessionId: string;
  asset: string;
  spender: string;
  owner: string;
  cap: string;
  spent: string;
  remaining: string;
  expiryLedger: number;
  active: boolean;
}
