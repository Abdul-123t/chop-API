import { generatePassword, hashPassword } from '../src/lib/security/password.ts';

const [emailArg, passwordArg] = process.argv.slice(2);
const email = emailArg?.trim().toLowerCase();

if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error('Usage: pnpm seed:admin <email> [password]');
  process.exit(1);
}

if (passwordArg !== undefined && passwordArg.length < 12) {
  console.error('Password must be at least 12 characters.');
  process.exit(1);
}

const password = passwordArg ?? generatePassword();

console.log('Admin login');
console.log(`  Email:    ${email}`);
console.log(`  Password: ${password}`);
console.log('');
console.log('Add to the backend environment:');
console.log(`ADMIN_EMAIL=${email}`);
console.log(`ADMIN_PASSWORD_HASH=${hashPassword(password)}`);
