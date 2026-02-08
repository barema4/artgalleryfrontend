# Art Gallery Frontend Implementation Plan

## API Overview (Available Endpoints)

### Implemented APIs:
1. **Authentication** (`/api/v1/auth`)
   - Register, Login, Logout, Refresh Token
   - Password reset, Email verification

2. **Users** (`/api/v1/users`)
   - Profile management, Preferences
   - Admin user management

3. **Artists** (`/api/v1/artists`)
   - Artist profiles with verification/featured status
   - Follow/unfollow functionality
   - Social links, stats

4. **Artworks** (`/api/v1/artworks`)
   - Full CRUD with filtering
   - Status: DRAFT, AVAILABLE, SOLD, ON_EXHIBITION, ARCHIVED
   - Medium types: Oil, Acrylic, Watercolor, Digital, Photography, Sculpture, etc.
   - Image gallery support

5. **Media** (`/api/v1/media`)
   - File uploads to Cloudinary
   - Image management

---

## Design Inspiration (Google Arts & Culture Style)

- **Horizontal scrolling carousels** for featured content
- **Mixed grid layouts** (masonry/pinterest style)
- **Large hero sections** with featured artwork
- **Visual hierarchy** - larger cards for featured items
- **Clean, minimal UI** with focus on artwork imagery
- **Category browsing** with visual thumbnails
- **Artist spotlights** with profile cards
- **Immersive artwork detail pages**

---

## Implementation Phases

### Phase 1: Core Layout & Navigation
- [ ] Global layout component with header/footer
- [ ] Responsive navigation (desktop + mobile hamburger)
- [ ] Hero section component
- [ ] Footer with links and social icons

### Phase 2: Home Page
- [ ] Featured artwork hero slider
- [ ] "Explore by Category" horizontal scroll section
- [ ] Featured artists carousel
- [ ] Latest artworks masonry grid
- [ ] "Trending Now" section
- [ ] Newsletter signup section

### Phase 3: Artworks
- [ ] Artworks listing page with filters
  - Category, Medium, Price range, Status
  - Sort by: newest, popular, price
  - Grid/List view toggle
- [ ] Artwork detail page
  - Image gallery with zoom
  - Artist info sidebar
  - Related artworks
  - Share buttons
- [ ] Artwork card component

### Phase 4: Artists
- [ ] Artists listing page
  - Search, filter by verified/featured
  - Grid layout with artist cards
- [ ] Artist profile page
  - Cover image + profile photo
  - Bio, statement, social links
  - Artist's artworks grid
  - Follow button
  - Stats (followers, artworks, views)
- [ ] Artist card component

### Phase 5: Authentication
- [ ] Login page
- [ ] Register page
- [ ] Forgot password page
- [ ] Reset password page
- [ ] Email verification page
- [ ] Auth state management (Pinia store)
- [ ] Protected route middleware

### Phase 6: User Dashboard
- [ ] User profile page
- [ ] Edit profile form
- [ ] Preferences settings
- [ ] Followed artists list
- [ ] Favorites/saved artworks

### Phase 7: Artist Dashboard (for Artist role)
- [ ] Artist dashboard overview
- [ ] Manage artworks (CRUD)
- [ ] Upload artwork form
- [ ] Edit artwork form
- [ ] View analytics/stats

---

## Component Library

### UI Components (Tailwind-based)
- Button (primary, secondary, outline, ghost)
- Input, Textarea, Select
- Card (artwork, artist, category)
- Modal/Dialog
- Dropdown menu
- Tabs
- Badge/Tag
- Avatar
- Skeleton loader
- Toast notifications
- Pagination
- Breadcrumbs
- Image with lazy loading

### Layout Components
- Container
- Grid (responsive)
- Horizontal scroll container
- Masonry grid
- Section wrapper

### Feature Components
- ArtworkCard
- ArtistCard
- CategoryCard
- HeroSlider
- ImageGallery
- FilterSidebar
- SearchBar
- FollowButton
- ShareButtons
- PriceDisplay

