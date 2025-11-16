# 🚀 HabitFlow Marketing Site - Deployment Guide

## Quick Start

```bash
cd web-marketing
npm install
npm run dev
```

Visit `http://localhost:3000` to see your site!

## 🌐 Deploy to Vercel (Recommended - 2 minutes)

Vercel is the easiest way to deploy this Next.js site:

### Option 1: Vercel Dashboard
1. Push to GitHub (already done! ✅)
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repo
5. Set root directory to `web-marketing`
6. Click "Deploy"

**Done!** Your site will be live at `your-project.vercel.app`

### Option 2: Vercel CLI
```bash
npm i -g vercel
cd web-marketing
vercel
```

Follow the prompts. Your site will be deployed in seconds!

### Custom Domain
In Vercel dashboard:
1. Go to Settings > Domains
2. Add `habitflow.app` (or your domain)
3. Update DNS records as instructed
4. SSL automatically configured ✨

## 🎨 Deploy to Netlify

```bash
cd web-marketing
npm run build
```

Then drag the `.next` folder to [app.netlify.com/drop](https://app.netlify.com/drop)

Or connect GitHub:
1. Go to [app.netlify.com](https://app.netlify.com)
2. Click "Add new site" > "Import from Git"
3. Select your repo
4. Base directory: `web-marketing`
5. Build command: `npm run build`
6. Publish directory: `.next`
7. Deploy!

## 📦 Static Export (Cloudflare Pages, AWS S3, etc.)

Update `next.config.ts`:
```typescript
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
}

export default nextConfig
```

Then:
```bash
npm run build
```

Deploy the `out/` folder to:
- **Cloudflare Pages**: Drag `out/` folder or connect GitHub
- **AWS S3**: `aws s3 sync out/ s3://your-bucket --delete`
- **GitHub Pages**: Copy `out/` to your gh-pages branch
- **Any CDN**: Upload `out/` folder

## 🔧 Environment Variables

No environment variables needed! This is a fully static site.

If you add analytics or APIs later:
- **Vercel**: Dashboard > Settings > Environment Variables
- **Netlify**: Dashboard > Site settings > Build & deploy > Environment
- **Local**: Create `.env.local` (never commit this!)

## ✅ Pre-Deployment Checklist

Before going live:

- [ ] Update `metadataBase` in `app/layout.tsx` to your actual domain
- [ ] Replace dummy testimonials with real ones
- [ ] Add actual app store links (currently dummy)
- [ ] Create and add OG image: `public/og-image.png` (1200x630px)
- [ ] Add app icons: `public/icon-192.png` and `public/icon-512.png`
- [ ] Update contact email in footer
- [ ] Test on real mobile devices
- [ ] Run Lighthouse audit (aim for 95+ score)
- [ ] Add analytics (Google Analytics, Plausible, etc.)
- [ ] Set up error monitoring (Sentry, etc.)

## 🎨 Customization Tips

### Change Brand Name
Find and replace "HabitFlow" in:
- `app/layout.tsx` (SEO metadata)
- `app/page.tsx` (all sections)
- `app/blog/page.tsx`
- `public/site.webmanifest`

### Change Colors
Edit `app/globals.css`:
```css
@theme inline {
  --color-brand-purple: #YourColor;
  --color-brand-pink: #YourColor;
  /* etc */
}
```

### Add Real Testimonials
Edit `app/page.tsx` around line 370:
```typescript
{[
  {
    name: "Your Customer",
    role: "Their Role",
    content: "Their actual testimonial",
    streak: "Real streak",
    avatar: "Initials",
  },
  // ... more testimonials
]}
```

### Add Real App Store Links
Update button `href` attributes in:
- `app/page.tsx` (CTA section, line ~540)

## 📊 Analytics Setup

### Vercel Analytics (Easiest)
```bash
npm install @vercel/analytics
```

Add to `app/layout.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Google Analytics
Add to `app/layout.tsx`:
```typescript
<Script
  src={`https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID`}
  strategy="afterInteractive"
/>
```

## 🔍 SEO Verification

After deployment:
1. Submit sitemap to Google Search Console:
   - `https://yoursite.com/sitemap.xml`
2. Verify robots.txt works:
   - `https://yoursite.com/robots.txt`
3. Test OG images:
   - Share on Twitter/LinkedIn/Facebook
   - Use [metatags.io](https://metatags.io)
4. Check mobile-friendliness:
   - [Google Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)

## 🐛 Troubleshooting

**Build fails with font errors:**
- This happens in sandboxed environments
- Will work fine on Vercel/Netlify (they have Google Fonts access)
- Alternative: Use local fonts (see `public/fonts/`)

**Site loads slowly:**
- Check image sizes (should be <200KB each)
- Enable image optimization on your platform
- Use WebP format for images
- Check Lighthouse report for specifics

**Links don't work:**
- Make sure all internal links use Next.js `<Link>` component
- Check that `href` values start with `/` for internal links

**Animations janky:**
- Reduce motion complexity
- Check `prefers-reduced-motion` is working
- Test on actual devices, not just browser DevTools

## 📞 Support

- **Documentation**: See `README.md`
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)

---

**Ready to launch?** 🚀

Deploy to Vercel now:
```bash
vercel --prod
```

Your beautiful marketing site will be live in under a minute!
