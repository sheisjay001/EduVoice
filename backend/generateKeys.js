const forge = require('node-forge');
const rsa = forge.pki.rsa;

const keypair = rsa.generateKeyPair({ bits: 2048, e: 0x10001 });
const publicKey = forge.pki.publicKeyToPem(keypair.publicKey);
const privateKey = forge.pki.privateKeyToPem(keypair.privateKey);

console.log("PUBLIC KEY:\n", publicKey);
console.log("PRIVATE KEY (SAVE THIS OFFLINE):\n", privateKey);
