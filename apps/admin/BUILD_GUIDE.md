# Admin Dashboard Build Guide

Complete guide for building and deploying the 태자월드 Admin Dashboard.

## Architecture Overview

The admin dashboard is a Next.js 14 application with the following architecture:

```
┌─────────────────────────────────────────────┐
│        태자월드 Admin Dashboard              │
│         (Next.js 14 App Router)              │
├─────────────────────────────────────────────┤
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │      Pages (App Router Routes)       │   │
│  │ /                     - Login         │   │
│  │ /dashboard            - Overview      │   │
│  │ /users                - List/Search   │   │
│  │ /users/[id]           - Detail        │   │
│  │ /reports              - List/Filter   │   │
│  │ /reports/[id]         - Detail        │   │
│  │ /broadcasts           - Log           │   │
│  │ /notices              - Manage        │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │      Components (UI & Layout)        │   │
│  │ - Button, Input, Card, Select        │   │
│  │ - DataTable, StatCard, StatusBadge   │   │
│  │ - SearchInput, ConfirmDialog         │   │
│  │ - AdminSidebar, AdminHeader          │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │  Libraries (Auth, API, Utils)        │   │
│  │ - auth.ts      - JWT token mgmt      │   │
│  │ - api-client.ts - HTTP client        │   │
│  │ - utils.ts     - Helper functions    │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │   Hooks (Custom React Hooks)         │   │
│  │ - useAuth      - Auth state mgmt     │   │
│  │ - usePagination - Pagination state   │   │
│  └──────────────────────────────────────┘   │
│                                              │
└─────────────────────────────────────────────┘
         │
         ├──► API Client (http://localhost:3000/api)
         │
         └──► Web App Backend
```

## File Structure

### Core Application Files

```
src/
├── app/
│   ├── layout.tsx                          # Root layout with metadata
│   ├── globals.css                         # Global styles & Tailwind
│   ├── page.tsx                            # Login page
│   └── (dashboard)/
│       ├── layout.tsx                      # Dashboard layout wrapper
│       ├── dashboard/
│       │   └── page.tsx                    # Dashboard overview
│       ├── users/
│       │   ├── page.tsx                    # User list & search
│       │   └── [userId]/
│       │       └── page.tsx                # User detail & moderation
│       ├── reports/
│       │   ├── page.tsx                    # Report list & filter
│       │   └── [reportId]/
│       │       └── page.tsx                # Report detail & actions
│       ├── broadcasts/
│       │   └── page.tsx                    # Broadcast log
│       └── notices/
│           ├── page.tsx                    # Notice list
│           ├── new/
│           │   └── page.tsx                # Create notice
│           └── [noticeId]/
│               └── edit/
│                   └── page.tsx            # Edit notice
│
├── components/
│   ├── ui/
│   │   ├── Button.tsx                      # Primary button component
│   │   ├── Input.tsx                       # Form input component
│   │   ├── Card.tsx                        # Card container
│   │   ├── Select.tsx                      # Dropdown select
│   │   ├── DataTable.tsx                   # Sortable data table
│   │   ├── StatCard.tsx                    # Stat display card
│   │   ├── StatusBadge.tsx                 # Status indicator
│   │   ├── SearchInput.tsx                 # Debounced search
│   │   └── ConfirmDialog.tsx               # Modal confirmation
│   └── layout/
│       ├── AdminSidebar.tsx                # Left navigation sidebar
│       ├── AdminHeader.tsx                 # Top header bar
│       └── ProtectedRoute.tsx              # Auth guard wrapper
│
├── lib/
│   ├── api-client.ts                       # HTTP client for API calls
│   ├── auth.ts                             # Auth utilities & token mgmt
│   └── utils.ts                            # Helper functions
│
└── hooks/
    ├── useAuth.ts                          # Auth state hook
    └── usePagination.ts                    # Pagination hook
```

### Configuration Files

```
Root Level:
├── package.json                            # Dependencies & scripts
├── tsconfig.json                           # TypeScript config
├── next.config.js                          # Next.js config
├── tailwind.config.ts                      # Tailwind CSS config
├── postcss.config.js                       # PostCSS config
├── .eslintrc.json                          # ESLint config
├── .gitignore                              # Git ignore rules
└── .env.local                              # Local env variables
```

## Technology Stack

