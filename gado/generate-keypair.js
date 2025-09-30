const { Keypair } = require('@solana/web3.js');
const fs = require('fs');

// Generate a new keypair
const keypair = Keypair.generate();

// Convert to the format expected by Solana CLI (array of bytes)
const secretKeyArray = Array.from(keypair.secretKey);

// Write to the expected location
fs.writeFileSync('/home/dextonicx/.config/solana/id.json', JSON.stringify(secretKeyArray));

console.log('Generated keypair with public key:', keypair.publicKey.toString());
console.log('Keypair saved to /home/dextonicx/.config/solana/id.json');