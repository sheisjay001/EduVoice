const forge = require('node-forge');
const fs = require('fs');
const path = require('path');

console.log("Generating RSA Key Pair...");

const keypair = forge.pki.rsa.generateKeyPair({ bits: 2048, e: 0x10001 });
const publicKey = forge.pki.publicKeyToPem(keypair.publicKey);
const privateKey = forge.pki.privateKeyToPem(keypair.privateKey);

// Define paths
const privateKeyPath = path.join(__dirname, 'private_key.pem');
const publicKeyPath = path.join(__dirname, 'public_key.pem');

// Save Private Key (This is what needs to be hidden)
fs.writeFileSync(privateKeyPath, privateKey);
console.log(`✅ Private Key saved to: ${privateKeyPath}`);
console.log(`🔒 Ensure this file is in .gitignore!`);

// Save Public Key (Optional, but good for reference)
fs.writeFileSync(publicKeyPath, publicKey);
console.log(`✅ Public Key saved to: ${publicKeyPath}`);

// Print Public Key for Frontend
console.log("\n📋 COPY THIS PUBLIC KEY TO frontend/src/constants/keys.js:");
console.log("---------------------------------------------------");
console.log(publicKey);
console.log("---------------------------------------------------");
