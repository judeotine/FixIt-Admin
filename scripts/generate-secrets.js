
//node scripts/generate-secrets.js

const crypto = require('crypto');

const secrets = [
  { key: 'NEXTAUTH_SECRET', length: 64 },
  { key: 'ENCRYPTION_KEY', length: 32 },
  { key: 'SESSION_SECRET', length: 64 },
];

const toHex = (length) =>
  crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);

console.log('Add the following lines to your .env file:\n');
secrets.forEach(({ key, length }) => {
  console.log(`${key}=${toHex(length)}`);
});
console.log('\nDone ');

