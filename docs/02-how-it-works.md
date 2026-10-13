# How It Works

## The SAC Approve → Allowance → Transfer_From Flow

Stellar Asset Contracts (SACs) implement a token interface with `approve`, `allowance`, and `transfer_from` methods. Tab uses these primitives to enable session-based payments.

### 1. Approve

The owner calls `approve(from, spender, amount, expiration_ledger)` on the SAC. This grants the spender (the facilitator) permission to transfer up to `amount` tokens from `from` until `expiration_ledger`.

### 2. Allowance

At any time, anyone can query `allowance(from, spender)` to see how much the spender is still allowed to transfer.

### 3. Transfer_From

The spender calls `transfer_from(spender, from, to, amount)`. The SAC checks that the allowance is sufficient, decreases it by `amount`, and transfers the tokens from `from` to `to`.

**Why the facilitator can't overspend:** the SAC enforces the cap and expiry. Even if the facilitator's server is compromised, it cannot transfer more than the approved amount or after the expiry ledger. This is on-chain enforcement, not server-side policy.

## Live Testnet Proof

The following transactions were executed on Stellar testnet on 2026-10-13.

**Approve** — the agent signed one SAC `approve` transaction granting the facilitator an allowance:

https://stellar.expert/explorer/testnet/tx/c5c0eea53e3df9269fe3732e6472698f8e9da07e6a720c1a6642ae9ebe0abbc5

**Ten settlements** — the facilitator then executed ten `transfer_from` calls, one per API request, each moving 100,000 stroops:

| # | Transaction |
|---|---|
| 1  | https://stellar.expert/explorer/testnet/tx/c3468cd46076c7e9e5f1ed476d30e889db9ef061da0bd40bdba07fe9fad52f6f |
| 2  | https://stellar.expert/explorer/testnet/tx/249fc01cf0bf4de2a304a4b417c11d8f1b7617a08c40796058d72bf80d854e33 |
| 3  | https://stellar.expert/explorer/testnet/tx/4aa9e41408a562db9ff8fcb72f6881ebbe848e9c8cb0eb3b4e2f2529bb19883b |
| 4  | https://stellar.expert/explorer/testnet/tx/23a3385e943869e37a9874c80e165bf41e2c9ac2bde2e1ff64bf1950a03c1970 |
| 5  | https://stellar.expert/explorer/testnet/tx/f287fd0985b0c6ae718301e26e3c492a8779ba155752ea6eea9cc469cfc57c8c |
| 6  | https://stellar.expert/explorer/testnet/tx/7e1367aef677eba6e090bffa1414a7cc38eb11a4279913dc2cb5853dac516540 |
| 7  | https://stellar.expert/explorer/testnet/tx/0da7a7abb1b651cfccf6c27fc6b50f3a33233ff744b5b9cdc0035bcaab71bc8c |
| 8  | https://stellar.expert/explorer/testnet/tx/be486302685014e3daa0b783f629ce245005e971bcf8e2b9519bd18060dd2222 |
| 9  | https://stellar.expert/explorer/testnet/tx/d7dd5311ac252defa1ee93aeafc5c3848401c67fd86eb6bf045c07183113fafc |
| 10 | https://stellar.expert/explorer/testnet/tx/deaa8471c75f5f29ecfc949404d7c04abe6dcc623409a6ac5662acb552a78903 |

**Total settled:** 1,000,000 stroops (0.1 XLM) across 10 API calls, using one user signature.

## Why Caps and Expiry Are On-Chain

A centralized server could enforce limits, but a compromised server would bypass them. By using the SAC's native allowance mechanism, the limits are enforced by the Stellar protocol itself. The facilitator is just a convenience layer — it never holds the user's funds.

## Tab vs. One-Off Payments

|  | One-off payments | Tab |
|---|---|---|
| Signatures per payment | 1 | 1 for N payments |
| Wallet popups | N | 1 |
| Gas cost | N × base fee | 1 × base fee + N × transfer_from |
| UX | Friction-heavy | Seamless |

Tab is not free — each `transfer_from` is still a transaction. But it eliminates the wallet interaction friction, which is the dominant cost for micro-payments.
