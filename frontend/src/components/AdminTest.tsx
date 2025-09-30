// Simple test to check if wallet connection and admin check work
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getProgramId } from '../lib/config';

export const AdminTest = () => {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();

  const testAdminStatus = async () => {
    if (!publicKey || !connected) {
      console.log("❌ Wallet not connected");
      return;
    }

    console.log("🔍 Testing admin status...");
    console.log("Connected wallet:", publicKey.toString());
    
    try {
      const [platformConfigPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("platform_config")],
        getProgramId()
      );

      console.log("Platform Config PDA:", platformConfigPDA.toString());
      
      const platformData = await connection.getAccountInfo(platformConfigPDA);
      if (platformData) {
        const adminPubkey = new PublicKey(platformData.data.slice(8, 40));
        console.log("Platform admin:", adminPubkey.toString());
        console.log("Are you admin?", adminPubkey.equals(publicKey));
        
        if (adminPubkey.equals(publicKey)) {
          console.log("✅ You have admin access!");
        } else {
          console.log("❌ You are not the admin");
        }
      } else {
        console.log("❌ Platform not initialized");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="p-4 bg-gray-800 rounded">
      <h3 className="text-white mb-4">Admin Status Test</h3>
      <p className="text-gray-300 mb-2">Wallet: {publicKey?.toString() || 'Not connected'}</p>
      <p className="text-gray-300 mb-4">Connected: {connected ? 'Yes' : 'No'}</p>
      <button 
        onClick={testAdminStatus}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        disabled={!connected}
      >
        Test Admin Status
      </button>
    </div>
  );
};

export default AdminTest;