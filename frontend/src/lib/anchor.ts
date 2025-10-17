import * as anchor from '@coral-xyz/anchor';
import { web3 } from '@coral-xyz/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useMemo } from 'react';
import idlData from './gado.json';
import { getProgramId } from './config';

const IDL = idlData as anchor.Idl;

export function useAnchorProgram() {
  const { connection } = useConnection();
  const wallet = useWallet();

  return useMemo(() => {
    if (!wallet?.publicKey) {
      // Return a minimal program interface when no wallet is connected
      return {
        account: {},
        methods: {},
        programId: getProgramId()
      };
    }

    const provider = new anchor.AnchorProvider(
      connection,
      wallet as unknown as anchor.Wallet,
      {
        commitment: 'confirmed',
        preflightCommitment: 'confirmed',
        skipPreflight: false,
      }
    );

    // Use the IDL as-is since it should have the correct program ID
    const program = new anchor.Program(IDL, provider);
    return program;
  }, [connection, wallet?.publicKey]);
}

export function createBN(value: number): anchor.BN {
  return new anchor.BN(value);
}

// Smart Wallet functions will be added here when the smart wallet program is deployed
// Real Anchor program integration for Smart Wallet operations
