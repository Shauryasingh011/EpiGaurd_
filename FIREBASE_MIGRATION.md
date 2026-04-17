# Firebase Migration Guide - EpiGuard_XD

## Overview
The EpiGuard_XD application has been successfully migrated from **NextAuth + Prisma + SQLite** to **Firebase Authentication + Firestore + Cloud Storage**.

## What Has Been Changed

### ✅ Dependencies (package.json)
- **Removed:**
  - `next-auth` and related packages
  - `@next-auth/prisma-adapter`
  - `@prisma/client`, `@prisma/adapter-libsql`
  - `prisma`, `libsql`, `@libsql/client`
  - `bcryptjs`

- **Added:**
  - `firebase` - Complete Firebase SDK

### ✅ Authentication System
**File: `lib/firebase/config.ts`**
- Firebase app initialization
- Auth, Firestore, and Storage instances exported

**File: `lib/firebase/auth.ts`**
- Email/password authentication
- Google OAuth login
- GitHub OAuth login
- Facebook OAuth login
- Session persistence
- Auth state subscription

**File: `lib/auth.ts`**
- High-level auth API
- User profile management
- Token handling

### ✅ Database Migration
**File: `lib/firebase/firestore.ts`**
- Firestore database operations
- Collections:
  - `users/` - User profiles
  - `userAlertSettings/` - Alert configurations
  - `telegramLinkCodes/` - Temporary Telegram linking codes

**File: `lib/prisma.ts`**
- Now exports Firestore utilities
- Maintains familiar API structure

### ✅ Storage System
**File: `lib/firebase/storage.ts`**
- Cloud Storage file management
- User avatar uploads
- File management utilities

### ✅ Client Components
**File: `components/auth-session-provider.tsx`**
- Firebase auth context provider
- `useAuth()` - Access auth state
- `useUser()` - Get current user
- `useIsAuthenticated()` - Check auth status

### ✅ Authentication Pages
**File: `app/sign-in/page.tsx`**
- Email/password login
- Google OAuth button
- GitHub OAuth button
- Facebook OAuth button

**File: `app/sign-up/page.tsx`**
- Email/password registration
- OAuth sign-up options
- Password validation

### ✅ Services
**File: `services/authService.ts`**
- `loginUser()` - Email/password login
- `registerUser()` - Email/password registration
- `loginWithGoogle()` - Google OAuth
- `loginWithGithub()` - GitHub OAuth
- `loginWithFacebook()` - Facebook OAuth
- `logoutUser()` - Sign out

### ✅ Middleware
**File: `middleware.ts`**
- Firebase token validation
- Protected route handling
- Public route configuration

### ✅ API Authentication
**File: `lib/api-auth.ts`**
- Token extraction from requests
- Middleware for protected API routes
- Error response helpers

## Setup Instructions

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable the following services:
   - **Authentication** (Email/Password, Google, GitHub, Facebook)
   - **Firestore Database**
   - **Cloud Storage**

### 2. Get Firebase Credentials
1. In Firebase Console, go to Project Settings
2. Copy your Web SDK config (public credentials)
3. Generate and download Admin SDK service account key (for server-side)

### 3. Configure Environment Variables
Update `.env.local` with your Firebase credentials:

```
# Firebase Configuration (PUBLIC - Safe for browser)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK (SECRET - Server-side only)
FIREBASE_ADMIN_SDK_KEY=your_admin_sdk_json_key
```

### 4. Enable OAuth Providers
In Firebase Console → Authentication → Sign-in method:

1. **Email/Password**
   - Enable Email/Password provider

2. **Google**
   - Enable Google provider
   - Configure OAuth consent screen
   - Add your domain to authorized domains

3. **GitHub**
   - Enable GitHub provider
   - Create OAuth app on GitHub
   - Set authorization callback URL: `https://your-domain.com/__/auth/handler`

4. **Facebook**
   - Enable Facebook provider
   - Create app on Facebook Developer Console
   - Set redirect URI: `https://your-domain.com/__/auth/handler`

### 5. Install Dependencies
```bash
pnpm install
```

