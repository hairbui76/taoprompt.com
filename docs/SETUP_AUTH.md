# Setting Up GitHub Authentication

To enable GitHub authentication in this project, follow these steps:

1. **Create a GitHub OAuth App**:
   - Go to your GitHub Settings > Developer Settings > OAuth Apps > New OAuth App
   - Set Application Name: `TaoPrompt` (or your preferred name)
   - Homepage URL: `http://localhost:3000` (or your production URL)
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github` (or your production URL equivalent)

2. **Add Environment Variables**:
   Create or update your `.env.local` file with these variables:
   ```
   # NextAuth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-generated-secret-key

   # GitHub OAuth
   GITHUB_ID=your-github-client-id
   GITHUB_SECRET=your-github-client-secret
   ```

3. **Generate a NextAuth Secret**:
   - You can generate a random string using `openssl rand -base64 32` in your terminal
   - Or use a secure random string generator online

4. **Replace Placeholder Values**:
   - Replace `your-generated-secret-key` with the generated secret
   - Replace `your-github-client-id` and `your-github-client-secret` with the values from your GitHub OAuth App