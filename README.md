# stellar-tab

**Open a tab. Pay as you go. Settle on-chain.**

Tab is a session-based payment SDK for AI agents and pay-per-use APIs on Stellar.

## The Problem

AI agents, dapp games, and pay-per-inference APIs make many small payments in rapid succession. Today, each payment requires a separate wallet signature or popup — friction theatre that makes micro-payments unusable at scale.

## The Solution

Tab fixes this. The user signs **ONE** Stellar Asset Contract (SAC) `approve()` transaction that grants a spender an allowance with a cap and expiry. A facilitator service then settles N micropayments on-chain via `transfer_from`, all enforced by the SAC itself — not by a centralized server.

The mental model is a bar tab: open it once, run it up, settle at the end.

## Who It's For

- Developers building AI agents that pay per inference
- Pay-per-use API providers
- Dapp games with micro-transactions
- Any app where a user makes many small payments in a row

## Quick Start

```bash
git clone https://github.com/your-org/stellar-tab.git
cd stellar-tab
./scripts/setup.sh