### 6. Create Firestore Collections
Create these collections in Firestore:
- `users` - User profiles
- `userAlertSettings` - User alert settings
- `telegramLinkCodes` - Telegram linking codes

Or let the app create them automatically on first use (auto-creation is enabled in the code).

### 7. Run Development Server
```bash
pnpm dev
```

Visit `http://localhost:3000/sign-in` to test authentication.

## Database Schema

### `users` Collection
```typescript
{
  id: string           // Firebase UID
  email?: string
  name?: string
  image?: string
  emailVerified?: boolean
  telegramChatId?: string
  telegramUsername?: string
  telegramOptIn?: boolean
  telegramOptInAt?: Timestamp
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### `userAlertSettings` Collection
```typescript
{
  id: string
  userId: string       // Reference to users/
  selectedState: string
  browserEnabled: boolean       // Default: true
  telegramEnabled: boolean      // Default: false
  dailyDigestEnabled: boolean   // Default: true
  threshold: 'HIGH' | 'CRITICAL'
  cooldownMinutes: number       // Default: 60
  lastAlertSentAt?: Timestamp
  lastDailyDigestSentAt?: Timestamp
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### `telegramLinkCodes` Collection
```typescript
{
  id: string
  userId: string       // Reference to users/
  code: string         // Unique linking code
  expiresAt: Timestamp
  createdAt: Timestamp
}
```

## API Routes

### Existing API Routes
The following routes continue to work as before:
- `/api/disease-data` - Public
- `/api/healthcare` - Public
- `/api/predictions` - Public
- `/api/digest/state` - Public
- `/api/location/state` - Public
- `/api/telegram/webhook` - Public (secured by webhook secret)
- `/api/telegram/bot` - Public
- `/api/cron/risk-alerts` - Public (secured by cron secret)
- `/api/cron/daily-digest` - Public (secured by cron secret)

### Protected Routes
For creating new protected API routes, use the `withAuth` middleware:

```typescript
import { withAuth } from '@/lib/api-auth'
import type { NextRequest } from 'next/server'

export const POST = withAuth(async (request: NextRequest, decodedToken) => {
  const userId = decodedToken.uid
  // Your protected endpoint logic here
})
```

## Migration Checklist

- [x] Update dependencies
- [x] Create Firebase config files
- [x] Create Firestore utilities
- [x] Create Cloud Storage utilities
- [x] Update authentication pages
- [x] Update auth service layer
- [x] Update middleware
- [x] Create auth context provider
- [ ] Configure Firebase project (YOU DO THIS)
- [ ] Set up environment variables (YOU DO THIS)
- [ ] Set up OAuth providers (YOU DO THIS)
- [ ] Test authentication flows
- [ ] Migrate existing user data (if any)
- [ ] Set up Firebase Admin SDK (for server-side operations)
- [ ] Configure Telegram integration with new auth

## Important Notes

1. **Firebase Admin SDK**: For server-side token verification in API routes, you'll need to:
   - Install `firebase-admin` package
   - Initialize it with your service account key
   - Update `lib/api-auth.ts` to use actual verification

2. **Client-Side Only**: The current setup uses Firebase Client SDK, which is safe for browser usage.

3. **Data Migration**: If migrating from the old Prisma database, you'll need to manually export and import user data.

4. **Email Verification**: Consider enabling Firebase email verification in your auth flow.

5. **Security Rules**: Set up appropriate Firestore security rules:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read, write: if request.auth.uid == userId;
       }
       match /userAlertSettings/{document=**} {
         allow read, write: if request.auth != null;
       }
       match /telegramLinkCodes/{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

## Need Help?

- Firebase Documentation: https://firebase.google.com/docs
- Firebase Console: https://console.firebase.google.com
- Common Issues:
  - Make sure all `NEXT_PUBLIC_FIREBASE_*` variables are set
  - Enable required authentication methods in Firebase Console
  - Create Firestore collections before using the app
  - Check browser console for Firebase errors

## Next Steps

1. Set up Firebase project
2. Configure environment variables
3. Enable authentication providers
4. Test sign-in/sign-up flows
5. Verify data is being stored in Firestore
6. Set up Firebase Admin SDK for server-side operations
7. Update API routes as needed
8. Configure Firestore security rules
