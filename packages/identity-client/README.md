# @onlinemenu/identity-client

Embedded authentication client for OnlineMenu applications. Provides seamless integration with the OnlineMenu Identity API.

## Installation

```bash
npm install @onlinemenu/identity-client
# or
yarn add @onlinemenu/identity-client
# or
pnpm add @onlinemenu/identity-client
```

## Usage

### Initialize the Client

```typescript
import { IdentityClient } from '@onlinemenu/identity-client';

const identityClient = new IdentityClient({
  baseUrl: 'https://your-api.com', // Your OnlineMenu API base URL
  timeout: 30000, // Optional, defaults to 30000ms
});
```

### Login with Username and Password

```typescript
const result = await identityClient.loginWithPassword(
  'username',
  'password',
  'tenant-id' // Optional
);

if (result.accessToken) {
  console.log('Login successful!');
  console.log('Access Token:', result.accessToken);
  console.log('User Info:', result.userInfo);
} else {
  console.error('Login failed:', result.errorMessage);
}
```

### OTP Authentication

#### Send OTP to Phone

```typescript
const otpResult = await identityClient.sendPhoneOtp(
  '+1234567890',
  'tenant-id' // Optional
);

if (otpResult.success) {
  if (otpResult.smsSent) {
    console.log('OTP sent via SMS');
  } else {
    // SMS verification disabled for this tenant (development mode)
    console.log('OTP Code:', otpResult.code);
  }
  console.log('Code expires in:', otpResult.expiresIn, 'seconds');
}
```

#### Verify OTP and Login

```typescript
const loginResult = await identityClient.loginWithPhoneOtp(
  '+1234567890',
  '123456', // OTP code
  'tenant-id' // Optional
);

if (loginResult.accessToken) {
  console.log('Login successful!');
}
```

### Refresh Token

```typescript
const refreshResult = await identityClient.refreshToken(refreshToken);

if (refreshResult.accessToken) {
  console.log('Token refreshed successfully');
}
```

### Logout

```typescript
const logoutResult = await identityClient.logout(accessToken);

if (logoutResult.success) {
  console.log('Logout successful');
}
```

### Get Available Authentication Methods

```typescript
const methods = await identityClient.getAuthMethods('tenant-id');

console.log('Primary method:', methods.primaryMethod);
console.log('Allowed methods:', methods.allowedMethods);
console.log('OTP code length:', methods.otpCodeLength);
console.log('SMS verification required:', methods.requireSmsVerification);
```

## API Reference

### `IdentityClient`

#### Constructor

```typescript
new IdentityClient(config: IdentityClientConfig)
```

#### Methods

- `loginWithPassword(username: string, password: string, tenantId?: string): Promise<LoginResponse>`
- `loginWithPhoneOtp(phoneNumber: string, otpCode: string, tenantId?: string): Promise<LoginResponse>`
- `loginWithEmailOtp(email: string, otpCode: string, tenantId?: string): Promise<LoginResponse>`
- `sendPhoneOtp(phoneNumber: string, tenantId?: string): Promise<SendOtpResponse>`
- `sendEmailOtp(email: string, tenantId?: string): Promise<SendOtpResponse>`
- `verifyOtp(identifier: string, code: string, tenantId?: string): Promise<VerifyOtpResponse>`
- `refreshToken(refreshToken: string): Promise<RefreshResponse>`
- `logout(accessToken: string): Promise<LogoutResponse>`
- `getAuthMethods(tenantId?: string, tenantSlug?: string): Promise<GetAuthMethodsResponse>`

## Types

### `AuthMethod`

```typescript
enum AuthMethod {
  UsernamePassword = 0,
  PhoneOtp = 1,
  EmailOtp = 2,
  Social = 3
}
```

### `LoginResponse`

```typescript
interface LoginResponse {
  accessToken: string | null;
  refreshToken: string | null;
  tokenType: string | null;
  expiresIn: number;
  userInfo: UserInfo | null;
  errorMessage?: string;
  errorCode?: string;
}
```

### `UserInfo`

```typescript
interface UserInfo {
  sub: string;
  email?: string;
  emailVerified?: boolean;
  name?: string;
  givenName?: string;
  familyName?: string;
  phoneNumber?: string;
  phoneNumberVerified?: boolean;
}
```

## SMS Verification Feature Flag

The `requireSmsVerification` flag (tenant-configurable) controls OTP delivery:

- **`true` (Production)**: OTP codes are sent via Twilio SMS
- **`false` (Testing/Development)**: OTP codes are returned in the API response without sending SMS

This allows you to test OTP flows without consuming SMS credits or requiring real phone numbers.

## Development

### Project Structure

```
packages/identity-client/
├── src/
│   ├── index.ts           # Main exports
│   ├── IdentityClient.ts  # Client implementation
│   └── types.ts           # TypeScript types
├── dist/                  # Compiled output
├── package.json
├── tsconfig.json
└── README.md
```

### Local Development Setup

1. **Install dependencies**
   ```bash
   cd packages/identity-client
   npm install
   ```

2. **Build the package**
   ```bash
   npm run build
   ```

3. **Watch mode** (rebuilds on file changes)
   ```bash
   npm run watch
   ```

### Debugging

#### Debug in BaseClient App

The package is linked locally via `file:./packages/identity-client` in the root `package.json`. Changes to the source are reflected after rebuild.

1. Make changes to files in `src/`
2. Rebuild: `npm run build`
3. The BaseClient app will use the updated code (may need to restart Metro bundler)

#### Debug with Console Logging

Add debug logging to `IdentityClient.ts`:

```typescript
// Add at the top of any method
console.log('[IdentityClient] methodName called with:', { param1, param2 });
```

#### Debug Network Requests

Use React Native Debugger or Flipper to inspect network requests made by the client.

#### VS Code Debugging

1. Add breakpoints in `src/` files
2. Use VS Code's debugger with the following launch configuration:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Identity Client",
  "program": "${workspaceFolder}/packages/identity-client/dist/index.js",
  "preLaunchTask": "npm: build - packages/identity-client",
  "outFiles": ["${workspaceFolder}/packages/identity-client/dist/**/*.js"]
}
```

### Testing

```bash
# Run from BaseClient root
cd packages/identity-client
npm test  # (if tests are configured)
```

### Publishing

#### Prerequisites

1. Ensure you have npm credentials configured
2. Update version in `package.json`
3. Build the package

#### Steps to Publish

```bash
# 1. Navigate to the package
cd packages/identity-client

# 2. Build the package
npm run build

# 3. Verify the package contents
npm pack --dry-run

# 4. Bump version (choose patch, minor, or major)
npm version patch  # or minor, or major

# 5. Publish to npm registry
npm publish --access public

# 6. Push version tag to git
git push && git push --tags
```

#### Publishing a Beta/Pre-release

```bash
# Bump to beta version
npm version prerelease --preid=beta

# Publish with beta tag
npm publish --access public --tag beta
```

#### Verify Published Package

```bash
npm info @onlinemenu/identity-client
```

### Changelog

When publishing a new version, document changes:

1. Update version in `package.json`
2. Add entry to CHANGELOG.md (if exists)
3. Update README if API changes

## License

MIT
