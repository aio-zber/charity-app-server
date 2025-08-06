# Scripts Directory

This directory contains utility scripts for the Charity App Server.

## JWT Token Generator

### Files
- `generate-jwt.js` - Node.js version (no TypeScript required)
- `generate-jwt.ts` - TypeScript version (requires ts-node)

### Purpose
Generate JWT tokens for testing, development, or administrative purposes. These scripts use the same JWT utilities as the main application to ensure consistency.

### Prerequisites
1. Set up your environment variables:
   ```bash
   # In your .env file or environment
   JWT_SECRET="your-super-secret-jwt-key"
   JWT_EXPIRES_IN="7d"  # Optional, defaults to 7d
   ```

### Usage

#### Using npm scripts (recommended):
```bash
# Generate token using JavaScript version
npm run generate-jwt -- --id 1 --username "john_doe" --type "user"

# Generate token using TypeScript version
npm run generate-jwt-ts -- --id 2 --username "admin" --type "admin" --expires "1h"
```

#### Direct execution:
```bash
# JavaScript version
node scripts/generate-jwt.js --id 1 --username "john_doe" --type "user"

# TypeScript version (requires ts-node)
npx ts-node scripts/generate-jwt.ts --id 2 --username "admin" --type "admin"
```

### Options
- `--id <number>` - User ID (required, must be positive number)
- `--username <string>` - Username (required)
- `--type <string>` - User type: "user" or "admin" (required)
- `--expires <string>` - Token expiration (optional, e.g., "1h", "7d", "30m")
- `--help` - Show help message

### Examples

```bash
# Generate a user token with default expiration (7 days)
npm run generate-jwt -- --id 1 --username "john_doe" --type "user"

# Generate an admin token with 1 hour expiration
npm run generate-jwt -- --id 2 --username "admin" --type "admin" --expires "1h"

# Generate a token with 30 minutes expiration
npm run generate-jwt -- --id 3 --username "test_user" --type "user" --expires "30m"

# Show help
npm run generate-jwt -- --help
```

### Output
The script will generate a JWT token and display:
- User information (ID, username, type)
- Token expiration time
- The JWT token itself
- Usage instructions for API calls
- Copy-to-clipboard commands for different operating systems

### Security Notes
- Never commit JWT_SECRET to version control
- Use strong, randomly generated secrets in production
- Tokens generated with this script are real and can be used to authenticate with your API
- Be careful not to expose tokens in logs or screenshots