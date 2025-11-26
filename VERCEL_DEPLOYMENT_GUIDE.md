# ChefGPT - Vercel Deployment Guide

## Prerequisites
- GitHub account with this project pushed
- Vercel account (vercel.com)
- Clerk account with API keys
- OpenAI API key
- Database (Vercel Postgres, Supabase, or external Postgres)

## Step 1: Download Project from Replit

1. Click **Files** in the left sidebar
2. Right-click the root folder
3. Select **"Download as ZIP"**
4. Extract the ZIP file locally

## Step 2: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/chefgpt.git
git push -u origin main
```

## Step 3: Create Vercel Project

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Select your ChefGPT repository
5. Configure build settings:
   - **Framework**: Other
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

## Step 4: Add Environment Variables

In Vercel dashboard, go to **Settings → Environment Variables** and add:

```
CLERK_SECRET_KEY=your_clerk_secret
CLERK_PUBLISHABLE_KEY=your_clerk_public_key
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_public_key
OPENAI_API_KEY=your_openai_key
DATABASE_URL=your_database_url
NODE_ENV=production
```

## Step 5: Setup Database

### Option A: Vercel Postgres (Easiest)
1. In Vercel dashboard, go to **Storage → Create New → Postgres**
2. Accept defaults and create
3. Copy the DATABASE_URL to environment variables
4. Run migrations: `npm run db:push`

### Option B: Supabase
1. Create project at [supabase.com](https://supabase.com)
2. Copy connection string to DATABASE_URL
3. Run migrations: `npm run db:push`

### Option C: External Database
- Use the connection string from your database provider

## Step 6: Setup Clerk

1. Go to [Clerk](https://clerk.com)
2. Create application
3. Copy API keys to environment variables
4. Add Vercel domain to allowed origins in Clerk settings

## Step 7: Deploy

1. Click **Deploy** in Vercel
2. Wait for build to complete
3. Visit your production URL
4. Test the application

## Troubleshooting

### Build fails with DATABASE_URL error
- Make sure DATABASE_URL is set in environment variables
- Verify database is running and accessible

### Clerk authentication not working
- Check CLERK_SECRET_KEY and CLERK_PUBLISHABLE_KEY are correct
- Add your Vercel URL to Clerk allowed origins
- Clear browser cache and cookies

### OpenAI API errors
- Verify OPENAI_API_KEY is set correctly
- Check OpenAI account has API credits

## Post-Deployment

1. Test user signup and onboarding flow
2. Generate a recipe to verify OpenAI integration
3. Check database is storing data correctly
4. Monitor Vercel logs for any errors

## Scaling Considerations

- **Database**: Monitor connection limits, consider Vercel Postgres auto-scaling
- **API Rate Limits**: OpenAI has usage limits - set appropriate quotas
- **File Storage**: Consider adding file storage for recipe images (Vercel Blob, S3, etc.)
- **Caching**: Enable edge caching for static assets in Vercel

## Support

For issues:
1. Check Vercel logs: Dashboard → Deployments → Select deployment → Logs
2. Check database connection
3. Verify all environment variables are set
4. Review Clerk documentation at clerk.com/docs
