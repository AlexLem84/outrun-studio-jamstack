# 🎨 Outrun Studio Site Personalization Guide

## Quick Customization Steps

### 1. 📞 Update Contact Information
**File:** `src/config/site.ts`
```typescript
contact: {
  phone: "(208) 555-0123", // ← Change this
  email: "hello@outrunstudio.com", // ← Change this  
  address: "Idaho Falls, ID", // ← Change this
}
```

### 2. 🎨 Change Brand Colors
**File:** `src/styles/global.css`
```css
:root {
  --outrun-primary: #1e40af;    /* ← Your main brand color */
  --outrun-secondary: #fbbf24;  /* ← Your accent color */
}
```

### 3. 🖼️ Update Your Logo
**Replace:** `public/images/logo-design-outrun-studio.png`
- Keep the same filename OR update the reference in `src/config/site.ts`

### 4. 📝 Customize Content
**File:** `src/config/site.ts`
- Update company name, tagline, descriptions
- Modify service offerings
- Change hero section text

### 5. 🔗 Add Social Media Links
**File:** `src/config/site.ts`
```typescript
social: {
  facebook: "https://facebook.com/yourpage",
  instagram: "https://instagram.com/yourpage", 
  linkedin: "https://linkedin.com/company/yourcompany",
}
```

## 🚀 After Making Changes

1. **Save your files**
2. **Commit changes:** `git add . && git commit -m "Update branding"`
3. **Push to GitHub:** `git push origin main`
4. **Vercel auto-deploys** in 1-2 minutes!

## 📁 Key Files to Edit

- `src/config/site.ts` - All your content and settings
- `src/styles/global.css` - Colors and styling
- `public/images/` - Your images and logos
- `src/components/` - Individual page sections

## 🎯 Pro Tips

- **Test locally:** Run `npm run dev` to see changes instantly
- **Use your brand colors** consistently throughout
- **Keep images optimized** (under 500KB each)
- **Update meta descriptions** for better SEO

## 📞 Need Help?

All your content is centralized in `src/config/site.ts` - this makes it super easy to update!
