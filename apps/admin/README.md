# 태자월드 관리자 대시보드 (Taeja World Admin Dashboard)

Professional admin dashboard for 태자월드 built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- **Authentication**: Admin login with JWT token-based auth
- **Dashboard**: Overview of key metrics and recent activity
- **User Management**: View, search, filter, and manage users
- **Report Management**: Handle user reports with moderation actions
- **Broadcast Log**: Monitor and manage global broadcasts
- **Notice Management**: Create, edit, and publish announcements
- **Dark Theme**: Professional dark sidebar UI for extended use

## Project Structure

```
apps/admin/
├── src/
│   ├── app/
│   │   ├── (dashboard)/          # Protected dashboard routes
│   │   │   ├── dashboard/        # Dashboard overview
│   │   │   ├── users/            # User management
│   │   │   ├── reports/          # Report management
│   │   │   ├── broadcasts/       # Broadcast logs
│   │   │   └── notices/          # Notice management
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Login page
│   │   └── globals.css           # Global styles
│   ├── components/
│   │   ├── ui/                   # Reusable UI components
│   │   └── layout/               # Layout components
│   ├── lib/
│   │   ├── api-client.ts         # API client
│   │   ├── auth.ts               # Auth utilities
│   │   └── utils.ts              # Helper utilities
│   └── hooks/
│       ├── useAuth.ts            # Auth hook
│       └── usePagination.ts      # Pagination hook
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
├── postcss.config.js
└── package.json
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
cd apps/admin
npm install
```

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Development

```bash
npm run dev
```

Navigate to `http://localhost:3002`

### Build

```bash
npm run build
npm start
```

## Login Credentials

Test admin account:
- **Email**: admin@taeja.com
- **Password**: admin123

## Pages

### Login (`/`)
- Email and password authentication
- Admin role verification
- Token-based session management

### Dashboard (`/dashboard`)
- Key metrics cards (total users, active users, pending reports, active broadcasts)
- Recent reports (top 5)
- Recent signups (top 5)
- Quick links to management sections

### User Management (`/users`)
- List all users with pagination and sorting
- Search by nickname or email
- Filter by user status (active, banned, muted)
- Click to view detailed user info

### User Detail (`/users/[userId]`)
- User profile information
- Account status and resources (gems, points)
- Moderation actions:
  - Warn user
  - Mute (7 days)
  - Temporary ban (30 days)
  - Permanent ban
- Transaction history
- Inventory items
- Link to user's minihome

### Report Management (`/reports`)
- View all user reports
- Filter by status (pending, reviewed, resolved, dismissed)
- Click to view detailed report

### Report Detail (`/reports/[reportId]`)
- Reporter and reported user information
- Report reason, description, and evidence
- Admin notes section
- Moderation actions:
  - Warn the reported user
  - Mute (7 days)
  - Ban (30 days)
- Update report status
- Save notes

### Broadcast Log (`/broadcasts`)
- View all global broadcasts
- Filter by type (normal, premium)
- View count and timestamps
- Delete broadcasts

### Notice Management (`/notices`)
- List all notices with publication status
- Create new notice
- Edit existing notice
- Delete notice

### Create/Edit Notice (`/notices/new`, `/notices/[noticeId]/edit`)
- Title and content input
- Publish/draft toggle
- Live preview
- Auto-save functionality

## API Integration

The admin dashboard connects to the main web app's API routes at `http://localhost:3000/api/admin/`.

### Key Endpoints

- `GET /api/auth/login` - Admin login
- `GET /api/auth/me` - Get current admin
- `GET /api/admin/users` - List users
- `POST /api/admin/users/{userId}/action` - User moderation
- `GET /api/admin/reports` - List reports
- `PUT /api/admin/reports/{reportId}` - Update report
- `POST /api/admin/reports/{reportId}/action` - Report moderation
- `GET /api/admin/broadcasts` - List broadcasts
- `DELETE /api/admin/broadcasts/{broadcastId}` - Delete broadcast
- `GET /api/admin/notices` - List notices
- `POST /api/admin/notices` - Create notice
- `PUT /api/admin/notices/{noticeId}` - Update notice
- `DELETE /api/admin/notices/{noticeId}` - Delete notice

## UI Components

### Core Components
- **Button**: Variants (primary, secondary, danger, warning), sizes (sm, md, lg)
- **Input**: Text input with label and error support
- **Card**: Container component with consistent styling
- **Select**: Dropdown select with options
- **DataTable**: Sortable, paginated data table
- **StatCard**: Metric display card
- **StatusBadge**: Status indicator with color coding
- **SearchInput**: Debounced search with icon
- **ConfirmDialog**: Modal confirmation for destructive actions

## Styling

- **Theme**: Professional dark theme (dark sidebar, light text)
- **Colors**:
  - Primary: #3b82f6 (blue)
  - Success: #10b981 (green)
  - Danger: #ef4444 (red)
  - Warning: #f59e0b (amber)
- **Typography**: System UI sans-serif font
- **Spacing**: Tailwind spacing scale

## Features by Page

### Dashboard
- Real-time stat cards
- Recent activity feeds
- Quick navigation links
- Admin overview

### User Management
- Full-text search (nickname/email)
- Multi-filter options
- Click-to-detail navigation
- Comprehensive user info display

### Report Management
- Status-based filtering
- Detailed evidence tracking
- Admin notes capability
- One-click moderation actions

### Broadcast Logs
- Type filtering
- View count tracking
- Easy deletion

### Notice Management
- WYSIWYG-style editor
- Publish/draft states
- Live preview
- Full CRUD operations

## Performance

- Client-side pagination and sorting
- Debounced search (300ms)
- Lazy loading of user details
- Optimized re-renders with React hooks
- CSS-in-JS via Tailwind (production-optimized)

## Security

- JWT token-based authentication
- Admin role verification on all protected routes
- Secure token storage in localStorage
- Automatic logout on token expiration
- HTTPS-ready configuration

## Deployment

### Build for production:
```bash
npm run build
npm start
```

### Environment variables for production:
```env
NEXT_PUBLIC_API_URL=https://your-api.com
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers with viewport support

## Troubleshooting

### Login not working
- Check API URL in `.env.local`
- Verify admin user exists in database
- Check network tab for API errors

### Data not loading
- Verify API endpoints are accessible
- Check authentication token validity
- Review browser console for errors

### Styling issues
- Clear Next.js cache: `rm -rf .next`
- Rebuild Tailwind: `npm run build`
- Verify Tailwind config paths

## Development Tips

1. **Hot Reload**: Next.js dev server automatically reloads on file changes
2. **Type Safety**: TypeScript catches errors at compile time
3. **Component Reusability**: Use UI components from `/components/ui/`
4. **Mock Data**: All pages include fallback mock data for development
5. **API Debugging**: Open DevTools Network tab to inspect API calls

## Future Enhancements

- [ ] Analytics dashboard
- [ ] Batch user actions
- [ ] Advanced report filtering
- [ ] Email notification system
- [ ] Audit logs
- [ ] User backup/export
- [ ] A/B testing dashboard
- [ ] Real-time user activity
- [ ] Automated moderation rules
- [ ] Admin activity logs

## Support

For issues or questions, contact the development team.
