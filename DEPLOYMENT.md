# Deployment Guide

This guide will help you deploy the Coaching Management System to production using Vercel and Supabase.

## Prerequisites

- GitHub account
- Vercel account
- Supabase account
- Node.js 18+ installed locally

## Step 1: Set up Supabase

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `coaching-management-system`
   - Database Password: Generate a strong password
   - Region: Choose closest to your users
5. Click "Create new project"
6. Wait for the project to be ready (2-3 minutes)

### 1.2 Set up Database Schema

1. Go to the SQL Editor in your Supabase dashboard
2. Copy the contents of `supabase/schema.sql`
3. Paste it into the SQL Editor
4. Click "Run" to execute the schema

### 1.3 Get API Keys

1. Go to Settings > API in your Supabase dashboard
2. Copy the following values:
   - Project URL
   - Anon public key
   - Service role key (keep this secret!)

## Step 2: Deploy to Vercel

### 2.1 Prepare Repository

1. Push your code to a GitHub repository
2. Make sure all files are committed and pushed

### 2.2 Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - Framework Preset: Next.js
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

### 2.3 Set Environment Variables

In the Vercel project settings, add these environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_APP_URL=https://your-vercel-app.vercel.app
```

### 2.4 Deploy

1. Click "Deploy"
2. Wait for the deployment to complete
3. Your app will be available at `https://your-app-name.vercel.app`

## Step 3: Set up Email Notifications (Optional)

### 3.1 Using Resend (Recommended)

1. Sign up at [resend.com](https://resend.com)
2. Get your API key
3. Add to Vercel environment variables:
   ```
   RESEND_API_KEY=your_resend_api_key
   ```

### 3.2 Using SendGrid

1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Create an API key
3. Add to Vercel environment variables:
   ```
   SENDGRID_API_KEY=your_sendgrid_api_key
   ```

### 3.3 Using Gmail SMTP

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password
3. Add to Vercel environment variables:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   ```

## Step 4: Create Admin User

### 4.1 Using the Setup Script

1. Clone your repository locally
2. Install dependencies: `npm install`
3. Create a `.env.local` file with your Supabase credentials
4. Run the setup script:
   ```bash
   node scripts/setup-admin.js admin@yourdomain.com yourpassword
   ```

### 4.2 Using Supabase Dashboard

1. Go to Authentication > Users in your Supabase dashboard
2. Click "Add user"
3. Enter admin email and password
4. Go to Table Editor > users
5. Find the user and change role to 'admin'

## Step 5: Configure Domain (Optional)

### 5.1 Custom Domain

1. In Vercel dashboard, go to your project settings
2. Go to "Domains" tab
3. Add your custom domain
4. Follow the DNS configuration instructions

### 5.2 Update Supabase Settings

1. In Supabase dashboard, go to Authentication > URL Configuration
2. Add your production domain to "Site URL"
3. Add your domain to "Redirect URLs"

## Step 6: Production Checklist

- [ ] Database schema is deployed
- [ ] Environment variables are set
- [ ] Admin user is created
- [ ] Email notifications are configured
- [ ] Custom domain is set up (if applicable)
- [ ] SSL certificate is active
- [ ] Test all major functionality

## Step 7: Monitoring and Maintenance

### 7.1 Vercel Analytics

1. Enable Vercel Analytics in your project settings
2. Monitor performance and errors

### 7.2 Supabase Monitoring

1. Monitor database performance in Supabase dashboard
2. Set up alerts for high usage
3. Monitor authentication metrics

### 7.3 Regular Backups

1. Supabase automatically backs up your database
2. Consider setting up additional backup strategies for critical data

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check environment variables are set correctly
   - Ensure all dependencies are in package.json
   - Check build logs in Vercel dashboard

2. **Database Connection Issues**
   - Verify Supabase URL and keys are correct
   - Check if RLS policies are properly configured
   - Ensure database schema is deployed

3. **Authentication Issues**
   - Check if user roles are set correctly
   - Verify redirect URLs are configured
   - Check if email confirmation is required

4. **Email Notifications Not Working**
   - Verify email service credentials
   - Check if email templates are properly formatted
   - Test with a simple email first

### Getting Help

- Check the [Next.js documentation](https://nextjs.org/docs)
- Check the [Supabase documentation](https://supabase.com/docs)
- Check the [Vercel documentation](https://vercel.com/docs)
- Create an issue in the project repository

## Security Considerations

1. **Environment Variables**
   - Never commit sensitive keys to version control
   - Use Vercel's environment variable system
   - Rotate keys regularly

2. **Database Security**
   - Review and test RLS policies
   - Use service role key only for server-side operations
   - Monitor database access logs

3. **Authentication**
   - Use strong passwords
   - Enable email verification
   - Consider implementing rate limiting

4. **Data Privacy**
   - Ensure compliance with local data protection laws
   - Implement data retention policies
   - Regular security audits

## Performance Optimization

1. **Database**
   - Add appropriate indexes
   - Use database connection pooling
   - Monitor query performance

2. **Frontend**
   - Enable Vercel's edge caching
   - Optimize images and assets
   - Use Next.js built-in optimizations

3. **API**
   - Implement proper error handling
   - Use pagination for large datasets
   - Cache frequently accessed data