### Core
- **Framework**: Next.js 14.2.0 (App Router)
- **Language**: TypeScript 5.4
- **React**: 18.2.0
- **Styling**: Tailwind CSS 3.4.0

### Development Tools
- **PostCSS**: 8.4.0 (CSS processing)
- **Autoprefixer**: 10.4.0 (Vendor prefixes)

## Installation & Setup

### Step 1: Install Dependencies

```bash
cd apps/admin
npm install
```

This installs:
- Next.js and React
- TypeScript and type definitions
- Tailwind CSS and PostCSS
- ESLint for code quality

### Step 2: Environment Configuration

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

For production:

```env
NEXT_PUBLIC_API_URL=https://api.taeja.com
```

### Step 3: Verify Structure

```bash
# Check if all files are in place
ls -la src/app/
ls -la src/components/
ls -la src/lib/
ls -la src/hooks/
```

## Development Workflow

### Start Development Server

```bash
npm run dev
```

Server runs on `http://localhost:3002`

**Features:**
- Hot reload on file changes
- Type checking during development
- CSS hot reload (no page refresh needed)
- Network requests go to http://localhost:3000/api

### Build for Production

```bash
npm run build
```

Outputs:
- Optimized bundle in `.next/`
- Type checking before build
- CSS optimization via Tailwind
- JavaScript minification
- Asset optimization

### Start Production Server

```bash
npm start
```

Server runs on `http://localhost:3002` using production build

## Login & Authentication

### Mock Test Account

```
Email: admin@taeja.com
Password: admin123
```

### Authentication Flow

1. User enters credentials on login page (`/`)
2. POST request to `/api/auth/login`
3. Backend validates and returns JWT token
4. Token stored in localStorage as `admin_token`
5. User data stored as `admin_user`
6. Redirect to `/dashboard`
7. All subsequent requests include `Authorization: Bearer <token>` header
8. Protected routes check `useAuth()` hook
9. If token invalid, redirect to login

### Token Management

- **Storage**: localStorage (browser persistence)
- **Format**: JWT Bearer token
- **Header**: `Authorization: Bearer <token>`
- **Expiration**: Handled by backend
- **Refresh**: Automatic on `/api/auth/me` call

## API Integration

### Base URL

All requests use this base URL (from `.env.local`):

```
http://localhost:3000/api
```

### API Client Usage

```typescript
import { adminApiClient } from '@/lib/api-client'
import { getAdminToken } from '@/lib/auth'

const token = getAdminToken()

// GET request
const data = await adminApiClient.get('/admin/users', { token })

// POST request
const result = await adminApiClient.post(
  '/admin/notices',
  { title: 'Test', content: 'Test content' },
  { token }
)

// PUT request
await adminApiClient.put(
  '/admin/notices/123',
  { title: 'Updated' },
  { token }
)

// DELETE request
await adminApiClient.delete('/admin/broadcasts/456', { token })
```

### Mock Data Fallback

All pages include mock data. If API fails:

```typescript
try {
  const data = await fetchFromAPI()
  setData(data)
} catch (error) {
  setData(MOCK_DATA)  // Fallback
}
```

This allows development without backend availability.

## Component System

### Using Components

#### Button
```tsx
<Button variant="primary" size="md" onClick={handleClick}>
  Save
</Button>
```

Variants: `primary`, `secondary`, `danger`, `warning`
Sizes: `sm`, `md`, `lg`

#### Input
```tsx
<Input
  label="Email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errorMessage}
  placeholder="user@example.com"
/>
```

#### Card
```tsx
<Card className="p-6">
  <h2>Title</h2>
  <p>Content</p>
</Card>
```

Options: `noPadding`, custom `className`

#### DataTable
```tsx
<DataTable
  columns={columns}
  data={data}
  keyField="id"
  onRowClick={handleClick}
  isLoading={loading}
  emptyMessage="No data"
/>
```

#### StatusBadge
```tsx
<StatusBadge status="active" />
<StatusBadge status="banned" />
<StatusBadge status="pending" />
```

## Styling Guide

### Theme Variables

```typescript
// Colors
--accent-blue: #3b82f6
--accent-green: #10b981
--accent-red: #ef4444
--accent-amber: #f59e0b

--dark-bg: #0f172a
--dark-sidebar: #1e293b
--dark-card: #1e293b
--dark-border: #334155
--dark-text: #e2e8f0
--dark-text-secondary: #94a3b8
```

### Spacing Scale

