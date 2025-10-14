# Environment Configuration

This project has two frontends and Solana program scripts. Configure environment variables per environment (devnet/testnet/mainnet-beta/localnet).

Place a .env file in each app directory:
- frontend/.env
- gado/frontend/.env

Optionally, export shell vars for scripts (e.g., CLUSTER).

## Required keys (frontends)

- VITE_CLUSTER
  - Allowed: devnet | testnet | mainnet-beta | localnet
  - Controls RPC default and explorer links
  - Example (devnet):
    VITE_CLUSTER=devnet
  - Example (testnet):
    VITE_CLUSTER=testnet
  - Example (mainnet):
    VITE_CLUSTER=mainnet-beta
  - Example (localnet):
    VITE_CLUSTER=localnet

- VITE_PROGRAM_ID
  - The deployed Solana program ID for the selected cluster
  - Example (devnet):
    VITE_PROGRAM_ID=EciS2vNDTe5S6WnNWEBmdBmKjQL5bsXyfauYmxPFKQGu
  - Replace with the actual program id you deploy per cluster

- VITE_RPC_URL (optional)
  - Custom RPC endpoint. If unset, defaults to clusterApiUrl(VITE_CLUSTER) or http://127.0.0.1:8899 for localnet
  - Examples:
    # Devnet RPC
    # VITE_RPC_URL=https://api.devnet.solana.com
    # Helius (example)
    # VITE_RPC_URL=https://rpc.helius.xyz/?api-key=YOUR_KEY

## Optional keys (scripts)

- CLUSTER
  - Used by verify-deployment.sh
  - Allowed: devnet | testnet | mainnet-beta (localnet not needed for this script)
  - Examples:
    # bash
    export CLUSTER=devnet
    ./verify-deployment.sh

## Recommended per-environment files

- frontend/.env.devnet
  VITE_CLUSTER=devnet
  VITE_PROGRAM_ID=REPLACE_WITH_YOUR_DEVNET_PROGRAM_ID
  # VITE_RPC_URL=https://api.devnet.solana.com

- frontend/.env.testnet
  VITE_CLUSTER=testnet
  VITE_PROGRAM_ID=REPLACE_WITH_YOUR_TESTNET_PROGRAM_ID
  # VITE_RPC_URL=https://api.testnet.solana.com

- frontend/.env.mainnet
  VITE_CLUSTER=mainnet-beta
  VITE_PROGRAM_ID=REPLACE_WITH_YOUR_MAINNET_PROGRAM_ID
  # VITE_RPC_URL=https://api.mainnet-beta.solana.com

- frontend/.env.localnet
  VITE_CLUSTER=localnet
  VITE_PROGRAM_ID=11111111111111111111111111111111
  VITE_RPC_URL=http://127.0.0.1:8899

Repeat the same for `gado/frontend/.env.*`.

## Notes
- After deploying your program on each cluster, update VITE_PROGRAM_ID accordingly in both frontends.
- CSP headers are already configured to allow devnet/testnet/mainnet and associated wss endpoints.
- If you use a custom RPC, ensure it is reachable from the browser.