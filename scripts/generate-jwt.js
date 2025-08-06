#!/usr/bin/env node

const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

// Load environment variables
dotenv.config();

class JWTGenerator {
  validateEnvironment() {
    if (!process.env.JWT_SECRET) {
      console.error('❌ Error: JWT_SECRET environment variable is not set');
      console.log('Please set JWT_SECRET in your .env file or as an environment variable');
      process.exit(1);
    }
  }

  validateInput(options) {
    const errors = [];

    if (!options.id || isNaN(options.id) || options.id <= 0) {
      errors.push('Valid user ID (positive number) is required');
    }

    if (!options.username || options.username.trim().length === 0) {
      errors.push('Username is required');
    }

    if (!options.type || !['user', 'admin'].includes(options.type)) {
      errors.push('Type must be either "user" or "admin"');
    }

    if (errors.length > 0) {
      console.error('❌ Validation errors:');
      errors.forEach(error => console.error(`  - ${error}`));
      process.exit(1);
    }

    return options;
  }

  generateToken(options) {
    this.validateEnvironment();
    const validatedOptions = this.validateInput(options);

    // Set custom expiration if provided
    if (validatedOptions.expiresIn) {
      process.env.JWT_EXPIRES_IN = validatedOptions.expiresIn;
    }

    const payload = {
      id: validatedOptions.id,
      username: validatedOptions.username,
      type: validatedOptions.type
    };

    try {
      const secret = process.env.JWT_SECRET;
      const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
      
      const token = jwt.sign(payload, secret, { expiresIn });
      return token;
    } catch (error) {
      console.error('❌ Error generating token:', error);
      process.exit(1);
    }
  }

  displayTokenInfo(token, payload, expiresIn) {
    console.log('\n🎉 JWT Token Generated Successfully!');
    console.log('═'.repeat(50));
    console.log(`👤 User ID: ${payload.id}`);
    console.log(`🏷️  Username: ${payload.username}`);
    console.log(`🔑 Type: ${payload.type}`);
    console.log(`⏰ Expires In: ${expiresIn || process.env.JWT_EXPIRES_IN || '7d'}`);
    console.log('═'.repeat(50));
    console.log('🔗 Token:');
    console.log(token);
    console.log('═'.repeat(50));
    console.log('\n💡 Usage:');
    console.log('Add this token to your Authorization header:');
    console.log(`Authorization: Bearer ${token}`);
    console.log('\n📋 Copy to clipboard (Linux):');
    console.log(`echo "${token}" | xclip -selection clipboard`);
    console.log('\n📋 Copy to clipboard (macOS):');
    console.log(`echo "${token}" | pbcopy`);
  }
}

// CLI Interface
function showHelp() {
  console.log(`
🔐 JWT Token Generator for Charity App

Usage:
  node scripts/generate-jwt.js --id <user_id> --username <username> --type <user|admin> [options]
  npm run generate-jwt -- --id <user_id> --username <username> --type <user|admin> [options]

Options:
  --id <number>        User ID (required)
  --username <string>  Username (required)
  --type <string>      User type: "user" or "admin" (required)
  --expires <string>   Token expiration (optional, e.g., "1h", "7d", "30m")
  --help              Show this help message

Examples:
  # Generate token for a regular user
  node scripts/generate-jwt.js --id 1 --username "john_doe" --type "user"
  
  # Generate token for an admin with custom expiration
  npm run generate-jwt -- --id 2 --username "admin" --type "admin" --expires "1h"
  
  # Generate token with 30 minute expiration
  node scripts/generate-jwt.js --id 3 --username "test_user" --type "user" --expires "30m"

Environment Variables:
  JWT_SECRET          Secret key for signing tokens (required)
  JWT_EXPIRES_IN      Default token expiration (optional, default: "7d")
`);
}

function parseArgs() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    return null;
  }

  const options = {};

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--id':
        options.id = parseInt(args[++i]);
        break;
      case '--username':
        options.username = args[++i];
        break;
      case '--type':
        options.type = args[++i];
        break;
      case '--expires':
        options.expiresIn = args[++i];
        break;
      default:
        if (args[i].startsWith('--')) {
          console.error(`❌ Unknown option: ${args[i]}`);
          console.log('Use --help for usage information');
          process.exit(1);
        }
        break;
    }
  }

  return options;
}

// Main execution
function main() {
  console.log('🚀 Starting JWT Token Generator...\n');

  const options = parseArgs();
  if (!options) {
    return; // Help was shown
  }

  const generator = new JWTGenerator();
  const token = generator.generateToken(options);
  
  generator.displayTokenInfo(token, {
    id: options.id,
    username: options.username,
    type: options.type
  }, options.expiresIn);
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { JWTGenerator };