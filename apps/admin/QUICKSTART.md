# Quick Start Guide - Admin Dashboard

Get the admin dashboard up and running in 5 minutes.

## Prerequisites

- Node.js 18 or higher
- npm (comes with Node.js)
- Running web app on http://localhost:3000

## 1. Install Dependencies

```bash
cd apps/admin
npm install
```

Wait for installation to complete (usually 2-3 minutes).

## 2. Start Development Server

```bash
npm run dev
```

You should see:
```
  ▲ Next.js 14.2.0
  - Local:        http://localhost:3002
```

## 3. Open in Browser

Navigate to: `http://localhost:3002`

You'll see the login page.

## 4. Login with Test Account

- **Email**: admin@taeja.com
- **Password**: admin123

Click "로그인" to login.

## 5. Explore Features

After login, you'll see the dashboard. Click on the menu items:

- **📊 대시보드** - Overview with metrics
- **👥 유저 관리** - Search and manage users
- **📋 신고 관리** - Handle user reports
- **📢 확성기 로그** - View broadcasts
- **📝 공지 관리** - Create/edit notices

## Common Commands

### Development
```bash
npm run dev          # Start dev server (localhost:3002)
```

### Building
```bash
npm run build        # Build for production
npm start            # Run production build
```

### Linting
```bash
npm run lint         # Check code quality
```

## Project Structure

```
src/
├── app/              # Next.js pages and routing
├── components/       # React components
│   ├── ui/          # Reusable UI components
│   └── layout/      # Layout components
├── lib/             # Utilities and API client
└── hooks/           # Custom React hooks
```

## Features Available

✅ **User Management** - List, search, filter, detail, moderation
✅ **Report Management** - View, filter, resolve, take action
✅ **Broadcast Log** - View and delete broadcasts
✅ **Notice Management** - Create, edit, delete, publish notices
✅ **Dashboard** - Real-time metrics and recent activity
✅ **Authentication** - Secure login with JWT

## Mock Data

Don't have backend ready? No problem!

All pages include mock data that activates automatically if API calls fail. You can still:
- Navigate all pages
- Search and filter data
- View details
- Test UI interactions

The mock data demonstrates the full functionality.

## Connecting to Backend

The dashboard automatically connects to: `http://localhost:3000/api`

To use your own API endpoint, edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://your-api-url:3000
```

Then restart the dev server.

## Troubleshooting

### Port 3002 already in use?

```bash
# Use different port
npm run dev -- -p 3003
```

### Dependencies not installing?

```bash
rm -rf node_modules package-lock.json
npm install
```

### Styles not showing?

```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

### Can't connect to API?

- Check web app is running on port 3000
- Check `.env.local` has correct API URL
- Check browser DevTools Network tab for errors

## Next Steps

1. ✅ Install and run
2. Test all features
3. Connect to your backend API
4. Customize styling if needed
5. Deploy to production

## File Changes Made

If you modify files, changes hot-reload automatically:
- Edit a `.tsx` file → Refresh browser
- Edit `.css` → Auto-refresh without reload
- Edit `next.config.js` → Restart dev server

## Deployment

Ready for production?

```bash
npm run build    # Create optimized build
npm start        # Start production server
```

See `BUILD_GUIDE.md` for detailed deployment instructions.

## Support

- **README.md** - Features and API docs
- **BUILD_GUIDE.md** - Architecture and deployment
- **IMPLEMENTATION_SUMMARY.md** - Complete project overview

## Key Files

| File | Purpose |
|------|---------|
| `src/app/page.tsx` | Login page |
| `src/app/(dashboard)/layout.tsx` | Dashboard wrapper |
| `src/lib/auth.ts` | Authentication logic |
| `src/lib/api-client.ts` | API requests |
| `src/components/ui/*` | Reusable components |

---

**That's it! You're ready to use the admin dashboard.** 🚀