```
px-1 (0.25rem) → px-8 (2rem)
py-1 (0.25rem) → py-8 (2rem)
gap-1 (0.25rem) → gap-8 (2rem)
```

### Typography

```
text-xs → text-3xl
font-light → font-bold
```

### Responsive

```
sm: (640px)  → sm:grid-cols-2
md: (768px)  → md:flex-row
lg: (1024px) → lg:col-span-2
xl: (1280px) → xl:grid-cols-4
```

## Performance Optimization

### Code Splitting
- Page-level code splitting with App Router
- Each route loads only needed code
- Dynamic imports for heavy components

### Rendering
- Client components for interactivity
- Server components for static content
- Optimized re-renders with React hooks

### Data Fetching
- API calls on component mount
- Debounced search (300ms)
- Memoized callbacks with useCallback

### CSS
- Tailwind purges unused styles
- CSS-in-JS optimized at build time
- No runtime CSS overhead

### Caching
- Browser cache for static assets
- API response caching via localStorage
- Long-term caching strategies for production

## Deployment

### Docker Build

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3002
CMD ["npm", "start"]
```

### Environment Setup

Production `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://api.taeja.world
NODE_ENV=production
```

### Build & Deploy

```bash
# Build
npm run build

# Verify build
npm start

# Deploy to server
# (rsync, git push, docker push, etc.)
```

## Troubleshooting

### Build Errors

```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

### Type Errors

```bash
# Check types
npx tsc --noEmit

# Fix types in file
# Update tsconfig.json if needed
```

### Performance Issues

```bash
# Analyze bundle size
npm run build
du -sh .next

# Check network requests
# Open DevTools → Network tab
```

### API Connection Issues

```bash
# Test API endpoint
curl http://localhost:3000/api/admin/users

# Check environment variable
echo $NEXT_PUBLIC_API_URL

# Verify CORS if different domain
```

## File Checklist

### Configuration ✓
- [x] package.json
- [x] tsconfig.json
- [x] next.config.js
- [x] tailwind.config.ts
- [x] postcss.config.js
- [x] .eslintrc.json
- [x] .env.local

### Library Files ✓
- [x] src/lib/api-client.ts
- [x] src/lib/auth.ts
- [x] src/lib/utils.ts

### Hook Files ✓
- [x] src/hooks/useAuth.ts
- [x] src/hooks/usePagination.ts

### UI Components ✓
- [x] src/components/ui/Button.tsx
- [x] src/components/ui/Input.tsx
- [x] src/components/ui/Card.tsx
- [x] src/components/ui/Select.tsx
- [x] src/components/ui/DataTable.tsx
- [x] src/components/ui/StatCard.tsx
- [x] src/components/ui/StatusBadge.tsx
- [x] src/components/ui/SearchInput.tsx
- [x] src/components/ui/ConfirmDialog.tsx

### Layout Components ✓
- [x] src/components/layout/AdminSidebar.tsx
- [x] src/components/layout/AdminHeader.tsx
- [x] src/components/layout/ProtectedRoute.tsx

### Pages ✓
- [x] src/app/layout.tsx
- [x] src/app/page.tsx (Login)
- [x] src/app/(dashboard)/layout.tsx
- [x] src/app/(dashboard)/dashboard/page.tsx
- [x] src/app/(dashboard)/users/page.tsx
- [x] src/app/(dashboard)/users/[userId]/page.tsx
- [x] src/app/(dashboard)/reports/page.tsx
- [x] src/app/(dashboard)/reports/[reportId]/page.tsx
- [x] src/app/(dashboard)/broadcasts/page.tsx
- [x] src/app/(dashboard)/notices/page.tsx
- [x] src/app/(dashboard)/notices/new/page.tsx
- [x] src/app/(dashboard)/notices/[noticeId]/edit/page.tsx

### Styling ✓
- [x] src/app/globals.css

## Next Steps

1. **Verify Backend API**: Ensure web app is running on port 3000
2. **Test Login**: Try test credentials (admin@taeja.com / admin123)
3. **Check API Endpoints**: Verify all API routes exist and respond
4. **Mock Data Fallback**: Use included mock data for development
5. **Deploy**: Follow deployment guide for production

## Support

For issues:
1. Check browser console for errors
2. Check network tab for API calls
3. Review Next.js logs for server errors
4. Verify environment variables
5. Clear cache: `rm -rf .next`
