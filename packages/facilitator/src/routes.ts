import { Router, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import {
  getSession,
  setSession,
  deleteSession,
  canSettle,
  SessionRecord,
} from './verifySession';
import { settlePayment } from './settle';

export const router = Router();

router.post('/sessions', (req: Request, res: Response) => {
  const { asset, owner, spender, cap, expiryLedger, network, approveTxHash } =
    req.body;

  if (
    !asset ||
    !owner ||
    !spender ||
    cap === undefined ||
    !expiryLedger ||
    !network
  ) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const session: SessionRecord = {
    sessionId: randomUUID(),
    asset,
    owner,
    spender,
    cap: BigInt(cap),
    spent: 0n,
    expiryLedger: Number(expiryLedger),
    network,
    approveTxHash: approveTxHash ?? '',
    active: true,
  };

  setSession(session);
  return res
    .status(201)
    .json({ sessionId: session.sessionId, approveTxHash: session.approveTxHash });
});

router.post('/settle', async (req: Request, res: Response) => {
  const { sessionId, amount, destination } = req.body;
  if (!sessionId || amount === undefined) {
    return res
      .status(400)
      .json({ error: 'Missing required fields: sessionId, amount' });
  }

  const session = getSession(sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const amountBigInt = BigInt(amount);
  const dest = destination ?? session.owner;

  const check = await canSettle(session, amountBigInt);
  if (!check.ok) return res.status(409).json({ error: check.reason });

  try {
    const receipt = await settlePayment(session, amountBigInt, dest);
    return res.json({
      receipt: {
        txHash: receipt.txHash,
        amount: receipt.amount,
        ledger: receipt.ledger,
        timestamp: receipt.timestamp,
      },
      remainingAllowance: (check.remaining - amountBigInt).toString(),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/sessions/:id', (req: Request, res: Response) => {
  const session = getSession(req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  return res.json({
    sessionId: session.sessionId,
    asset: session.asset,
    spender: session.spender,
    owner: session.owner,
    cap: session.cap.toString(),
    spent: session.spent.toString(),
    remaining: (session.cap - session.spent).toString(),
    expiryLedger: session.expiryLedger,
    active: session.active,
  });
});

router.delete('/sessions/:id', (req: Request, res: Response) => {
  const session = getSession(req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  deleteSession(req.params.id);
  return res.status(204).send();
});
