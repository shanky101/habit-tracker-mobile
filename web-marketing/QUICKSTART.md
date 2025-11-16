# 🚀 Quick Start Guide

## Get Running in 60 Seconds

```bash
# Navigate to the marketing site
cd web-marketing

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

**Done!** Open [http://localhost:3000](http://localhost:3000) in your browser.

## What You'll See

- **Homepage** (`/`) - Full marketing site with hero, features, testimonials, blog preview
- **Blog Index** (`/blog`) - All blog posts in a grid
- **Blog Posts** (`/blog/21-day-habit-myth`) - Individual blog articles

## Common Commands

```bash
# Development server (with hot reload)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Making Changes

### Update Colors
Edit `app/globals.css` (line 4-9):
```css
--color-brand-purple: #8B5CF6;
--color-brand-pink: #EC4899;
```

### Update Content
- **Homepage**: `app/page.tsx`
- **Blog Posts**: `app/blog/[slug]/page.tsx`
- **SEO Meta**: `app/layout.tsx`

### Add Blog Post
1. Add content to `blogContent` object in `app/blog/[slug]/page.tsx`
2. Add preview card in `app/blog/page.tsx`
3. Update sitemap in `app/sitemap.ts`

## Troubleshooting

**Port 3000 already in use?**
```bash
# Use a different port
PORT=3001 npm run dev
```

**Dependencies not installed?**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

**Changes not showing?**
- Hard refresh: `Cmd/Ctrl + Shift + R`
- Clear Next.js cache: `rm -rf .next`
- Restart dev server

## Deploy

**Vercel (Easiest):**
```bash
npm i -g vercel
vercel
```

**Other Platforms:**
See `DEPLOYMENT.md` for full guide

---

Need help? Check `README.md` for full documentation!
