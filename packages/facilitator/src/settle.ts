import {
  Contract,
  TransactionBuilder,
  BASE_FEE,
  nativeToScVal,
  Address,
} from '@stellar/stellar-sdk';
import { Server } from '@stellar/stellar-sdk/rpc';
import { networkPassphrase, rpcUrl } from './utils';
import { SessionRecord, loadFacilitatorKeypair } from './verifySession';
import { PaymentReceipt } from './types';

export async function settlePayment(
  session: SessionRecord,
  amount: bigint,
  destination: string,
): Promise<PaymentReceipt> {
  const passphrase = networkPassphrase(session.network);
  const server = new Server(rpcUrl(session.network));
  const facilitator = loadFacilitatorKeypair();
  const contract = new Contract(session.asset);

  const call = contract.call(
    'transfer_from',
    nativeToScVal(Address.fromString(facilitator.publicKey()), {
      type: 'address',
    }),
    nativeToScVal(Address.fromString(session.owner), { type: 'address' }),
    nativeToScVal(Address.fromString(destination), { type: 'address' }),
    nativeToScVal(amount, { type: 'i128' }),
  );

  const sourceAccount = await server.getAccount(facilitator.publicKey());
  const tx = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: passphrase,
  })
    .addOperation(call)
    .setTimeout(30)
    .build();

  const preparedTx = await server.prepareTransaction(tx);
  preparedTx.sign(facilitator);

  const sendResponse = await server.sendTransaction(preparedTx);
  if (
    sendResponse.status !== 'PENDING' &&
    sendResponse.status !== 'DUPLICATE'
  ) {
    throw new Error(`transfer_from failed: ${JSON.stringify(sendResponse)}`);
  }

  let ledger = 0;
  for (let i = 0; i < 10; i++) {
    const result = await server.getTransaction(sendResponse.hash);
    if (result.status === 'SUCCESS') {
      ledger = result.ledger;
      break;
    }
    if (result.status === 'FAILED') {
      throw new Error(`Transaction failed: ${sendResponse.hash}`);
    }
    await new Promise((r) => setTimeout(r, 1000));
  }

  session.spent += amount;

  return {
    txHash: sendResponse.hash,
    amount: amount.toString(),
    ledger,
    timestamp: Math.floor(Date.now() / 1000),
  };
}
