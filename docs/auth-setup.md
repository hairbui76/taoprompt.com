# Authentication Setup

This document explains how to set up the authentication system with Google and GitHub OAuth providers, along with the user management system using Supabase.

## Prerequisites

- A Supabase account and project
- GitHub OAuth application
- Google OAuth application

## Environment Variables

Add the following environment variables to your `.env.local` file:

```
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key

# GitHub OAuth
OAUTH_GITHUB_ID=your-github-client-id
OAUTH_GITHUB_SECRET=your-github-client-secret

# Google OAuth
OAUTH_GOOGLE_ID=your-google-client-id
OAUTH_GOOGLE_SECRET=your-google-client-secret

# Supabase Configuration
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Supabase Setup

1. Create a new Supabase project
2. Run the SQL migration script in the Supabase SQL editor:

```sql
-- Create enum for user status
CREATE TYPE user_status AS ENUM ('pending', 'verified', 'rejected');

-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('user', 'admin');

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  image TEXT,
  provider TEXT NOT NULL,
  status user_status NOT NULL DEFAULT 'pending',
  role user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Allow admins to view all users data
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Allow admins to update user status and role
CREATE POLICY "Admins can update users" ON users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_role ON users(role);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, image, provider, status, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'provider',
    'pending',
    CASE
      -- Make the first user an admin
      WHEN NOT EXISTS (SELECT 1 FROM public.users WHERE role = 'admin') THEN 'admin'
      -- Check if email is in predefined admin list
      WHEN new.email IN (SELECT unnest(string_to_array(current_setting('app.admin_emails', true), ','))) THEN 'admin'
      ELSE 'user'
    END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

3. Set the app.admin_emails parameter in Supabase:
   - Go to SQL Editor in Supabase dashboard
   - Run the following SQL command:

   ```sql
   ALTER SYSTEM SET app.admin_emails = 'admin@example.com,admin2@example.com';
   SELECT pg_reload_conf();
   ```

## Setting up OAuth Providers

### GitHub OAuth Setup

1. Go to GitHub Developer Settings: <https://github.com/settings/developers>
2. Create a new OAuth App
3. Set the Authorization callback URL to: `http://localhost:3000/api/auth/callback/github`
4. Copy the Client ID and Client Secret to your environment variables

### Google OAuth Setup

1. Go to Google Cloud Console: <https://console.cloud.google.com/>
2. Create a new project
3. Go to APIs & Services > Credentials
4. Create OAuth Client ID credentials
5. Set the Authorized redirect URI to: `http://localhost:3000/api/auth/callback/google`
6. Copy the Client ID and Client Secret to your environment variables

## User Management

- New users will start with "pending" status
- The first user to sign up will automatically be granted admin role
- Admins can manage users at `/admin` route
- Only verified users can access protected routes

## Test the Authentication Flow

1. Start the application: `npm run dev`
2. Navigate to `/auth/signin`
3. Sign in with GitHub or Google
4. The first user will automatically become an admin
5. Go to `/admin` to manage other users
