

[![test](https://github.com/stellar-steady-sdk/stellar-tab/actions/workflows/test.yml/badge.svg)](https://github.com/stellar-steady-sdk/stellar-tab/actions/workflows/test.yml)

## Proven on Testnet

Tab was validated end-to-end on Stellar testnet on 2026-10-13:

- **1** `approve()` transaction signed by the user
- **10** `transfer_from()` settlements executed by the facilitator
- **0** additional user signatures for the 10 payments

View the approve transaction:

https://stellar.expert/explorer/testnet/tx/c5c0eea53e3df9269fe3732e6472698f8e9da07e6a720c1a6642ae9ebe0abbc5

View the full settlement set in [docs/02-how-it-works.md](docs/02-how-it-works.md).

## Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| Node.js | 20+ | SDK and facilitator runtime |
| npm | 10+ | Package management |
| Stellar CLI | 22+ | Key management, contract interaction |
| Rust | 1.80+ | Only needed for Soroban contract work |

See [docs/01-setup.md](docs/01-setup.md) for install commands.
