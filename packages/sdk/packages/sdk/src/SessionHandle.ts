import { SessionConfig, FacilitatorSettleResponse } from './types';

export class SessionHandle {
  private readonly sessionId: string;
  private readonly config: SessionConfig;
  private readonly approveTxHash: string;
  private readonly facilitatorUrl: string;
  private active = true;

  constructor(
    sessionId: string,
    config: SessionConfig,
    approveTxHash: string,
    facilitatorUrl: string,
  ) {
    this.sessionId = sessionId;
    this.config = config;
    this.approveTxHash = approveTxHash;
    this.facilitatorUrl = facilitatorUrl;
  }

  async fetch(
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> {
    if (!this.active) {
      throw new Error('Session is closed');
    }

    let response = await fetch(input, init);

    if (response.status !== 402) {
      return response;
    }

    const body: any = await response.json().catch(() => ({}));
    const amountStroops: bigint = body.amount
      ? BigInt(body.amount)
      : 100_000n;

    const settleRes = await fetch(`${this.facilitatorUrl}/settle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: this.sessionId,
        amount: amountStroops.toString(),
      }),
    });

    if (!settleRes.ok) {
      const err = await settleRes.text();
      throw new Error(`Facilitator settlement failed: ${err}`);
    }

    const settleData =
      (await settleRes.json()) as FacilitatorSettleResponse;
    console.log(
      `[facilitator] Settled ${settleData.receipt.amount} stroops. Tx: ${settleData.receipt.txHash}`,
    );

    response = await fetch(input, init);

    if (response.status === 402) {
      throw new Error('Payment settled but request still returned 402');
    }

    return response;
  }

  async close(): Promise<void> {
    if (!this.active) return;
    this.active = false;
    try {
      await fetch(`${this.facilitatorUrl}/sessions/${this.sessionId}`, {
        method: 'DELETE',
      });
    } catch {
      // best-effort
    }
  }

  get id(): string {
    return this.sessionId;
  }

  get txHash(): string {
    return this.approveTxHash;
  }

  get sessionConfig(): SessionConfig {
    return this.config;
  }
}