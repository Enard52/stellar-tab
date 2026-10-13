import {
  Contract,
  Keypair,
  TransactionBuilder,
  BASE_FEE,
  nativeToScVal,
  Address,
} from '@stellar/stellar-sdk';
import { Server } from '@stellar/stellar-sdk/rpc';
import { SessionConfig, FacilitatorSessionResponse } from './types';
import { SessionHandle } from './SessionHandle';
import { networkPassphrase, rpcUrl } from './utils';

export async function createSession(
  config: SessionConfig,
  keypair: Keypair,
): Promise<SessionHandle> {
  const passphrase = networkPassphrase(config.network);
  const server = new Server(rpcUrl(config.network));
  const sourceAccount = await server.getAccount(keypair.publicKey());

  const contract = new Contract(config.asset);
  const approveOp = contract.call(
    'approve',
    nativeToScVal(Address.fromString(keypair.publicKey()), { type: 'address' }),
    nativeToScVal(Address.fromString(config.spender), { type: 'address' }),
    nativeToScVal(config.cap, { type: 'i128' }),
    nativeToScVal(config.expiryLedger, { type: 'u32' }),
  );

  const tx = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: passphrase,
  })
    .addOperation(approveOp)
    .setTimeout(30)
    .build();

  const preparedTx = await server.prepareTransaction(tx);
  preparedTx.sign(keypair);
  const sendResponse = await server.sendTransaction(preparedTx);

  if (
    sendResponse.status !== 'PENDING' &&
    sendResponse.status !== 'DUPLICATE'
  ) {
    throw new Error(`Approve failed: ${JSON.stringify(sendResponse)}`);
  }

  const approveTxHash = sendResponse.hash;
  console.log(`[tab] Approve tx submitted: ${approveTxHash}`);

  const facilitatorUrl = config.facilitatorUrl ?? 'http://localhost:3001';

  const registerRes = await fetch(`${facilitatorUrl}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      asset: config.asset,
      owner: keypair.publicKey(),
      spender: config.spender,
      cap: config.cap.toString(),
      expiryLedger: config.expiryLedger,
      network: config.network,
      approveTxHash,
    }),
  });

  if (!registerRes.ok) {
    const err = await registerRes.text();
    throw new Error(`Facilitator registration failed: ${err}`);
  }

  const sessionData = (await registerRes.json()) as FacilitatorSessionResponse;

  return new SessionHandle(
    sessionData.sessionId,
    config,
    approveTxHash,
    facilitatorUrl,
  );
}
