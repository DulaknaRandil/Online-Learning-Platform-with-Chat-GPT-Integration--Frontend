# Vercel Deployment Guide

## Quick Setup

### 1. Environment Variables Setup

In your Vercel dashboard, go to **Project Settings > Environment Variables** and add:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://online-learning-platform-with-chat-eight.vercel.app/api` | Production, Preview, Development |
| `NEXT_PUBLIC_APP_URL` | `https://your-app-name.vercel.app` | Production, Preview, Development |

### 2. Common Issues & Solutions

#### Issue: Environment Variable References Secret Error
**Error**: `Environment Variable "NEXT_PUBLIC_API_URL" references Secret "next_public_api_url", which does not exist`

**Solution**: 
- Remove secret references from `vercel.json`
- Set environment variables directly in Vercel dashboard instead

#### Issue: Platform Dependencies Error
**Error**: `Unsupported platform for @next/swc-win32-x64-msvc`

**Solution**: 
- Ensure `package.json` doesn't contain Windows-specific SWC packages
- Let Next.js auto-install correct platform dependencies

### 3. Deployment Checklist

- [ ] Remove `package-lock.json` before deployment
- [ ] Set environment variables in Vercel dashboard
- [ ] Ensure all components export properly
- [ ] Test build locally with `npm run build`
- [ ] Push to GitHub
- [ ] Deploy on Vercel

### 4. Environment Variable Examples

**For Production:**
```
NEXT_PUBLIC_API_URL=https://online-learning-platform-with-chat-eight.vercel.app/api
NEXT_PUBLIC_APP_URL=https://your-frontend-app.vercel.app
```

**For Development:**
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Vercel Configuration

Your `vercel.json` should be simple:
```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "installCommand": "npm install --no-package-lock"
}
```

**Don't include environment variables in `vercel.json`** - set them in the dashboard instead.
