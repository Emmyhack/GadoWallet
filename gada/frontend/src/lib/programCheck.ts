import { Connection } from '@solana/web3.js';
import { getProgramId } from './shared-config';

const PROGRAM_ID = getProgramId();

export async function checkProgramDeployment(connection: Connection): Promise<boolean> {
  try {
    const programInfo = await connection.getAccountInfo(PROGRAM_ID);
    return programInfo !== null && programInfo.executable;
  } catch (error) {
    console.error('Error checking program deployment:', error);
    return false;
  }
}

export function currentProgramId() {
  return PROGRAM_ID;
}

export async function waitForProgramDeployment(connection: Connection, maxAttempts: number = 10): Promise<boolean> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`Checking program deployment (attempt ${attempt}/${maxAttempts})...`);
    
    const isDeployed = await checkProgramDeployment(connection);
    if (isDeployed) {
      console.log('✅ Program is deployed and ready!');
      return true;
    }
    
    if (attempt < maxAttempts) {
      console.log('⏳ Program not found, waiting 2 seconds...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.error('❌ Program not found after all attempts. Please deploy the program first.');
  return false;
}