---

## Pinia Stores

1. **auth.ts** - User authentication state
2. **artworks.ts** - Artworks data & filters (existing, needs API integration)
3. **artists.ts** - Artists data
4. **user.ts** - Current user profile & preferences
5. **ui.ts** - UI state (modals, sidebars, toasts)

---

## API Service Layer

Create `/app/services/` directory:
- `api.ts` - Base axios/fetch configuration
- `auth.service.ts` - Auth API calls
- `artworks.service.ts` - Artworks API calls
- `artists.service.ts` - Artists API calls
- `users.service.ts` - Users API calls
- `media.service.ts` - Media upload calls

---

## File Structure

```
app/
├── components/
│   ├── ui/
│   │   ├── Button.vue
│   │   ├── Input.vue
│   │   ├── Card.vue
│   │   ├── Modal.vue
│   │   └── ...
│   ├── layout/
│   │   ├── Header.vue
│   │   ├── Footer.vue
│   │   ├── Sidebar.vue
│   │   └── MobileNav.vue
│   ├── artwork/
│   │   ├── ArtworkCard.vue
│   │   ├── ArtworkGrid.vue
│   │   ├── ArtworkGallery.vue
│   │   └── ArtworkFilters.vue
│   ├── artist/
│   │   ├── ArtistCard.vue
│   │   ├── ArtistGrid.vue
│   │   └── FollowButton.vue
│   └── home/
│       ├── HeroSlider.vue
│       ├── FeaturedArtists.vue
│       ├── CategoryScroll.vue
│       └── NewsletterSignup.vue
├── layouts/
│   └── default.vue
├── pages/
│   ├── index.vue (home)
│   ├── artworks/
│   │   ├── index.vue (listing)
│   │   └── [slug].vue (detail)
│   ├── artists/
│   │   ├── index.vue (listing)
│   │   └── [slug].vue (profile)
│   ├── auth/
│   │   ├── login.vue
│   │   ├── register.vue
│   │   ├── forgot-password.vue
│   │   └── reset-password.vue
│   ├── dashboard/
│   │   ├── index.vue
│   │   ├── profile.vue
│   │   ├── preferences.vue
│   │   └── artist/
│   │       ├── artworks.vue
│   │       └── upload.vue
│   └── gallery.vue (existing)
├── stores/
│   ├── artworks.ts (existing)
│   ├── auth.ts
│   ├── artists.ts
│   ├── user.ts
│   └── ui.ts
├── services/
│   ├── api.ts
│   ├── auth.service.ts
│   ├── artworks.service.ts
│   ├── artists.service.ts
│   └── media.service.ts
├── middleware/
│   └── auth.ts
├── composables/
│   ├── useAuth.ts
│   ├── useArtworks.ts
│   └── useToast.ts
└── types/
    ├── artwork.ts
    ├── artist.ts
    ├── user.ts
    └── api.ts
```

---

## Priority Order for Implementation

### Week 1: Foundation
1. Set up API service layer with base configuration
2. Create default layout with header/footer
3. Build core UI components (Button, Card, Input)
4. Implement auth store and login/register pages

### Week 2: Core Pages
5. Build home page with hero and featured sections
6. Create artworks listing page with filters
7. Implement artwork detail page
8. Build artists listing and profile pages

### Week 3: User Features
9. User dashboard and profile management
10. Follow/unfollow artists functionality
11. Artist dashboard (if user is artist)
12. Artwork upload and management

### Week 4: Polish
13. Loading states and skeletons
14. Error handling and toast notifications
15. SEO optimization (meta tags, OG images)
16. Performance optimization (lazy loading, caching)
17. Mobile responsiveness refinement

---

## Environment Configuration

```env
NUXT_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1
NUXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
```

---

## Notes

- API uses JWT authentication with refresh tokens
- All list endpoints support pagination (page, limit)
- Artworks have multiple status states to handle
- Artists can be verified and/or featured
- Media uploads go through Cloudinary
