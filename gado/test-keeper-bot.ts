import { runKeeperBot } from "./keeper-bot";

/**
 * Test script for the Inheritance Keeper Bot
 * 
 * This script demonstrates how to use the keeper bot to monitor Smart Wallets
 * and execute inheritance when owners become inactive.
 */
async function testKeeperBot() {
  console.log("🧪 Starting Keeper Bot Test...\n");

  try {
    // Run the keeper bot
    await runKeeperBot();
    
    console.log("\n✅ Keeper bot test completed successfully!");
    
  } catch (error) {
    console.error("\n❌ Keeper bot test failed:", error);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testKeeperBot().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}

export { testKeeperBot };