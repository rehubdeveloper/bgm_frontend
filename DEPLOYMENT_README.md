# Vercel Deployment Guide

## Environment Variables Setup

For your Vercel deployment to work properly, you need to set the following environment variables in your Vercel dashboard:

### Required Environment Variables:

1. **`NEXT_PUBLIC_API_BASE_URL`**
   - **Local Development**: `http://127.0.0.1:9000/api`
   - **Production**: Your deployed backend API URL (e.g., `https://your-backend-api.vercel.app/api` or `https://your-django-app.herokuapp.com/api`)

2. **`ADMIN_PIN_CODE`** (optional)
   - Default: `123456`
   - Used for admin PIN verification

### How to Set Environment Variables in Vercel:

1. Go to your Vercel dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:
   - **Name**: `NEXT_PUBLIC_API_BASE_URL`
   - **Value**: `https://your-backend-api-url.com/api` (replace with your actual backend URL)
   - **Environment**: `Production` (and optionally `Preview` and `Development`)

### Important Notes:

- The `NEXT_PUBLIC_` prefix makes the variable available in the browser
- Make sure your backend API has CORS enabled for your Vercel domain
- Test the API endpoints locally first before deploying

### Troubleshooting:

If you see "Failed to fetch dashboard statistics" or "backend service may not be running" errors:

1. Check that `NEXT_PUBLIC_API_BASE_URL` is set correctly in Vercel
2. Ensure your backend API is deployed and accessible
3. Verify CORS settings on your backend
4. Check that the API endpoints match your backend implementation

### Backend Requirements:

Your Django backend should have the following endpoints:
- `/api/admin-panel/members/` (GET)
- `/api/admin-panel/events/` (GET)
- `/api/admin-panel/testimonies/` (GET)
- `/api/admin-panel/sermons/` (GET)
- `/api/admin-panel/devotionals/` (GET)
- `/api/departments/` (GET)

All endpoints should require Bearer token authentication.
