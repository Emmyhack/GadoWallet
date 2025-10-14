import { clusterApiUrl, PublicKey, Cluster } from '@solana/web3.js';

// Network can be 'devnet', 'testnet', 'mainnet-beta', or 'localnet'
export type ClusterName = 'devnet' | 'testnet' | 'mainnet-beta' | 'localnet';

export function getCluster(): ClusterName {
	const raw = import.meta.env?.VITE_CLUSTER;
	if (raw === 'testnet' || raw === 'mainnet-beta' || raw === 'localnet' || raw === 'devnet') {
		return raw;
	}
	return 'devnet';
}

export function getRpcUrl(): string {
	const custom = import.meta.env?.VITE_RPC_URL;
	if (custom && custom.trim().length > 0) return custom.trim();
	const cluster = getCluster();
	if (cluster === 'localnet') return 'http://127.0.0.1:8899';
	return clusterApiUrl(cluster as Cluster);
}

export function getProgramId(): PublicKey {
	const fromEnv = import.meta.env?.VITE_PROGRAM_ID;
	const candidate = fromEnv && fromEnv.trim().length > 0 ? fromEnv.trim() : 'EciS2vNDTe5S6WnNWEBmdBmKjQL5bsXyfauYmxPFKQGu';
	try {
		return new PublicKey(candidate);
	} catch (e) {
		console.error('Invalid VITE_PROGRAM_ID provided. Using System Program ID.');
		return new PublicKey('11111111111111111111111111111112');
	}
}

export function getNetworkLabel(): string {
	const c = getCluster();
	if (c === 'mainnet-beta') return 'Mainnet Beta';
	if (c === 'localnet') return 'Localnet';
	return c.charAt(0).toUpperCase() + c.slice(1);
}

export function getExplorerClusterParam(): string {
	const c = getCluster();
	if (c === 'mainnet-beta') return '';
	if (c === 'localnet') return 'custom';
	return c; // 'devnet' or 'testnet'
}